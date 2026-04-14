import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { apiRateLimit } from './shared/middlewares/rateLimit.middleware'
import { metricsMiddleware } from './shared/middlewares/metrics.middleware'
import { errorMiddleware } from './shared/middlewares/error.middleware'
import { registry } from './lib/metrics'
import authRoutes from './modules/auth/auth.routes'
import surgeonsRoutes from './modules/surgeons/surgeons.routes'
import anesthesiologistsRoutes from './modules/anesthesiologists/anesthesiologists.routes'
import { healthController } from './shared/middlewares/health.middleware'
import cors from 'cors'
import connectionsRoutes from './modules/connections/connections.routes'

export const logger = pino({ level: 'info' })
export const app = express()

// Segurança
app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',  // Vite
      'http://localhost:3001',  // React
      'https://anestlink.com.br',
      'https://app.anestlink.com.br',
    ]

    // permite chamadas sem origin (Insomnia, mobile, server-to-server)
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Origem não permitida pelo CORS'))
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Logs estruturados
app.use(pinoHttp({ logger }))

// métricas
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType)
  res.end(await registry.metrics())
})

// Rate limit global
app.use('/api', apiRateLimit)

app.use(express.json())

// Endpoint de métricas (proteja isso em produção!)
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType)
  res.end(await registry.metrics())
})

// rotas
app.use('/api/auth', authRoutes)
app.use('/api/surgeons', surgeonsRoutes)
app.use('/api/anesthesiologists', anesthesiologistsRoutes)
app.get('/health', healthController)
app.use('/api/connections', connectionsRoutes)

app.use(errorMiddleware)