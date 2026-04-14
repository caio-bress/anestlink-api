import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware'
import { createSurgeonProfileSchema, updateSurgeonProfileSchema } from './surgeons.schema'
import { uploadAvatar, handleUploadError } from '../../shared/middlewares/upload.middleware'
import {
  uploadAvatarController,
  deleteAvatarController,
} from './surgeons.avatar.controller'
import {
  createProfileController,
  getProfileController,
  updateProfileController,
  listSurgeonsController,
} from './surgeons.controller'

const router = Router()

router.use(authMiddleware)

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

router.post(
  '/avatar',
  requireRole('SURGEON'),
  uploadAvatar,
  handleUploadError,
  uploadAvatarController
)

router.delete(
  '/avatar',
  requireRole('SURGEON'),
  deleteAvatarController
)

router.get('/', listSurgeonsController)

export default router