import { Adapter } from 'next-auth/adapters'
import { prisma } from '../prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { parseCookies, destroyCookie } from 'nookies'

export function PrismaAdapter(
  req: NextApiRequest,
  res: NextApiResponse,
): Adapter {
  return {
    async createUser(user) {
      const cookieName = '@ignitecall:userId'
      const cookies = parseCookies({ req })

      const userIdOnCookies = cookies[cookieName]

      if (!userIdOnCookies) {
        throw new Error('user Id not found on cookies')
      }

      const prismaUser = await prisma.user.update({
        where: { id: userIdOnCookies },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      destroyCookie({ res }, cookieName, { path: '/' })

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: String(prismaUser.email),
        username: prismaUser.username,
        avatar_url: String(prismaUser.avatar_url),
        emailVerified: null,
      }
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        email: String(user.email),
        username: user.username,
        avatar_url: String(user.avatar_url),
        emailVerified: null,
      }
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        email: String(user.email),
        username: user.username,
        avatar_url: String(user.avatar_url),
        emailVerified: null,
      }
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_provider_account_id: {
            provider,
            provider_account_id: providerAccountId,
          },
        },
        include: {
          user: true,
        },
      })

      if (!account) {
        return null
      }

      const { user } = account

      return {
        id: user.id,
        name: user.name,
        email: String(user.email),
        username: user.username,
        avatar_url: String(user.avatar_url),
        emailVerified: null,
      }
    },
    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: String(prismaUser.email),
        username: prismaUser.username,
        avatar_url: String(prismaUser.avatar_url),
        emailVerified: null,
      }
    },
    async linkAccount(account) {
      await prisma.account.create({
        data: {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
          access_token: account.access_token,
          token_type: account.token_type,
        },
      })
    },
    async createSession({ sessionToken, userId, expires }) {
      await prisma.session.create({
        data: {
          user_id: userId,
          session_token: sessionToken,
          expires,
        },
      })

      return {
        sessionToken,
        expires,
        userId,
      }
    },
    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          session_token: sessionToken,
        },
      })
    },
    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: {
          session_token: sessionToken,
        },
        include: {
          user: true,
        },
      })

      if (!session) {
        return null
      }

      const { user } = session

      return {
        session: {
          userId: session.user_id,
          expires: session.expires,
          sessionToken: session.session_token,
        },
        user: {
          id: user.id,
          name: user.name,
          email: String(user.email),
          username: user.username,
          avatar_url: String(user.avatar_url),
          emailVerified: null,
        },
      }
    },
    async updateSession({ sessionToken, userId, expires }) {
      const prismaSession = await prisma.session.update({
        where: {
          session_token: sessionToken,
        },
        data: {
          expires,
          user_id: userId,
        },
      })

      return {
        sessionToken: prismaSession.session_token,
        userId: prismaSession.user_id,
        expires: prismaSession.expires,
      }
    },
  }
}
