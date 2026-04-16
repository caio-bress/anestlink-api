import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { CreateSpecialtyInput, LinkSpecialtyInput } from './specialties.schema'

export async function createSpecialty(input: CreateSpecialtyInput) {
  const existing = await prisma.specialty.findFirst({
    where: { name: { equals: input.name, mode: 'insensitive' } },
  })

  if (existing) {
    throw AppError.conflict('Especialidade já cadastrada')
  }

  return prisma.specialty.create({ data: input })
}

export async function listSpecialties() {
  return prisma.specialty.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { anesthesiologists: true } },
    },
  })
}

export async function linkSpecialty(userId: string, input: LinkSpecialtyInput) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const specialty = await prisma.specialty.findUnique({
    where: { id: input.specialtyId },
  })

  if (!specialty) {
    throw AppError.notFound('Especialidade não encontrada')
  }

  const existing = await prisma.anesthesiologistSpecialty.findUnique({
    where: {
      anesthesiologistId_specialtyId: {
        anesthesiologistId: profile.id,
        specialtyId: input.specialtyId,
      },
    },
  })

  if (existing) {
    throw AppError.conflict('Especialidade já vinculada ao seu perfil')
  }

  await prisma.anesthesiologistSpecialty.create({
    data: {
      anesthesiologistId: profile.id,
      specialtyId: input.specialtyId,
    },
  })

  return prisma.anesthesiologistProfile.findUnique({
    where: { userId },
    include: {
      specialties: { include: { specialty: true } },
    },
  })
}

export async function unlinkSpecialty(userId: string, specialtyId: string) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const existing = await prisma.anesthesiologistSpecialty.findUnique({
    where: {
      anesthesiologistId_specialtyId: {
        anesthesiologistId: profile.id,
        specialtyId,
      },
    },
  })

  if (!existing) {
    throw AppError.notFound('Especialidade não vinculada ao seu perfil')
  }

  await prisma.anesthesiologistSpecialty.delete({
    where: {
      anesthesiologistId_specialtyId: {
        anesthesiologistId: profile.id,
        specialtyId,
      },
    },
  })

  return { message: 'Especialidade desvinculada com sucesso' }
}