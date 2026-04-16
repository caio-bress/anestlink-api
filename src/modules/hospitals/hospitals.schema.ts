import { z } from 'zod'

export const createHospitalSchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'Nome é obrigatório' })
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .trim(),
    city: z
      .string({ error: 'Cidade é obrigatória' })
      .min(2, 'Cidade deve ter no mínimo 2 caracteres')
      .trim(),
    state: z
      .string({ error: 'Estado é obrigatório' })
      .length(2, 'Estado deve ter 2 caracteres')
      .toUpperCase(),
  }),
})

export const linkHospitalSchema = z.object({
  body: z.object({
    hospitalId: z
      .string({ error: 'ID do hospital é obrigatório' })
      .uuid('ID inválido'),
  }),
})

export type CreateHospitalInput = z.infer<typeof createHospitalSchema>['body']
export type LinkHospitalInput = z.infer<typeof linkHospitalSchema>['body']