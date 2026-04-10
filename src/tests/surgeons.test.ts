import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

const surgeonUser = {
  email: 'surgeon-test@anestlink.com',
  password: 'Senha123',
  role: 'SURGEON',
}

const anesthesiologistUser = {
  email: 'anesthesiologist-test@anestlink.com',
  password: 'Senha123',
  role: 'ANESTHESIOLOGIST',
}

const profileData = {
  fullName: 'Dr. Teste Silva',
  crm: '999999',
  crmState: 'SP',
  bio: 'Cirurgião de teste',
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

beforeEach(async () => {
  await prisma.surgeonProfile.deleteMany({
    where: { user: { email: surgeonUser.email } },
  })
  await prisma.verificationCode.deleteMany({
    where: { user: { email: { in: [surgeonUser.email, anesthesiologistUser.email] } } },
  })
  await prisma.refreshToken.deleteMany({
    where: { user: { email: { in: [surgeonUser.email, anesthesiologistUser.email] } } },
  })
  await prisma.user.deleteMany({
    where: { email: { in: [surgeonUser.email, anesthesiologistUser.email] } },
  })
})

describe('POST /api/surgeons/profile', () => {
  it('deve criar perfil de cirurgião com sucesso', async () => {
    const token = await createAndLoginUser(surgeonUser)

    const res = await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    expect(res.status).toBe(201)
    expect(res.body.fullName).toBe(profileData.fullName)
    expect(res.body.crm).toBe(profileData.crm)
    expect(res.body.crmState).toBe(profileData.crmState)
    expect(res.body.isCrmVerified).toBe(false)
  })

  it('deve rejeitar criação sem token', async () => {
    const res = await request(app)
      .post('/api/surgeons/profile')
      .send(profileData)

    expect(res.status).toBe(401)
  })

  it('deve rejeitar criação por anestesista', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    const res = await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    expect(res.status).toBe(403)
  })

  it('deve rejeitar perfil duplicado', async () => {
    const token = await createAndLoginUser(surgeonUser)

    await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    const res = await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    expect(res.status).toBe(409)
  })

  it('deve rejeitar CRM inválido', async () => {
    const token = await createAndLoginUser(surgeonUser)

    const res = await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...profileData, crm: 'ab' })

    expect(res.status).toBe(422)
  })

  it('deve rejeitar estado inválido', async () => {
    const token = await createAndLoginUser(surgeonUser)

    const res = await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...profileData, crmState: 'SPP' })

    expect(res.status).toBe(422)
  })
})

describe('GET /api/surgeons/profile', () => {
  it('deve retornar o próprio perfil', async () => {
    const token = await createAndLoginUser(surgeonUser)

    await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    const res = await request(app)
      .get('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.fullName).toBe(profileData.fullName)
    expect(res.body.user).toHaveProperty('email')
  })

  it('deve retornar 404 se perfil não existe', async () => {
    const token = await createAndLoginUser(surgeonUser)

    const res = await request(app)
      .get('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/surgeons/profile', () => {
  it('deve atualizar o perfil com sucesso', async () => {
    const token = await createAndLoginUser(surgeonUser)

    await request(app)
      .post('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    const res = await request(app)
      .patch('/api/surgeons/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Bio atualizada' })

    expect(res.status).toBe(200)
    expect(res.body.bio).toBe('Bio atualizada')
  })
})

describe('GET /api/surgeons', () => {
  it('deve listar cirurgiões autenticado', async () => {
    const token = await createAndLoginUser(surgeonUser)

    const res = await request(app)
      .get('/api/surgeons')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('deve rejeitar listagem sem token', async () => {
    const res = await request(app).get('/api/surgeons')

    expect(res.status).toBe(401)
  })
})