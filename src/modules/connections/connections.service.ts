import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { CreateConnectionInput, ReviewInput } from './connections.schema'

// ─── create connection ────────────────────────────────────────────────────────

export async function createConnection(surgeonUserId: string, input: CreateConnectionInput) {
  const surgeonProfile = await prisma.surgeonProfile.findUnique({
    where: { userId: surgeonUserId },
  })

  if (!surgeonProfile) {
    throw AppError.notFound('Perfil de cirurgião não encontrado')
  }

  const anesthesiologist = await prisma.anesthesiologistProfile.findUnique({
    where: { id: input.anesthesiologistId },
  })

  if (!anesthesiologist) {
    throw AppError.notFound('Anestesista não encontrado')
  }

  const existing = await prisma.connection.findUnique({
    where: {
      surgeonId_anesthesiologistId: {
        surgeonId: surgeonProfile.id,
        anesthesiologistId: input.anesthesiologistId,
      },
    },
  })

  if (existing) {
    if (existing.status === 'PENDING') {
      throw AppError.conflict('Já existe um convite pendente para este anestesista')
    }
    if (existing.status === 'ACCEPTED') {
      throw AppError.conflict('Você já está conectado com este anestesista')
    }
  }

  const connection = await prisma.connection.create({
    data: {
      surgeonId: surgeonProfile.id,
      anesthesiologistId: input.anesthesiologistId,
      message: input.message,
    },
    include: {
      anesthesiologist: { select: { fullName: true } },
      surgeon: { select: { fullName: true } },
    },
  })

  // notificação para o anestesista
  await prisma.notification.create({
    data: {
      userId: anesthesiologist.userId,
      title: 'Novo convite de conexão',
      body: `Dr(a). ${surgeonProfile.fullName} enviou um convite de conexão.`,
      data: { connectionId: connection.id },
    },
  })

  return connection
}

// ─── list connections ─────────────────────────────────────────────────────────

export async function listConnections(userId: string, role: string) {
  if (role === 'SURGEON') {
    const surgeon = await prisma.surgeonProfile.findUnique({ where: { userId } })
    if (!surgeon) throw AppError.notFound('Perfil não encontrado')

    return prisma.connection.findMany({
      where: { surgeonId: surgeon.id },
      include: {
        anesthesiologist: {
          select: {
            fullName: true,
            avatarUrl: true,
            avgRating: true,
            reviewCount: true,
            plan: true,
            specialties: { include: { specialty: true } },
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  const anesthesiologist = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })
  if (!anesthesiologist) throw AppError.notFound('Perfil não encontrado')

  return prisma.connection.findMany({
    where: { anesthesiologistId: anesthesiologist.id },
    include: {
      surgeon: {
        select: {
          fullName: true,
          avatarUrl: true,
          crm: true,
          crmState: true,
        },
      },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── accept connection ────────────────────────────────────────────────────────

export async function acceptConnection(connectionId: string, userId: string) {
  const anesthesiologist = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })

  if (!anesthesiologist) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { surgeon: true },
  })

  if (!connection) {
    throw AppError.notFound('Conexão não encontrada')
  }

  if (connection.anesthesiologistId !== anesthesiologist.id) {
    throw AppError.forbidden('Você não tem permissão para aceitar este convite')
  }

  if (connection.status !== 'PENDING') {
    throw new AppError('Este convite não está pendente', 400, 'INVALID_STATUS')
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      status: 'ACCEPTED',
      respondedAt: new Date(),
    },
  })

  await prisma.notification.create({
    data: {
      userId: connection.surgeon.userId,
      title: 'Convite aceito',
      body: `Dr(a). ${anesthesiologist.fullName} aceitou seu convite de conexão.`,
      data: { connectionId },
    },
  })

  return updated
}

// ─── decline connection ───────────────────────────────────────────────────────

export async function declineConnection(connectionId: string, userId: string) {
  const anesthesiologist = await prisma.anesthesiologistProfile.findUnique({
    where: { userId },
  })

  if (!anesthesiologist) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { surgeon: true },
  })

  if (!connection) {
    throw AppError.notFound('Conexão não encontrada')
  }

  if (connection.anesthesiologistId !== anesthesiologist.id) {
    throw AppError.forbidden('Você não tem permissão para recusar este convite')
  }

  if (connection.status !== 'PENDING') {
    throw new AppError('Este convite não está pendente', 400, 'INVALID_STATUS')
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      status: 'DECLINED',
      respondedAt: new Date(),
    },
  })

  await prisma.notification.create({
    data: {
      userId: connection.surgeon.userId,
      title: 'Convite recusado',
      body: `Dr(a). ${anesthesiologist.fullName} recusou seu convite de conexão.`,
      data: { connectionId },
    },
  })

  return updated
}

// ─── cancel connection ────────────────────────────────────────────────────────

export async function cancelConnection(connectionId: string, userId: string) {
  const surgeon = await prisma.surgeonProfile.findUnique({ where: { userId } })

  if (!surgeon) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  })

  if (!connection) {
    throw AppError.notFound('Conexão não encontrada')
  }

  if (connection.surgeonId !== surgeon.id) {
    throw AppError.forbidden('Você não tem permissão para cancelar este convite')
  }

  if (connection.status !== 'PENDING') {
    throw new AppError('Apenas convites pendentes podem ser cancelados', 400, 'INVALID_STATUS')
  }

  return prisma.connection.update({
    where: { id: connectionId },
    data: { status: 'CANCELLED' },
  })
}

// ─── create review ────────────────────────────────────────────────────────────

export async function createReview(
  connectionId: string,
  userId: string,
  input: ReviewInput
) {
  const surgeon = await prisma.surgeonProfile.findUnique({ where: { userId } })

  if (!surgeon) {
    throw AppError.notFound('Perfil não encontrado')
  }

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { review: true },
  })

  if (!connection) {
    throw AppError.notFound('Conexão não encontrada')
  }

  if (connection.surgeonId !== surgeon.id) {
    throw AppError.forbidden('Você não tem permissão para avaliar esta conexão')
  }

  if (connection.status !== 'ACCEPTED') {
    throw new AppError('Só é possível avaliar conexões aceitas', 400, 'INVALID_STATUS')
  }

  if (connection.review) {
    throw AppError.conflict('Esta conexão já foi avaliada')
  }

  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        connectionId,
        rating: input.rating,
        comment: input.comment,
      },
    })

    // recalcula avgRating e reviewCount
    const stats = await tx.review.aggregate({
      where: {
        connection: {
          anesthesiologistId: connection.anesthesiologistId,
          status: 'ACCEPTED',
        },
      },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await tx.anesthesiologistProfile.update({
      where: { id: connection.anesthesiologistId },
      data: {
        avgRating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    })

    return newReview
  })

  return review
}

// ─── list reviews ─────────────────────────────────────────────────────────────

export async function listReviews(anesthesiologistId: string) {
  const profile = await prisma.anesthesiologistProfile.findUnique({
    where: { id: anesthesiologistId },
  })

  if (!profile) {
    throw AppError.notFound('Anestesista não encontrado')
  }

  return prisma.review.findMany({
    where: {
      connection: {
        anesthesiologistId,
        status: 'ACCEPTED',
      },
    },
    include: {
      connection: {
        select: {
          surgeon: {
            select: { fullName: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}