/* eslint-disable camelcase */
import dayjs from 'dayjs'
import { prisma } from './prisma'
import { google } from 'googleapis'

export const getGoogleOAuthToken = async (userId: string) => {
  const account = await prisma.account.findFirstOrThrow({
    where: {
      provider: 'google',
      user_id: userId,
    },
  })

  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })

  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  })

  if (!account.expires_at) {
    return auth
  }

  const isTokenExpired = dayjs(account.expires_at * 1000).isBefore(new Date())

  if (isTokenExpired) {
    const { credentials } = await auth.refreshAccessToken()
    const {
      access_token,
      expiry_date,
      id_token,
      refresh_token,
      scope,
      token_type,
    } = credentials

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token,
        id_token,
        refresh_token,
        scope,
        token_type,
        expires_at: expiry_date ? Math.floor(expiry_date / 1000) : null,
      },
    })

    auth.setCredentials({
      access_token,
      expiry_date,
      refresh_token,
    })
  }

  return auth
}
