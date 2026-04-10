import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware'
import { createSurgeonProfileSchema, updateSurgeonProfileSchema } from './surgeons.schema'
import {
  createProfileController,
  getProfileController,
  updateProfileController,
  listSurgeonsController,
} from './surgeons.controller'

const router = Router()

// todas as rotas exigem autenticação
router.use(authMiddleware)

// apenas cirurgiões
router.post(
  '/profile',
  requireRole('SURGEON'),
  validate(createSurgeonProfileSchema),
  createProfileController
)

router.get(
  '/profile',
  requireRole('SURGEON'),
  getProfileController
)

router.patch(
  '/profile',
  requireRole('SURGEON'),
  validate(updateSurgeonProfileSchema),
  updateProfileController
)

// qualquer usuário autenticado pode listar cirurgiões
router.get('/', listSurgeonsController)

export default router