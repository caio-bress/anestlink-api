import { Request, Response, NextFunction } from 'express'
import * as notificationsService from './notifications.service'

export async function listNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await notificationsService.listNotifications(req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function markAsReadController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await notificationsService.markAsRead(req.params.id, req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function markAllAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await notificationsService.markAllAsRead(req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function countUnreadController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await notificationsService.countUnread(req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}