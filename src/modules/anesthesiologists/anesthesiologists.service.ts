import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { CreateAnesthesiologistProfileInput, UpdateAnesthesiologistProfileInput } from './anesthesiologists.schema'

export async function createProfile(userId: string, input: CreateAnesthesiologistProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw AppError.notFound('Usuário não encontrado')
  }

  if (user.role !== 'ANESTHESIOLOGIST') {
    throw AppError.forbidden('Apenas anestesistas podem criar este perfil')
  }

  const existing = await prisma.anesthesiologistProfile.findUnique({ where: { userId } })

  if (existing) {
    throw AppError.conflict('Perfil já cadastrado')
  }

  const crmExists = await prisma.anesthesiologistProfile.findFirst({
    where: { crm: input.crm, crmState: input.crmState },
  })

  if (crmExists) {
    throw AppError.conflict('CRM já cadastrado')
  }

  const profile = await prisma.anesthesiologistProfile.create({
    data: {
      userId,
      fullName: input.fullName,
      crm: input.crm,
      crmState: input.crmState,
      bio: input.bio,
    },
  })

  return profile
}

export async function getProfile(userId: string) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
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
  })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  return profile
}

export async function updateProfile(userId: string, input: UpdateAnesthesiologistProfileInput) {
  const existing = await prisma.anesthesiologistProfile.findUnique({ where: { userId } })

  if (!existing) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const profile = await prisma.anesthesiologistProfile.update({
    where: { userId },
    data: {
      ...(input.fullName && { fullName: input.fullName }),
      ...(input.bio !== undefined && { bio: input.bio }),
    },
  })

  return profile
}

export async function listAnesthesiologists() {
  return prisma.anesthesiologistProfile.findMany({
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
  })
}

export async function getAnesthesiologistById(id: string) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
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
  })

  if (!profile) {
    throw AppError.notFound('Anestesista não encontrado')
  }

  return profile
}