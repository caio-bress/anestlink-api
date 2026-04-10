import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { CreateSurgeonProfileInput, UpdateSurgeonProfileInput } from './surgeons.schema'

export async function createProfile(userId: string, input: CreateSurgeonProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw AppError.notFound('Usuário não encontrado')
  }

  if (user.role !== 'SURGEON') {
    throw AppError.forbidden('Apenas cirurgiões podem criar este perfil')
  }

  const existing = await prisma.surgeonProfile.findUnique({ where: { userId } })

  if (existing) {
    throw AppError.conflict('Perfil já cadastrado')
  }

  const crmExists = await prisma.surgeonProfile.findFirst({
    where: { crm: input.crm, crmState: input.crmState },
  })

  if (crmExists) {
    throw AppError.conflict('CRM já cadastrado')
  }

  const profile = await prisma.surgeonProfile.create({
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
  const profile = await prisma.surgeonProfile.findUnique({
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

export async function updateProfile(userId: string, input: UpdateSurgeonProfileInput) {
  const existing = await prisma.surgeonProfile.findUnique({ where: { userId } })

  if (!existing) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const profile = await prisma.surgeonProfile.update({
    where: { userId },
    data: {
      ...(input.fullName && { fullName: input.fullName }),
      ...(input.bio !== undefined && { bio: input.bio }),
    },
  })

  return profile
}

export async function listSurgeons() {
  return prisma.surgeonProfile.findMany({
    include: {
      user: {
        select: {
          email: true,
          emailVerifiedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}