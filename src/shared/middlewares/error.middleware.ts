import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    })
  }

  console.error('ERRO NÃO TRATADO:', err)

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message,
  })
}