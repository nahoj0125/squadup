import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { RegisterService } from '../../src/services/RegisterService.js'
import { UserModel } from '../../src/models/UserModel.js'
import { describe } from '@jest/globals'

let mongoServer

describe('RegisterService', () => {
  const registerService = new RegisterService()

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

  describe('register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        username: 'newuser',
        firstname: 'New',
        lastname: 'User',
        email: 'newuser@example.com',
        password: 'password12345'
      }

      const registeredUser = await registerService.register(userData)

      expect(registeredUser).toBeDefined()
      expect(registeredUser.username).toBe(userData.username)
      expect(registeredUser.firstname).toBe(userData.firstname)
      expect(registeredUser.lastname).toBe(userData.lastname)
      expect(registeredUser.email).toBe(userData.email)

      const savedUser = await UserModel.findOne({ username: userData.username })
      expect(savedUser).toBeDefined()
      expect(savedUser.username).toBe(userData.username)
    })

    test('should throw an error when username already is taken', async () => {
      const existingUser = new UserModel({
        username: 'exisinguser',
        firstname: 'Existing',
        lastname: 'User',
        email: 'existinguser@example.com',
        password: 'password12345'
      })
      await existingUser.save()

      const newUserData = {
        username: 'exisinguser',
        firstname: 'New',
        lastname: 'User',
        email: 'newuser@example.com',
        password: 'password12345'
      }

      await expect(registerService.register(newUserData)).rejects.toThrow('Username is already taken')
    })

    test('should throw an error when email already is taken', async () => {
      const existingUser = new UserModel({
        username: 'exisinguser',
        firstname: 'Existing',
        lastname: 'User',
        email: 'existinguser@example.com',
        password: 'password12345'
      })
      await existingUser.save()

      const newUserData = {
        username: 'newuser',
        firstname: 'New',
        lastname: 'User',
        email: 'existinguser@example.com',
        password: 'password12345'
      }

      await expect(registerService.register(newUserData)).rejects.toThrow('Email is already taken')
    })

    test('should throw an error when required fields are missing', async () => {
      const reqFieldsMissingUser = {
        username: 'Fieldsmissing',
        lastname: 'Missing',
        email: 'fieldsmissing@example.com',
        password: 'password12345'
      }

      await expect(registerService.register(reqFieldsMissingUser)).rejects.toThrow()
    })

    test('should throw error when registration fails', async () => {
      const invalidUserData = {
        username: 'invaliduser',
        firstname: 'Invalid',
        lastname: 'User',
        email: 'this-is-not-an-email',
        password: 'password12345'
      }

      await expect(registerService.register(invalidUserData)).rejects.toThrow()
    })

    test('should hash the password', async () => {
      const hashUserData = {
        username: 'hashUser',
        firstname: 'Hash',
        lastname: 'User',
        email: 'hashuser@example.com',
        password: 'password12345'
      }

      await registerService.register(hashUserData)

      const savedUser = await UserModel.findOne({ username: hashUserData.username })

      expect(savedUser.password).not.toBe(hashUserData.password)
    })
  })
})
