import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

const anesthesiologistUser = {
  email: 'anest-test@anestlink.com',
  password: 'Senha123',
  role: 'ANESTHESIOLOGIST',
}

const surgeonUser = {
  email: 'surgeon-test2@anestlink.com',
  password: 'Senha123',
  role: 'SURGEON',
}

const profileData = {
  fullName: 'Dra. Teste Santos',
  crm: '888888',
  crmState: 'RJ',
  bio: 'Anestesista de teste',
}

async function createAndLoginUser(user: typeof anesthesiologistUser) {
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
  await prisma.anesthesiologistProfile.deleteMany({
    where: { user: { email: anesthesiologistUser.email } },
  })
  await prisma.verificationCode.deleteMany({
    where: { user: { email: { in: [anesthesiologistUser.email, surgeonUser.email] } } },
  })
  await prisma.refreshToken.deleteMany({
    where: { user: { email: { in: [anesthesiologistUser.email, surgeonUser.email] } } },
  })
  await prisma.user.deleteMany({
    where: { email: { in: [anesthesiologistUser.email, surgeonUser.email] } },
  })
})

describe('POST /api/anesthesiologists/profile', () => {
  it('deve criar perfil de anestesista com sucesso', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    const res = await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    expect(res.status).toBe(201)
    expect(res.body.fullName).toBe(profileData.fullName)
    expect(res.body.crm).toBe(profileData.crm)
    expect(res.body.plan).toBe('FREE')
    expect(res.body.avgRating).toBe('0')
  })

  it('deve rejeitar criação sem token', async () => {
    const res = await request(app)
      .post('/api/anesthesiologists/profile')
      .send(profileData)

    expect(res.status).toBe(401)
  })

  it('deve rejeitar criação por cirurgião', async () => {
    const token = await createAndLoginUser(surgeonUser)

    const res = await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    expect(res.status).toBe(403)
  })

  it('deve rejeitar perfil duplicado', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    const res = await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    expect(res.status).toBe(409)
  })

  it('deve rejeitar CRM inválido', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    const res = await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...profileData, crm: 'ab' })

    expect(res.status).toBe(422)
  })
})

describe('GET /api/anesthesiologists/profile', () => {
  it('deve retornar o próprio perfil', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    const res = await request(app)
      .get('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.fullName).toBe(profileData.fullName)
    expect(res.body.user).toHaveProperty('email')
  })

  it('deve retornar 404 se perfil não existe', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    const res = await request(app)
      .get('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/anesthesiologists/profile', () => {
  it('deve atualizar o perfil com sucesso', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    const res = await request(app)
      .patch('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Bio atualizada do anestesista' })

    expect(res.status).toBe(200)
    expect(res.body.bio).toBe('Bio atualizada do anestesista')
  })
})

describe('GET /api/anesthesiologists', () => {
  it('deve listar anestesistas autenticado', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    const res = await request(app)
      .get('/api/anesthesiologists')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('deve rejeitar listagem sem token', async () => {
    const res = await request(app).get('/api/anesthesiologists')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/anesthesiologists/:id', () => {
  it('deve buscar anestesista por id', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    const created = await request(app)
      .post('/api/anesthesiologists/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData)

    const res = await request(app)
      .get(`/api/anesthesiologists/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(created.body.id)
  })

  it('deve retornar 404 para id inexistente', async () => {
    const token = await createAndLoginUser(anesthesiologistUser)

    const res = await request(app)
      .get('/api/anesthesiologists/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})