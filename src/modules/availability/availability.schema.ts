import { z } from 'zod'

export const updateAvailabilitySchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'BUSY', 'VACATION'], {
      error: 'Status deve ser AVAILABLE, BUSY ou VACATION',
    }),
    unavailableUntil: z
      .string()
      .datetime({ message: 'Data inválida' })
      .optional()
      .nullable(),
    notes: z
      .string()
      .max(500, 'Notas deve ter no máximo 500 caracteres')
      .trim()
      .optional()
      .nullable(),
  }),
})

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>['body']