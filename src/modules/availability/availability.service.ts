import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { UpdateAvailabilityInput } from './availability.schema'

export async function getAvailability(anesthesiologistId: string) {
  const availability = await prisma.availability.findUnique({
    where: { anesthesiologistId },
    include: {
      anesthesiologist: {
        select: { fullName: true, avatarUrl: true, avgRating: true },
      },
    },
  })

  if (!availability) {
    return { status: 'AVAILABLE', notes: null, unavailableUntil: null }
  }

  return availability
}

export async function updateAvailability(userId: string, input: UpdateAvailabilityInput) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const availability = await prisma.availability.upsert({
    where: { anesthesiologistId: profile.id },
    update: {
      status: input.status,
      unavailableUntil: input.unavailableUntil ? new Date(input.unavailableUntil) : null,
      notes: input.notes,
    },
    create: {
      anesthesiologistId: profile.id,
      status: input.status,
      unavailableUntil: input.unavailableUntil ? new Date(input.unavailableUntil) : null,
      notes: input.notes,
    },
  })

  return availability
}

export async function listAvailableAnesthesiologists() {
  return prisma.anesthesiologistProfile.findMany({
    where: {
      OR: [
        { availability: null },
        { availability: { status: 'AVAILABLE' } },
      ],
      user: {
        isActive: true,
        emailVerifiedAt: { not: null },
      },
    },
    include: {
      availability: true,
      specialties: { include: { specialty: true } },
      user: {
        select: { email: true },
      },
    },
    orderBy: [
      { plan: 'desc' },
      { avgRating: 'desc' },
    ],
  })
}