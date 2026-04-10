"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
function validate(schema) {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                return res.status(422).json({
                    error: 'VALIDATION_ERROR',
                    message: 'Dados inválidos',
                    details: err.issues.map((e) => ({
                        field: e.path.slice(1).join('.'),
                        message: e.message,
                    })),
                });
            }
            next(err);
        }
    };
}
