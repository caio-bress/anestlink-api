import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/AppError'

interface JwtPayload {
  sub: string
  role: string
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Token não fornecido'))
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload
    req.userId = payload.sub
    req.userRole = payload.role
    next()
  } catch {
    return next(AppError.unauthorized('Token inválido ou expirado'))
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.userRole)) {
      return next(AppError.forbidden('Você não tem permissão para acessar este recurso'))
    }
    next()
  }
}