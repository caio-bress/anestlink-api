"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSurgeonProfileSchema = exports.createSurgeonProfileSchema = void 0;
const zod_1 = require("zod");
exports.createSurgeonProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z
            .string({ error: 'Nome completo é obrigatório' })
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .trim(),
        crm: zod_1.z
            .string({ error: 'CRM é obrigatório' })
            .min(4, 'CRM inválido')
            .max(20, 'CRM inválido')
            .trim(),
        crmState: zod_1.z
            .string({ error: 'Estado do CRM é obrigatório' })
            .length(2, 'Estado deve ter 2 caracteres')
            .toUpperCase(),
        bio: zod_1.z
            .string()
            .max(1000, 'Bio deve ter no máximo 1000 caracteres')
            .trim()
            .optional(),
    }),
});
exports.updateSurgeonProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z
            .string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .trim()
            .optional(),
        bio: zod_1.z
            .string()
            .max(1000, 'Bio deve ter no máximo 1000 caracteres')
            .trim()
            .optional(),
    }),
});
