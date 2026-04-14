import { Request, Response, NextFunction } from 'express'
import * as connectionsService from './connections.service'
import type { CreateConnectionInput, ReviewInput } from './connections.schema'

export async function createConnectionController(
  req: Request<{}, {}, CreateConnectionInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await connectionsService.createConnection(req.userId, req.body)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function listConnectionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await connectionsService.listConnections(req.userId, req.userRole)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function acceptConnectionController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await connectionsService.acceptConnection(req.params.id, req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function declineConnectionController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await connectionsService.declineConnection(req.params.id, req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function cancelConnectionController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await connectionsService.cancelConnection(req.params.id, req.userId)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function createReviewController(
  req: Request<{ id: string }, {}, ReviewInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await connectionsService.createReview(
      req.params.id,
      req.userId,
      req.body
    )
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function listReviewsController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await connectionsService.listReviews(req.params.id)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}