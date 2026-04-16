import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { CreateHospitalInput, LinkHospitalInput } from './hospitals.schema'

export async function createHospital(input: CreateHospitalInput) {
  const existing = await prisma.hospital.findFirst({
    where: {
      name: input.name,
      city: input.city,
      state: input.state,
    },
  })

  if (existing) {
    throw AppError.conflict('Hospital já cadastrado')
  }

  return prisma.hospital.create({ data: input })
}

export async function listHospitals(state?: string, city?: string) {
  return prisma.hospital.findMany({
    where: {
      ...(state && { state }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
    },
    orderBy: [{ state: 'asc' }, { city: 'asc' }, { name: 'asc' }],
  })
}

export async function linkHospitalToAnesthesiologist(
  userId: string,
  input: LinkHospitalInput
) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const hospital = await prisma.hospital.findUnique({
    where: { id: input.hospitalId },
  })

  if (!hospital) {
    throw AppError.notFound('Hospital não encontrado')
  }

  const existing = await prisma.anesthesiologistHospital.findUnique({
    where: {
      anesthesiologistId_hospitalId: {
        anesthesiologistId: profile.id,
        hospitalId: input.hospitalId,
      },
    },
  })

  if (existing) {
    throw AppError.conflict('Hospital já vinculado ao seu perfil')
  }

  await prisma.anesthesiologistHospital.create({
    data: {
      anesthesiologistId: profile.id,
      hospitalId: input.hospitalId,
    },
  })

  return prisma.anesthesiologistProfile.findUnique({
    where: { userId },
    include: { hospitals: { include: { hospital: true } } },
  })
}

export async function unlinkHospitalFromAnesthesiologist(
  userId: string,
  hospitalId: string
) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const existing = await prisma.anesthesiologistHospital.findUnique({
    where: {
      anesthesiologistId_hospitalId: {
        anesthesiologistId: profile.id,
        hospitalId,
      },
    },
  })

  if (!existing) {
    throw AppError.notFound('Hospital não vinculado ao seu perfil')
  }

  await prisma.anesthesiologistHospital.delete({
    where: {
      anesthesiologistId_hospitalId: {
        anesthesiologistId: profile.id,
        hospitalId,
      },
    },
  })

  return { message: 'Hospital desvinculado com sucesso' }
}

export async function linkHospitalToSurgeon(
  userId: string,
  input: LinkHospitalInput
) {
  const profile = await prisma.surgeonProfile.findUnique({ where: { userId } })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const hospital = await prisma.hospital.findUnique({
    where: { id: input.hospitalId },
  })

  if (!hospital) {
    throw AppError.notFound('Hospital não encontrado')
  }

  const existing = await prisma.surgeonHospital.findUnique({
    where: {
      surgeonId_hospitalId: {
        surgeonId: profile.id,
        hospitalId: input.hospitalId,
      },
    },
  })

  if (existing) {
    throw AppError.conflict('Hospital já vinculado ao seu perfil')
  }

  await prisma.surgeonHospital.create({
    data: {
      surgeonId: profile.id,
      hospitalId: input.hospitalId,
    },
  })

  return prisma.surgeonProfile.findUnique({
    where: { userId },
    include: { hospitals: { include: { hospital: true } } },
  })
}

export async function unlinkHospitalFromSurgeon(
  userId: string,
  hospitalId: string
) {
  const profile = await prisma.surgeonProfile.findUnique({ where: { userId } })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const existing = await prisma.surgeonHospital.findUnique({
    where: {
      surgeonId_hospitalId: {
        surgeonId: profile.id,
        hospitalId,
      },
    },
  })

  if (!existing) {
    throw AppError.notFound('Hospital não vinculado ao seu perfil')
  }

  await prisma.surgeonHospital.delete({
    where: {
      surgeonId_hospitalId: {
        surgeonId: profile.id,
        hospitalId,
      },
    },
  })

  return { message: 'Hospital desvinculado com sucesso' }
}