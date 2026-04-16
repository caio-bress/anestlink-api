import { z } from 'zod'

export const createSpecialtySchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'Nome é obrigatório' })
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .trim(),
    description: z
      .string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres')
      .trim()
      .optional(),
  }),
})

export const linkSpecialtySchema = z.object({
  body: z.object({
    specialtyId: z
      .string({ error: 'ID da especialidade é obrigatório' })
      .uuid('ID inválido'),
  }),
})

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>['body']
export type LinkSpecialtyInput = z.infer<typeof linkSpecialtySchema>['body']