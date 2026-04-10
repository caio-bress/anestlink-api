import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

const testUser = {
  email: 'test@anestlink.com',
  password: 'Senha123',
  role: 'SURGEON',
}

beforeEach(async () => {
  await prisma.verificationCode.deleteMany({ where: { user: { email: testUser.email } } })
  await prisma.refreshToken.deleteMany({ where: { user: { email: testUser.email } } })
  await prisma.surgeonProfile.deleteMany({ where: { user: { email: testUser.email } } })
  await prisma.user.deleteMany({ where: { email: testUser.email } })
})

describe('POST /api/auth/register', () => {
  it('deve registrar um novo usuário com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('userId')
    expect(res.body.message).toContain('Verifique seu email')
  })

  it('deve rejeitar email duplicado', async () => {
    await request(app).post('/api/auth/register').send(testUser)
    const res = await request(app).post('/api/auth/register').send(testUser)

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('CONFLICT')
  })

  it('deve rejeitar email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'invalido' })

    expect(res.status).toBe(422)
    expect(res.body.error).toBe('VALIDATION_ERROR')
  })

  it('deve rejeitar senha fraca', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, password: '123' })

    expect(res.status).toBe(422)
    expect(res.body.error).toBe('VALIDATION_ERROR')
  })

  it('deve rejeitar role inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, role: 'INVALID' })

    expect(res.status).toBe(422)
    expect(res.body.error).toBe('VALIDATION_ERROR')
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser)

    const user = await prisma.user.findUnique({ where: { email: testUser.email } })
    await prisma.user.update({
      where: { id: user!.id },
      data: { emailVerifiedAt: new Date() },
    })
  })

  it('deve fazer login com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    expect(res.body.user.email).toBe(testUser.email)
  })

  it('deve rejeitar senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'SenhaErrada123' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('UNAUTHORIZED')
  })

  it('deve rejeitar email não cadastrado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'naoexiste@teste.com', password: testUser.password })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('UNAUTHORIZED')
  })

  it('deve rejeitar login sem email verificado', async () => {
    await prisma.user.update({
      where: { email: testUser.email },
      data: { emailVerifiedAt: null },
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('EMAIL_NOT_VERIFIED')
  })
})

describe('POST /api/auth/refresh', () => {
  it('deve renovar o access token', async () => {
    await request(app).post('/api/auth/register').send(testUser)
    const user = await prisma.user.findUnique({ where: { email: testUser.email } })
    await prisma.user.update({
      where: { id: user!.id },
      data: { emailVerifiedAt: new Date() },
    })

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    expect(res.body.refreshToken).not.toBe(login.body.refreshToken)
  })

  it('deve rejeitar refresh token inválido', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'token-invalido' })

    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('deve fazer logout com sucesso', async () => {
    await request(app).post('/api/auth/register').send(testUser)
    const user = await prisma.user.findUnique({ where: { email: testUser.email } })
    await prisma.user.update({
      where: { id: user!.id },
      data: { emailVerifiedAt: new Date() },
    })

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: login.body.refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.message).toContain('Logout')
  })
})