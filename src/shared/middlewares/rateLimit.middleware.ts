import rateLimit from 'express-rate-limit'
import { slowDown } from 'express-slow-down'

const isTest = process.env.NODE_ENV === 'test'

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 999999 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 999999 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Limite de requisições atingido.',
  },
})

export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: isTest ? 999999 : 5,
  delayMs: (used) => (used - 5) * 300,
})