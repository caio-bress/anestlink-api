import { Request, Response, NextFunction } from 'express'
import * as hospitalsService from './hospitals.service'
import type { CreateHospitalInput, LinkHospitalInput } from './hospitals.schema'

export async function createHospitalController(
  req: Request<{}, {}, CreateHospitalInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await hospitalsService.createHospital(req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function listHospitalsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { state, city } = req.query as { state?: string; city?: string }
    const result = await hospitalsService.listHospitals(state, city)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function linkAnesthesiologistHospitalController(
  req: Request<{}, {}, LinkHospitalInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await hospitalsService.linkHospitalToAnesthesiologist(req.userId, req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function unlinkAnesthesiologistHospitalController(
  req: Request<{ hospitalId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await hospitalsService.unlinkHospitalFromAnesthesiologist(
      req.userId,
      req.params.hospitalId
    )
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function linkSurgeonHospitalController(
  req: Request<{}, {}, LinkHospitalInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await hospitalsService.linkHospitalToSurgeon(req.userId, req.body)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function unlinkSurgeonHospitalController(
  req: Request<{ hospitalId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await hospitalsService.unlinkHospitalFromSurgeon(
      req.userId,
      req.params.hospitalId
    )
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}