import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { LoginService } from '../src/services/LoginService.js'
import { UserModel } from '../src/models/UserModel.js'
import { beforeAll, describe } from '@jest/globals'

let mongoServer

describe('LoginService', () => {
  const loginService = new LoginService()

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()

    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    await UserModel.deleteMany({})
  })

  /**
   * Creates a test user in the database.
   *
   * @param {string} [username='testuser'] - The username of the test user.
   * @param {string} [email='testuser@example.com'] - The email of the test user.
   * @param {string} [password='password12345'] - The password of the test user.
   * @returns {Promise<object>} The saved user document.
   */
  const createTestUser = async (username = 'testuser', email = 'testuser@example.com', password = 'password12345') => {
    const user = new UserModel({
      username,
      firstname: 'Test',
      lastname: 'User',
      email,
      password
    })
    return await user.save()
  }

  describe('authenticateUser', () => {
    test('should authenticate user with correct credentials', async () => {
      const username = 'correctuser'
      const password = 'correctpassword'
      await createTestUser(username, 'correct@example.com', password)

      const authenticateUser = await loginService.authenticateUser(username, password)

      expect(authenticateUser).toBeDefined()
      expect(authenticateUser.username).toBe(username)
    })

    test('should fail when username is incorrect', async () => {
      await createTestUser('correctuser', 'correct@example.com', 'correctpassword')

      await expect(loginService.authenticateUser('wronguser', 'correctpassword')).rejects.toThrow()
    })

    test('should fail when password is incorrect', async () => {
      await createTestUser('correctuser', 'correct@example.com', 'correctpassword')

      await expect(loginService.authenticateUser('correctuser', 'wrongpassword')).rejects.toThrow()
    })
  })

  describe('getUserById', () => {
    test('should return user when valid ID is provided', async () => {
      const testUser = await createTestUser()

      const retrievedUser = await loginService.getUserById(testUser.id)

      expect(retrievedUser).toBeDefined()
      expect(retrievedUser.id).toBe(testUser.id)
      expect(retrievedUser.username).toBe(testUser.username)
    })

    test('should throw error when id does not exist', async () => {
      const noId = new mongoose.Types.ObjectId()

      await expect(loginService.getUserById(noId)).rejects.toThrow('The user you requested does not exist.')
    })

    test('should handle invalid ObjectId format', async () => {
      await expect(loginService.getUserById('invalid-format')).rejects.toThrow()
    })
  })

  describe('Integration', () => {
    test('should authenticate user and then get user by id', async () => {
      const username = 'testuser'
      const password = 'password12345'
      await createTestUser(username, 'testuser@example.com', password)

      const authenticatedUser = await loginService.authenticateUser(username, password)

      expect(authenticatedUser).toBeDefined()

      const retrievedUser = await loginService.getUserById(authenticatedUser.id)

      expect(retrievedUser).toBeDefined()
      expect(retrievedUser.username).toBe(username)
    })
  })
})
