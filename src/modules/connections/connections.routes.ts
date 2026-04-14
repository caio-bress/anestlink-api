import { Router } from 'express'
import { validate } from '../../shared/middlewares/validate.middleware'
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware'
import { createConnectionSchema, reviewSchema } from './connections.schema'
import {
  createConnectionController,
  listConnectionsController,
  acceptConnectionController,
  declineConnectionController,
  cancelConnectionController,
  createReviewController,
  listReviewsController,
} from './connections.controller'

const router = Router()

router.use(authMiddleware)

// listar conexões — ambos os papéis
router.get('/', listConnectionsController)

// enviar convite — apenas cirurgiões
router.post(
  '/',
  requireRole('SURGEON'),
  validate(createConnectionSchema),
  createConnectionController
)

// aceitar convite — apenas anestesistas
router.patch(
  '/:id/accept',
  requireRole('ANESTHESIOLOGIST'),
  acceptConnectionController
)

// recusar convite — apenas anestesistas
router.patch(
  '/:id/decline',
  requireRole('ANESTHESIOLOGIST'),
  declineConnectionController
)

// cancelar convite — apenas cirurgiões
router.patch(
  '/:id/cancel',
  requireRole('SURGEON'),
  cancelConnectionController
)

// avaliar anestesista — apenas cirurgiões
router.post(
  '/:id/review',
  requireRole('SURGEON'),
  validate(reviewSchema),
  createReviewController
)

// listar avaliações de um anestesista — ambos
router.get(
  '/anesthesiologist/:id/reviews',
  listReviewsController
)

export default router