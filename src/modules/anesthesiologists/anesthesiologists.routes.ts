import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware'
import { createAnesthesiologistProfileSchema, updateAnesthesiologistProfileSchema } from './anesthesiologists.schema'
import {
  createProfileController,
  getProfileController,
  updateProfileController,
  listAnesthesiologistsController,
  getAnesthesiologistByIdController,
} from './anesthesiologists.controller'

const router = Router()

router.use(authMiddleware)

// apenas anestesistas
router.post(
  '/profile',
  requireRole('ANESTHESIOLOGIST'),
  validate(createAnesthesiologistProfileSchema),
  createProfileController
)

router.get(
  '/profile',
  requireRole('ANESTHESIOLOGIST'),
  getProfileController
)

router.patch(
  '/profile',
  requireRole('ANESTHESIOLOGIST'),
  validate(updateAnesthesiologistProfileSchema),
  updateProfileController
)

// qualquer usuário autenticado pode listar e ver perfis
router.get('/', listAnesthesiologistsController)
router.get('/:id', getAnesthesiologistByIdController)

export default router