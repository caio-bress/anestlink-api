"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = metricsMiddleware;
const metrics_1 = require("../../lib/metrics");
function metricsMiddleware(req, res, next) {
    const end = metrics_1.httpRequestDuration.startTimer();
    res.on('finish', () => {
        const route = req.route?.path ?? req.path;
        const labels = {
            method: req.method,
            route,
            status_code: String(res.statusCode),
        };
        metrics_1.httpRequestsTotal.inc(labels);
        end(labels);
    });
    next();
}
