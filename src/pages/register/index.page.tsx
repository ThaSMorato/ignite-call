import { ArrowRight } from 'phosphor-react'
import { Container, Form, Header } from './styles'
import {
  Button,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@thasmorato-ignite-ui/react'

const Register = () => {
  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <Form as="form">
        <label>
          <Text size="sm">Username</Text>
          <TextInput prefix="ignite.com/" placeholder="username" />
        </label>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu nome" />
        </label>
        <Button type="submit">
          Proximo passo
          <ArrowRight />
        </Button>
      </Form>
    </Container>
  )
}

export default Register
