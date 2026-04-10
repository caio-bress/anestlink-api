import { z } from 'zod'

export const createAnesthesiologistProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string({ error: 'Nome completo é obrigatório' })
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .trim(),

    crm: z
      .string({ error: 'CRM é obrigatório' })
      .min(4, 'CRM inválido')
      .max(20, 'CRM inválido')
      .trim(),

    crmState: z
      .string({ error: 'Estado do CRM é obrigatório' })
      .length(2, 'Estado deve ter 2 caracteres')
      .toUpperCase(),

    bio: z
      .string()
      .max(1000, 'Bio deve ter no máximo 1000 caracteres')
      .trim()
      .optional(),
  }),
})

export const updateAnesthesiologistProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .trim()
      .optional(),

    bio: z
      .string()
      .max(1000, 'Bio deve ter no máximo 1000 caracteres')
      .trim()
      .optional(),
  }),
})

export type CreateAnesthesiologistProfileInput = z.infer<typeof createAnesthesiologistProfileSchema>['body']
export type UpdateAnesthesiologistProfileInput = z.infer<typeof updateAnesthesiologistProfileSchema>['body']