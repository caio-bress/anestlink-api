"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryAttemptsTotal = exports.authFailuresTotal = exports.httpRequestDuration = exports.httpRequestsTotal = exports.registry = void 0;
const prom_client_1 = require("prom-client");
exports.registry = new prom_client_1.Registry();
(0, prom_client_1.collectDefaultMetrics)({ register: exports.registry }); // CPU, memória, event loop
exports.httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'route', 'status_code'],
    registers: [exports.registry],
});
exports.httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [exports.registry],
});
exports.authFailuresTotal = new prom_client_1.Counter({
    name: 'auth_failures_total',
    help: 'Total de falhas de autenticação',
    labelNames: ['reason'],
    registers: [exports.registry],
});
exports.retryAttemptsTotal = new prom_client_1.Counter({
    name: 'retry_attempts_total',
    help: 'Total de retentativas detectadas por IP',
    labelNames: ['route'],
    registers: [exports.registry],
});
