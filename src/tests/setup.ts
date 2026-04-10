import { beforeAll, afterAll } from 'vitest'
import { config } from 'dotenv'

config({ path: '.env.test' })

import { prisma } from '../lib/prisma'

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})