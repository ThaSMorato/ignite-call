import { Container, Header } from '../styles'
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@thasmorato-ignite-ui/react'
import {
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from './styles'
import { ArrowRight } from 'phosphor-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getWeekDays } from '@/utils/getWeekDays'
import { zodResolver } from '@hookform/resolvers/zod'
import { convertTimeInMinutes } from '@/utils/convertTimeInMinutes'
import { api } from '@/lib/axios'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

const timeIntervalFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Voce precisa selecionar pelo menos um dia da semana',
    })
    .transform((intervals) =>
      intervals.map(({ weekDay, startTime, endTime }) => {
        return {
          weekDay,
          startTimeInMinutes: convertTimeInMinutes(startTime),
          endTimeInMinutes: convertTimeInMinutes(endTime),
        }
      }),
    )
    .refine(
      (intervals) =>
        intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        ),
      {
        message:
          'Horario de termino deve ser pelo menos 1H distante do inicio ',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalFormSchema>

const TimeIntervals = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const router = useRouter()

  const handleSetTimeIntervals = async (data: unknown) => {
    const formData = data as TimeIntervalsFormOutput

    await api.post('/users/time-intervals', formData)

    await router.push('/register/update-profile')
  }

  const weekDays = getWeekDays()

  const intervals = watch('intervals')

  return (
    <>
      <NextSeo title="Selecione sua disponibilidade | Ignite Call" noindex />

      <Container>
        <Header>
          <Heading as="strong">Quase lá</Heading>
          <Text>
            Defina o intervalo de horários que você está disponível em cada dia
            da semana.
          </Text>

          <MultiStep size={4} currentStep={3} />
        </Header>
        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalsContainer>
            {fields.map((field, index) => (
              <IntervalItem key={field.id}>
                <IntervalDay>
                  <Controller
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox
                        onCheckedChange={(checked) =>
                          onChange(checked === true)
                        }
                        checked={value}
                      />
                    )}
                  />
                  <Text>{weekDays[field.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.startTime`)}
                  />
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.endTime`)}
                  />
                </IntervalInputs>
              </IntervalItem>
            ))}
          </IntervalsContainer>
          {errors.intervals && (
            <FormError size="sm">{errors.intervals.root?.message} </FormError>
          )}
          <Button type="submit" disabled={isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}

export default TimeIntervals
