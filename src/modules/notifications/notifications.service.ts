import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification) {
    throw AppError.notFound('Notificação não encontrada')
  }

  if (notification.userId !== userId) {
    throw AppError.forbidden('Você não tem permissão para acessar esta notificação')
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })

  return { message: 'Todas as notificações foram marcadas como lidas' }
}

export async function countUnread(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  })

  return { unread: count }
}