"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSlowDown = exports.apiRateLimit = exports.authRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = require("express-slow-down");
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas tentativas. Tente novamente em 15 minutos.',
    },
});
exports.apiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite de requisições atingido.',
    },
});
exports.authSlowDown = (0, express_slow_down_1.slowDown)({
    windowMs: 15 * 60 * 1000,
    delayAfter: 5,
    delayMs: (used) => (used - 5) * 300,
});
