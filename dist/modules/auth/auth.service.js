"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.verifyEmail = verifyEmail;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../shared/errors/AppError");
const email_1 = require("../../lib/email");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
// ─── helpers ────────────────────────────────────────────────────────────────
function generateAccessToken(userId, role) {
    return jsonwebtoken_1.default.sign({ sub: userId, role }, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES,
    });
}
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ sub: userId }, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES,
    });
}
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function generateVerificationCode() {
    return crypto_1.default.randomInt(100000, 999999).toString();
}
// ─── register ───────────────────────────────────────────────────────────────
async function register(input) {
    const existing = await prisma_1.prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existing) {
        throw AppError_1.AppError.conflict('Este email já está cadastrado');
    }
    const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const user = await prisma_1.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email: input.email,
                passwordHash,
                role: input.role,
            },
        });
        await tx.verificationCode.create({
            data: {
                userId: newUser.id,
                code: verificationCode,
                type: 'EMAIL_VERIFICATION',
                expiresAt: verificationExpiresAt,
            },
        });
        return newUser;
    });
    await (0, email_1.sendVerificationEmail)(user.email, verificationCode);
    return {
        message: 'Cadastro realizado. Verifique seu email para ativar a conta.',
        userId: user.id,
    };
}
// ─── login ──────────────────────────────────────────────────────────────────
async function login(input) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: input.email },
    });
    if (!user) {
        throw AppError_1.AppError.unauthorized('Email ou senha inválidos');
    }
    const passwordMatch = await bcryptjs_1.default.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
        throw AppError_1.AppError.unauthorized('Email ou senha inválidos');
    }
    if (!user.emailVerifiedAt) {
        throw new AppError_1.AppError('Email não verificado', 403, 'EMAIL_NOT_VERIFIED');
    }
    if (!user.isActive) {
        throw new AppError_1.AppError('Conta desativada', 403, 'ACCOUNT_DISABLED');
    }
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
}
// ─── refresh ─────────────────────────────────────────────────────────────────
async function refresh(input) {
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(input.refreshToken, REFRESH_SECRET);
    }
    catch {
        throw AppError_1.AppError.unauthorized('Refresh token inválido ou expirado');
    }
    const tokenHash = hashToken(input.refreshToken);
    const stored = await prisma_1.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });
    if (!stored || stored.revokedAt !== null || stored.expiresAt < new Date()) {
        throw AppError_1.AppError.unauthorized('Refresh token inválido ou expirado');
    }
    const newRefreshToken = generateRefreshToken(stored.userId);
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        await tx.refreshToken.create({
            data: {
                userId: stored.userId,
                tokenHash: newTokenHash,
                expiresAt,
            },
        });
    });
    const accessToken = generateAccessToken(stored.userId, stored.user.role);
    return { accessToken, refreshToken: newRefreshToken };
}
// ─── logout ──────────────────────────────────────────────────────────────────
async function logout(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await prisma_1.prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
    });
    return { message: 'Logout realizado com sucesso' };
}
// ─── verify email ─────────────────────────────────────────────────────────────
async function verifyEmail(userId, code) {
    const verification = await prisma_1.prisma.verificationCode.findFirst({
        where: {
            userId,
            code,
            type: 'EMAIL_VERIFICATION',
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
    });
    if (!verification) {
        throw new AppError_1.AppError('Código inválido ou expirado', 400, 'INVALID_CODE');
    }
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.verificationCode.update({
            where: { id: verification.id },
            data: { usedAt: new Date() },
        });
        await tx.user.update({
            where: { id: userId },
            data: { emailVerifiedAt: new Date() },
        });
    });
    return { message: 'Email verificado com sucesso' };
}
