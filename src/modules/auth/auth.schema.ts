import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ error: 'Email é obrigatório' })
      .email('Email inválido')
      .toLowerCase(),

    password: z
      .string({ error: 'Senha é obrigatória' })
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter ao menos um número'),

    role: z.enum(['SURGEON', 'ANESTHESIOLOGIST'], {
      error: 'Tipo deve ser SURGEON ou ANESTHESIOLOGIST',
    }),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: 'Email é obrigatório' })
      .email('Email inválido')
      .toLowerCase(),

    password: z.string({ error: 'Senha é obrigatória' }),
  }),
})

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string({ error: 'Refresh token é obrigatório' }),
  }),
})

export const verifyEmailSchema = z.object({
  body: z.object({
    userId: z
      .string({ error: 'UserId é obrigatório' })
      .uuid('UserId inválido'),
    code: z
      .string({ error: 'Código é obrigatório' })
      .length(6, 'Código deve ter 6 dígitos'),
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
export type RefreshInput = z.infer<typeof refreshSchema>['body']
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body']