import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

const surgeonUser = {
  email: 'surgeon-conn-test@anestlink.com',
  password: 'Senha123',
  role: 'SURGEON',
}

const anesthesiologistUser = {
  email: 'anest-conn-test@anestlink.com',
  password: 'Senha123',
  role: 'ANESTHESIOLOGIST',
}

async function createAndLoginUser(user: typeof surgeonUser) {
  await request(app).post('/api/auth/register').send(user)
  await prisma.user.update({
    where: { email: user.email },
    data: { emailVerifiedAt: new Date() },
  })
  const login = await request(app).post('/api/auth/login').send({
    email: user.email,
    password: user.password,
  })
  return login.body.accessToken as string
}

async function createProfile(token: string, role: string) {
  if (role === 'SURGEON') {
    const res = await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Dr. Teste', crm: '111111', crmState: 'SP' })
    return res.body
  }

  const res = await request(app)
    .post('/api/anesthesiologists/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({ fullName: 'Dra. Teste', crm: '222222', crmState: 'RJ' })
  return res.body
}

beforeEach(async () => {
  await prisma.connection.deleteMany({
    where: {
      surgeon: { user: { email: surgeonUser.email } },
    },
  })
  await prisma.surgeonProfile.deleteMany({
    where: { user: { email: surgeonUser.email } },
  })
  await prisma.anesthesiologistProfile.deleteMany({
    where: { user: { email: anesthesiologistUser.email } },
  })
  await prisma.verificationCode.deleteMany({
    where: { user: { email: { in: [surgeonUser.email, anesthesiologistUser.email] } } },
  })
  await prisma.refreshToken.deleteMany({
    where: { user: { email: { in: [surgeonUser.email, anesthesiologistUser.email] } } },
  })
  await prisma.notification.deleteMany({
    where: { user: { email: { in: [surgeonUser.email, anesthesiologistUser.email] } } },
  })
  await prisma.user.deleteMany({
    where: { email: { in: [surgeonUser.email, anesthesiologistUser.email] } },
  })
})

describe('POST /api/connections', () => {
  it('deve enviar convite com sucesso', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const res = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id, message: 'Olá!' })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('PENDING')
  })

  it('deve rejeitar convite duplicado', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    const res = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    expect(res.status).toBe(409)
  })

  it('deve rejeitar envio por anestesista', async () => {
    const anestToken = await createAndLoginUser(anesthesiologistUser)
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const res = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${anestToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    expect(res.status).toBe(403)
  })
})

describe('PATCH /api/connections/:id/accept', () => {
  it('deve aceitar convite com sucesso', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const conn = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    const res = await request(app)
      .patch(`/api/connections/${conn.body.id}/accept`)
      .set('Authorization', `Bearer ${anestToken}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ACCEPTED')
  })

  it('deve rejeitar aceite por cirurgião', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const conn = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    const res = await request(app)
      .patch(`/api/connections/${conn.body.id}/accept`)
      .set('Authorization', `Bearer ${surgeonToken}`)

    expect(res.status).toBe(403)
  })
})

describe('PATCH /api/connections/:id/decline', () => {
  it('deve recusar convite com sucesso', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const conn = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    const res = await request(app)
      .patch(`/api/connections/${conn.body.id}/decline`)
      .set('Authorization', `Bearer ${anestToken}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('DECLINED')
  })
})

describe('PATCH /api/connections/:id/cancel', () => {
  it('deve cancelar convite com sucesso', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const conn = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    const res = await request(app)
      .patch(`/api/connections/${conn.body.id}/cancel`)
      .set('Authorization', `Bearer ${surgeonToken}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })
})

describe('POST /api/connections/:id/review', () => {
  it('deve avaliar anestesista com sucesso', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const conn = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    await request(app)
      .patch(`/api/connections/${conn.body.id}/accept`)
      .set('Authorization', `Bearer ${anestToken}`)

    const res = await request(app)
      .post(`/api/connections/${conn.body.id}/review`)
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ rating: 5, comment: 'Excelente!' })

    expect(res.status).toBe(201)
    expect(res.body.rating).toBe(5)
  })

  it('deve rejeitar avaliação de conexão não aceita', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const conn = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    const res = await request(app)
      .post(`/api/connections/${conn.body.id}/review`)
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ rating: 5 })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar avaliação duplicada', async () => {
    const surgeonToken = await createAndLoginUser(surgeonUser)
    const anestToken = await createAndLoginUser(anesthesiologistUser)

    await createProfile(surgeonToken, 'SURGEON')
    const anestProfile = await createProfile(anestToken, 'ANESTHESIOLOGIST')

    const conn = await request(app)
      .post('/api/connections')
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ anesthesiologistId: anestProfile.id })

    await request(app)
      .patch(`/api/connections/${conn.body.id}/accept`)
      .set('Authorization', `Bearer ${anestToken}`)

    await request(app)
      .post(`/api/connections/${conn.body.id}/review`)
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ rating: 5 })

    const res = await request(app)
      .post(`/api/connections/${conn.body.id}/review`)
      .set('Authorization', `Bearer ${surgeonToken}`)
      .send({ rating: 3 })

    expect(res.status).toBe(409)
  })
})