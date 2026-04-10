import { Request, Response, NextFunction } from 'express'
import * as anesthesiologistsService from './anesthesiologists.service'
import type { CreateAnesthesiologistProfileInput, UpdateAnesthesiologistProfileInput } from './anesthesiologists.schema'

export async function createProfileController(
  req: Request<{}, {}, CreateAnesthesiologistProfileInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await anesthesiologistsService.createProfile(req.userId, req.body)
    res.status(201).json(profile)
  } catch (err) {
    next(err)
  }
}

export async function getProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await anesthesiologistsService.getProfile(req.userId)
    res.status(200).json(profile)
  } catch (err) {
    next(err)
  }
}

export async function updateProfileController(
  req: Request<{}, {}, UpdateAnesthesiologistProfileInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await anesthesiologistsService.updateProfile(req.userId, req.body)
    res.status(200).json(profile)
  } catch (err) {
    next(err)
  }
}

export async function listAnesthesiologistsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const list = await anesthesiologistsService.listAnesthesiologists()
    res.status(200).json(list)
  } catch (err) {
    next(err)
  }
}

export async function getAnesthesiologistByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await anesthesiologistsService.getAnesthesiologistById(req.params.id)
    res.status(200).json(profile)
  } catch (err) {
    next(err)
  }
}