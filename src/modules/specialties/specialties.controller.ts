import { Request, Response, NextFunction } from 'express'
import * as specialtiesService from './specialties.service'
import type { CreateSpecialtyInput, LinkSpecialtyInput } from './specialties.schema'

export async function createSpecialtyController(
  req: Request<{}, {}, CreateSpecialtyInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await specialtiesService.createSpecialty(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function listSpecialtiesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await specialtiesService.listSpecialties()
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function linkSpecialtyController(
  req: Request<{}, {}, LinkSpecialtyInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await specialtiesService.linkSpecialty(req.userId, req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function unlinkSpecialtyController(
  req: Request<{ specialtyId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await specialtiesService.unlinkSpecialty(
      req.userId,
      req.params.specialtyId
    )
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}