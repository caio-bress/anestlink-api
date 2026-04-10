import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'

export async function healthController(_req: Request, res: Response) {
  const start = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        status: 'ok',
        latency: `${Date.now() - start}ms`,
      },
    })
  } catch {
    return res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        status: 'error',
        latency: `${Date.now() - start}ms`,
      },
    })
  }
}