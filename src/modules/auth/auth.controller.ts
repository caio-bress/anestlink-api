import { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'
import type { RegisterInput, LoginInput, RefreshInput, VerifyEmailInput } from './auth.schema'

export async function registerController(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function loginController(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.login(req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function refreshController(
  req: Request<{}, {}, RefreshInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.refresh(req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function logoutController(
  req: Request<{}, {}, RefreshInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.logout(req.body.refreshToken)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function verifyEmailController(
  req: Request<{}, {}, VerifyEmailInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.verifyEmail(req.body.userId, req.body.code)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}