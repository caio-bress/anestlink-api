import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware'
import { updateAvailabilitySchema } from './availability.schema'
import {
  getAvailabilityController,
  updateAvailabilityController,
  listAvailableController,
} from './availability.controller'

const router = Router()

router.use(authMiddleware)

// listar anestesistas disponíveis — qualquer autenticado
router.get('/available', listAvailableController)

// ver disponibilidade de um anestesista pelo profile id
router.get('/:id', getAvailabilityController)

// atualizar própria disponibilidade — apenas anestesistas
router.put(
  '/',
  requireRole('ANESTHESIOLOGIST'),
  validate(updateAvailabilitySchema),
  updateAvailabilityController
)

export default router