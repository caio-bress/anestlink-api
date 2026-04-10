import { Request, Response, NextFunction } from 'express'
import * as surgeonsService from './surgeons.service'
import type { CreateSurgeonProfileInput, UpdateSurgeonProfileInput } from './surgeons.schema'

export async function createProfileController(
  req: Request<{}, {}, CreateSurgeonProfileInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await surgeonsService.createProfile(req.userId, req.body)
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
    const profile = await surgeonsService.getProfile(req.userId)
    res.status(200).json(profile)
  } catch (err) {
    next(err)
  }
}

export async function updateProfileController(
  req: Request<{}, {}, UpdateSurgeonProfileInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await surgeonsService.updateProfile(req.userId, req.body)
    res.status(200).json(profile)
  } catch (err) {
    next(err)
  }
}

export async function listSurgeonsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const surgeons = await surgeonsService.listSurgeons()
    res.status(200).json(surgeons)
  } catch (err) {
    next(err)
  }
}