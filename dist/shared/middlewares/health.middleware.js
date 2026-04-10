"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = healthController;
const prisma_1 = require("../../lib/prisma");
async function healthController(_req, res) {
    const start = Date.now();
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        return res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            database: {
                status: 'ok',
                latency: `${Date.now() - start}ms`,
            },
        });
    }
    catch {
        return res.status(503).json({
            status: 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            database: {
                status: 'error',
                latency: `${Date.now() - start}ms`,
            },
        });
    }
}
