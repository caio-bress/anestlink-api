import multer from 'multer'
import { AppError } from '../errors/AppError'
import { Request, Response, NextFunction } from 'express'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Formato inválido. Use JPEG, PNG ou WebP'))
    }
  },
})

export const uploadAvatar = upload.single('avatar')

export function handleUploadError(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(422).json({
        error: 'FILE_TOO_LARGE',
        message: 'Arquivo muito grande. Máximo 5MB.',
      })
    }
  }

  if (err.message.includes('Formato inválido')) {
    return res.status(422).json({
      error: 'INVALID_FORMAT',
      message: err.message,
    })
  }

  next(err)
}