import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { RegisterInput, LoginInput, RefreshInput } from './auth.schema'
import { sendVerificationEmail } from '../../lib/email'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_EXPIRES = '15m'
const REFRESH_EXPIRES = '7d'

// ─── helpers ────────────────────────────────────────────────────────────────

function generateAccessToken(userId: string, role: string) {
  return jwt.sign(
    { sub: userId, role, jti: crypto.randomUUID() },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  )
}

function generateRefreshToken(userId: string) {
  return jwt.sign(
    { sub: userId, jti: crypto.randomUUID() },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  )
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString()
}

// ─── register ───────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existing) {
    throw AppError.conflict('Este email já está cadastrado')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const verificationCode = generateVerificationCode()
  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role,
      },
    })

    await tx.verificationCode.create({
      data: {
        userId: newUser.id,
        code: verificationCode,
        type: 'EMAIL_VERIFICATION',
        expiresAt: verificationExpiresAt,
      },
    })

    return newUser
  })

  await sendVerificationEmail(user.email, verificationCode)

  return {
    message: 'Cadastro realizado. Verifique seu email para ativar a conta.',
    userId: user.id,
  }
}

// ─── login ──────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (!user) {
    throw AppError.unauthorized('Email ou senha inválidos')
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatch) {
    throw AppError.unauthorized('Email ou senha inválidos')
  }

  if (!user.emailVerifiedAt) {
    throw new AppError('Email não verificado', 403, 'EMAIL_NOT_VERIFIED')
  }

  if (!user.isActive) {
    throw new AppError('Conta desativada', 403, 'ACCOUNT_DISABLED')
  }

  const accessToken = generateAccessToken(user.id, user.role)
  const refreshToken = generateRefreshToken(user.id)
  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  }
}

// ─── refresh ─────────────────────────────────────────────────────────────────

export async function refresh(input: RefreshInput) {
  let payload: jwt.JwtPayload

  try {
    payload = jwt.verify(input.refreshToken, REFRESH_SECRET) as jwt.JwtPayload
  } catch {
    throw AppError.unauthorized('Refresh token inválido ou expirado')
  }

  const tokenHash = hashToken(input.refreshToken)

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!stored || stored.revokedAt !== null || stored.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token inválido ou expirado')
  }

  // revoga o token atual
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  })

  // gera e salva o novo token
  const newRefreshToken = generateRefreshToken(stored.userId)
  const newTokenHash = hashToken(newRefreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({
    data: {
      userId: stored.userId,
      tokenHash: newTokenHash,
      expiresAt,
    },
  })

  const accessToken = generateAccessToken(stored.userId, stored.user.role)

  return { accessToken, refreshToken: newRefreshToken }
}

// ─── logout ──────────────────────────────────────────────────────────────────

export async function logout(refreshToken: string) {
  const tokenHash = hashToken(refreshToken)

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  return { message: 'Logout realizado com sucesso' }
}

// ─── verify email ─────────────────────────────────────────────────────────────

export async function verifyEmail(userId: string, code: string) {
  const verification = await prisma.verificationCode.findFirst({
    where: {
      userId,
      code,
      type: 'EMAIL_VERIFICATION',
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  })

  if (!verification) {
    throw new AppError('Código inválido ou expirado', 400, 'INVALID_CODE')
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationCode.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    })

    await tx.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    })
  })

  return { message: 'Email verificado com sucesso' }
}