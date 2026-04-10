"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const AppError_1 = require("../errors/AppError");
function errorMiddleware(err, _req, res, _next) {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message,
        });
    }
    console.error(err);
    return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno no servidor.',
    });
}
