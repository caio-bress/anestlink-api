import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import { uploadToS3, deleteFromS3 } from '../../lib/s3'

export async function uploadAvatar(userId: string, file: Express.Multer.File) {
  const profile = await prisma.anesthesiologistProfile.findUnique({ where: { userId } })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  if (profile.avatarUrl) {
    await deleteFromS3(profile.avatarUrl)
  }

  const avatarUrl = await uploadToS3(file, 'avatars/anesthesiologists', userId)

  const updated = await prisma.anesthesiologistProfile.update({
    where: { userId },
    data: { avatarUrl },
  })

  return { avatarUrl: updated.avatarUrl }
}

export async function deleteAvatar(userId: string) {
  const profile = await prisma.anesthesiologistProfile.findUnique({ where: { userId } })

  if (!profile) {
    throw AppError.notFound('Perfil não encontrado')
  }

  if (!profile.avatarUrl) {
    throw new AppError('Nenhum avatar para remover', 400, 'NO_AVATAR')
  }

  await deleteFromS3(profile.avatarUrl)

  await prisma.anesthesiologistProfile.update({
    where: { userId },
    data: { avatarUrl: null },
  })

  return { message: 'Avatar removido com sucesso' }
}