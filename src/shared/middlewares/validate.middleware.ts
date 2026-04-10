import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: err.issues.map((e) => ({
            field: e.path.slice(1).join('.'),
            message: e.message,
          })),
        })
      }
      next(err)
    }
  }
}