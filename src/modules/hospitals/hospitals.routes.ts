import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware'
import { createHospitalSchema, linkHospitalSchema } from './hospitals.schema'
import {
  createHospitalController,
  listHospitalsController,
  linkAnesthesiologistHospitalController,
  unlinkAnesthesiologistHospitalController,
  linkSurgeonHospitalController,
  unlinkSurgeonHospitalController,
} from './hospitals.controller'

const router = Router()

router.use(authMiddleware)

// listar e criar hospitais — qualquer autenticado
router.get('/', listHospitalsController)
router.post('/', validate(createHospitalSchema), createHospitalController)

// vincular/desvincular anestesista
router.post(
  '/anesthesiologist',
  requireRole('ANESTHESIOLOGIST'),
  validate(linkHospitalSchema),
  linkAnesthesiologistHospitalController
)

router.delete(
  '/anesthesiologist/:hospitalId',
  requireRole('ANESTHESIOLOGIST'),
  unlinkAnesthesiologistHospitalController
)

// vincular/desvincular cirurgião
router.post(
  '/surgeon',
  requireRole('SURGEON'),
  validate(linkHospitalSchema),
  linkSurgeonHospitalController
)

router.delete(
  '/surgeon/:hospitalId',
  requireRole('SURGEON'),
  unlinkSurgeonHospitalController
)

export default router