"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfile = createProfile;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.listSurgeons = listSurgeons;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../shared/errors/AppError");
async function createProfile(userId, input) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw AppError_1.AppError.notFound('Usuário não encontrado');
    }
    if (user.role !== 'SURGEON') {
        throw AppError_1.AppError.forbidden('Apenas cirurgiões podem criar este perfil');
    }
    const existing = await prisma_1.prisma.surgeonProfile.findUnique({ where: { userId } });
    if (existing) {
        throw AppError_1.AppError.conflict('Perfil já cadastrado');
    }
    const crmExists = await prisma_1.prisma.surgeonProfile.findFirst({
        where: { crm: input.crm, crmState: input.crmState },
    });
    if (crmExists) {
        throw AppError_1.AppError.conflict('CRM já cadastrado');
    }
    const profile = await prisma_1.prisma.surgeonProfile.create({
        data: {
            userId,
            fullName: input.fullName,
            crm: input.crm,
            crmState: input.crmState,
            bio: input.bio,
        },
    });
    return profile;
}
async function getProfile(userId) {
    const profile = await prisma_1.prisma.surgeonProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    email: true,
                    role: true,
                    emailVerifiedAt: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!profile) {
        throw AppError_1.AppError.notFound('Perfil não encontrado');
    }
    return profile;
}
async function updateProfile(userId, input) {
    const existing = await prisma_1.prisma.surgeonProfile.findUnique({ where: { userId } });
    if (!existing) {
        throw AppError_1.AppError.notFound('Perfil não encontrado');
    }
    const profile = await prisma_1.prisma.surgeonProfile.update({
        where: { userId },
        data: {
            ...(input.fullName && { fullName: input.fullName }),
            ...(input.bio !== undefined && { bio: input.bio }),
        },
    });
    return profile;
}
async function listSurgeons() {
    return prisma_1.prisma.surgeonProfile.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    emailVerifiedAt: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
