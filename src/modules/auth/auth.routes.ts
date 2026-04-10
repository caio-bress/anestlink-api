import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authRateLimit, authSlowDown } from '../../shared/middlewares/rateLimit.middleware'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
} from './auth.schema'
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  verifyEmailController,
} from './auth.controller'

const router = Router()

router.post(
  '/register',
  authSlowDown,
  authRateLimit,
  validate(registerSchema),
  registerController
)

router.post(
  '/login',
  authSlowDown,
  authRateLimit,
  validate(loginSchema),
  loginController
)

router.post(
  '/refresh',
  authRateLimit,
  validate(refreshSchema),
  refreshController
)

router.post(
  '/logout',
  validate(refreshSchema),
  logoutController
)

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  verifyEmailController
)

export default router