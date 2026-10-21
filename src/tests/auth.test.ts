import request from 'supertest'
import { db } from '../db/connection.ts'
import { app } from '../server.ts'
import {
  cleanUpDatabase,
  createTestHabit,
  createTestUser,
} from '../tests/setup/dbHelpers.ts'

describe('Authentication Endpoints', () => {
  afterEach(async () => {
    await cleanUpDatabase()
  })
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'test1@gmail.com',
        password: 'test123',
        username: 'testuser',
      }
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).not.toHaveProperty('password')
    })
  })
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const testUser = await createTestUser()
      const credentials = {
        email: testUser.user.email,
        password: testUser.rawPassword,
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(201)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body.user).not.toHaveProperty('password')
    })
  })
})
