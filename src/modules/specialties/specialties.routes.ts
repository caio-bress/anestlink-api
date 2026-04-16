import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware'
import { createSpecialtySchema, linkSpecialtySchema } from './specialties.schema'
import {
  createSpecialtyController,
  listSpecialtiesController,
  linkSpecialtyController,
  unlinkSpecialtyController,
} from './specialties.controller'

const router = Router()

router.use(authMiddleware)

// listar e criar especialidades — qualquer autenticado
router.get('/', listSpecialtiesController)
router.post('/', validate(createSpecialtySchema), createSpecialtyController)

// vincular/desvincular — apenas anestesistas
router.post(
  '/link',
  requireRole('ANESTHESIOLOGIST'),
  validate(linkSpecialtySchema),
  linkSpecialtyController
)

router.delete(
  '/link/:specialtyId',
  requireRole('ANESTHESIOLOGIST'),
  unlinkSpecialtyController
)

export default router