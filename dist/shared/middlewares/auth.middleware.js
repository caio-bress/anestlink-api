"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../errors/AppError");
function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(AppError_1.AppError.unauthorized('Token não fornecido'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        req.userId = payload.sub;
        req.userRole = payload.role;
        next();
    }
    catch {
        return next(AppError_1.AppError.unauthorized('Token inválido ou expirado'));
    }
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!roles.includes(req.userRole)) {
            return next(AppError_1.AppError.forbidden('Você não tem permissão para acessar este recurso'));
        }
        next();
    };
}
