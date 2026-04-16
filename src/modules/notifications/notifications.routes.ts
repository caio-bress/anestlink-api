import { Router } from 'express'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import {
  listNotificationsController,
  markAsReadController,
  markAllAsReadController,
  countUnreadController,
} from './notifications.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', listNotificationsController)
router.get('/unread/count', countUnreadController)
router.patch('/read-all', markAllAsReadController)
router.patch('/:id/read', markAsReadController)

export default router