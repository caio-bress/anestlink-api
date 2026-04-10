"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfile = createProfile;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.listAnesthesiologists = listAnesthesiologists;
exports.getAnesthesiologistById = getAnesthesiologistById;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../shared/errors/AppError");
async function createProfile(userId, input) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw AppError_1.AppError.notFound('Usuário não encontrado');
    }
    if (user.role !== 'ANESTHESIOLOGIST') {
        throw AppError_1.AppError.forbidden('Apenas anestesistas podem criar este perfil');
    }
    const existing = await prisma_1.prisma.anesthesiologistProfile.findUnique({ where: { userId } });
    if (existing) {
        throw AppError_1.AppError.conflict('Perfil já cadastrado');
    }
    const crmExists = await prisma_1.prisma.anesthesiologistProfile.findFirst({
        where: { crm: input.crm, crmState: input.crmState },
    });
    if (crmExists) {
        throw AppError_1.AppError.conflict('CRM já cadastrado');
    }
    const profile = await prisma_1.prisma.anesthesiologistProfile.create({
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
    const profile = await prisma_1.prisma.anesthesiologistProfile.findUnique({
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
    const existing = await prisma_1.prisma.anesthesiologistProfile.findUnique({ where: { userId } });
    if (!existing) {
        throw AppError_1.AppError.notFound('Perfil não encontrado');
    }
    const profile = await prisma_1.prisma.anesthesiologistProfile.update({
        where: { userId },
        data: {
            ...(input.fullName && { fullName: input.fullName }),
            ...(input.bio !== undefined && { bio: input.bio }),
        },
    });
    return profile;
}
async function listAnesthesiologists() {
    return prisma_1.prisma.anesthesiologistProfile.findMany({
        where: {
            user: {
                isActive: true,
                emailVerifiedAt: { not: null },
            },
        },
        include: {
            user: {
                select: {
                    email: true,
                    emailVerifiedAt: true,
                },
            },
        },
        orderBy: { avgRating: 'desc' },
    });
}
async function getAnesthesiologistById(id) {
    const profile = await prisma_1.prisma.anesthesiologistProfile.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    email: true,
                    emailVerifiedAt: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!profile) {
        throw AppError_1.AppError.notFound('Anestesista não encontrado');
    }
    return profile;
}
