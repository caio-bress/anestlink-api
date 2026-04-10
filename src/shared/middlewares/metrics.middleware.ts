import { Request, Response, NextFunction } from 'express'
import { httpRequestsTotal, httpRequestDuration } from '../../lib/metrics'

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpRequestDuration.startTimer()

  res.on('finish', () => {
    const route = req.route?.path ?? req.path
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    }
    httpRequestsTotal.inc(labels)
    end(labels)
  })

  next()
}