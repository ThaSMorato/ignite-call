import Image from 'next/image'

import { Heading, Text } from '@thasmorato-ignite-ui/react'
import { Container, Hero, Preview } from './styles'
import { ClaimUsernameForm } from './components/ClaimUsernameForm'

import previewImage from '../../assets/app-preview.png'
import { NextSeo } from 'next-seo'

const Home = () => {
  return (
    <>
      <NextSeo
        title="Descomplique sua agenda | Ignite Call"
        description="Conecte seu calendário e permita que as pessoas marquem agendamentos no seu tempo livre."
      />
      <Container>
        <Hero>
          <Heading as="h1" size="4xl">
            Agendamento descomplicado
          </Heading>
          <Text size="xl">
            Conecte seu calendário e permita que as pessoas marquem agendamentos
            no seu tempo livre.
          </Text>
          <ClaimUsernameForm />
        </Hero>

        <Preview>
          <Image
            src={previewImage}
            height={400}
            quality={100}
            priority
            alt="calendario simbolizando a aplicacao"
          />
        </Preview>
      </Container>
    </>
  )
}

export default Home
