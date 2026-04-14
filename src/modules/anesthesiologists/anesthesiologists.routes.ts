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
import { uploadAvatar, handleUploadError } from '../../shared/middlewares/upload.middleware'
import {
  uploadAvatarController,
  deleteAvatarController,
} from './anesthesiologists.avatar.controller'

const router = Router()

router.use(authMiddleware)

// apenas anestesistas
router.post(
  '/profile',
  requireRole('ANESTHESIOLOGIST'),
  validate(createAnesthesiologistProfileSchema),
  createProfileController
)

router.post(
  '/avatar',
  requireRole('ANESTHESIOLOGIST'),
  uploadAvatar,
  handleUploadError,
  uploadAvatarController
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

router.delete(
  '/avatar',
  requireRole('ANESTHESIOLOGIST'),
  deleteAvatarController
)

// qualquer usuário autenticado pode listar e ver perfis
router.get('/', listAnesthesiologistsController)
router.get('/:id', getAnesthesiologistByIdController)

export default router