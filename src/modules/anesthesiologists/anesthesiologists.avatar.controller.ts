import { Request, Response, NextFunction } from 'express'
import * as avatarService from './anesthesiologists.avatar.service'

export async function uploadAvatarController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      return res.status(422).json({
        error: 'NO_FILE',
        message: 'Nenhum arquivo enviado',
      })
    }

    const result = await avatarService.uploadAvatar(req.userId, req.file)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function deleteAvatarController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await avatarService.deleteAvatar(req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}