"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ error: 'Email é obrigatório' })
            .email('Email inválido')
            .toLowerCase(),
        password: zod_1.z
            .string({ error: 'Senha é obrigatória' })
            .min(8, 'Senha deve ter no mínimo 8 caracteres')
            .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
            .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
        role: zod_1.z.enum(['SURGEON', 'ANESTHESIOLOGIST'], {
            error: 'Tipo deve ser SURGEON ou ANESTHESIOLOGIST',
        }),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ error: 'Email é obrigatório' })
            .email('Email inválido')
            .toLowerCase(),
        password: zod_1.z.string({ error: 'Senha é obrigatória' }),
    }),
});
exports.refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string({ error: 'Refresh token é obrigatório' }),
    }),
});
exports.verifyEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z
            .string({ error: 'UserId é obrigatório' })
            .uuid('UserId inválido'),
        code: zod_1.z
            .string({ error: 'Código é obrigatório' })
            .length(6, 'Código deve ter 6 dígitos'),
    }),
});
