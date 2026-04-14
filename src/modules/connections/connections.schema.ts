import { z } from 'zod'

export const createConnectionSchema = z.object({
  body: z.object({
    anesthesiologistId: z
      .string({ error: 'ID do anestesista é obrigatório' })
      .uuid('ID inválido'),
    message: z
      .string()
      .max(500, 'Mensagem deve ter no máximo 500 caracteres')
      .trim()
      .optional(),
  }),
})

export const reviewSchema = z.object({
  body: z.object({
    rating: z
      .number({ error: 'Avaliação é obrigatória' })
      .int()
      .min(1, 'Avaliação mínima é 1')
      .max(5, 'Avaliação máxima é 5'),
    comment: z
      .string()
      .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
      .trim()
      .optional(),
  }),
})

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>['body']
export type ReviewInput = z.infer<typeof reviewSchema>['body']