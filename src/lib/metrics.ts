import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client'

export const registry = new Registry()

collectDefaultMetrics({ register: registry }) // CPU, memória, event loop

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
})

export const authFailuresTotal = new Counter({
  name: 'auth_failures_total',
  help: 'Total de falhas de autenticação',
  labelNames: ['reason'],
  registers: [registry],
})

export const retryAttemptsTotal = new Counter({
  name: 'retry_attempts_total',
  help: 'Total de retentativas detectadas por IP',
  labelNames: ['route'],
  registers: [registry],
})