import { Request, Response, NextFunction } from 'express'
import * as availabilityService from './availability.service'
import type { UpdateAvailabilityInput } from './availability.schema'

export async function getAvailabilityController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await availabilityService.getAvailability(req.params.id)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function updateAvailabilityController(
  req: Request<{}, {}, UpdateAvailabilityInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await availabilityService.updateAvailability(req.userId, req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function listAvailableController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await availabilityService.listAvailableAnesthesiologists()
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}