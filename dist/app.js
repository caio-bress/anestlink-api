"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.logger = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const rateLimit_middleware_1 = require("./shared/middlewares/rateLimit.middleware");
const error_middleware_1 = require("./shared/middlewares/error.middleware");
const metrics_1 = require("./lib/metrics");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const surgeons_routes_1 = __importDefault(require("./modules/surgeons/surgeons.routes"));
const anesthesiologists_routes_1 = __importDefault(require("./modules/anesthesiologists/anesthesiologists.routes"));
const health_middleware_1 = require("./shared/middlewares/health.middleware");
const cors_1 = __importDefault(require("cors"));
exports.logger = (0, pino_1.default)({ level: 'info' });
exports.app = (0, express_1.default)();
// Segurança
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowed = [
            'http://localhost:3000',
            'http://localhost:5173', // Vite
            'http://localhost:3001', // React
            'https://anestlink.com.br',
            'https://app.anestlink.com.br',
        ];
        // permite chamadas sem origin (Insomnia, mobile, server-to-server)
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Origem não permitida pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// Logs estruturados
exports.app.use((0, pino_http_1.default)({ logger: exports.logger }));
// métricas
exports.app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics_1.registry.contentType);
    res.end(await metrics_1.registry.metrics());
});
// Rate limit global
exports.app.use('/api', rateLimit_middleware_1.apiRateLimit);
exports.app.use(express_1.default.json());
// Endpoint de métricas (proteja isso em produção!)
exports.app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics_1.registry.contentType);
    res.end(await metrics_1.registry.metrics());
});
// rotas
exports.app.use('/api/auth', auth_routes_1.default);
exports.app.use('/api/surgeons', surgeons_routes_1.default);
exports.app.use('/api/anesthesiologists', anesthesiologists_routes_1.default);
exports.app.get('/health', health_middleware_1.healthController);
exports.app.use(error_middleware_1.errorMiddleware);
