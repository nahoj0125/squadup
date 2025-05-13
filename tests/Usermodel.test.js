import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '../src/models/UserModel.js'
import bcrypt from 'bcrypt'

let mongoServer

describe('UserModel', () => {
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

  describe('Validate schema', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      const savedUser = await user.save()
      const isPasswordHashed = await bcrypt.compare(userData.password, savedUser.password)

      expect(savedUser).toHaveProperty('_id')
      expect(savedUser.username).toBe(userData.username)
      expect(savedUser.firstname).toBe(userData.firstname)
      expect(savedUser.lastname).toBe(userData.lastname)
      expect(savedUser.email).toBe(userData.email)

      expect(isPasswordHashed).toBe(true)
    })

    test('should fail when username is missing', async () => {
      const userData = {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)

      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.username).toBeDefined()
        expect(error.errors.username.kind).toBe('required')
      }
    })

    test('should fail when username is too short', async () => {
      const userData = {
        username: 'short',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)

      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.username).toBeDefined()
        expect(error.errors.username.kind).toBe('minlength')
      }
    })

    test('should fail when username is too long', async () => {
      const userData = {
        username: 'a'.repeat(201),
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.username).toBeDefined()
        expect(error.errors.username.kind).toBe('maxlength')
      }
    })

    test('should fail when firstname is missing', async () => {
      const userData = {
        username: 'testuser123',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)

      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.firstname).toBeDefined()
        expect(error.errors.firstname.kind).toBe('required')
      }
    })

    test('should fail when firstname is too long', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'a'.repeat(201),
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.firstname).toBeDefined()
        expect(error.errors.firstname.kind).toBe('maxlength')
      }
    })

    test('should fail when lastname is missing', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)

      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.lastname).toBeDefined()
        expect(error.errors.lastname.kind).toBe('required')
      }
    })

    test('should fail when lastname is too long', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'a'.repeat(201),
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.lastname).toBeDefined()
        expect(error.errors.lastname.kind).toBe('maxlength')
      }
    })

    test('should fail when email is missing', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.email).toBeDefined()
        expect(error.errors.email.kind).toBe('required')
      }
    })

    test('should fail when email is invalid', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'invalid-email',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.email).toBeDefined()
        expect(error.errors.email.kind).toBe('regexp')
      }
    })

    test('should fail when password is too short', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'short'
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.password).toBeDefined()
        expect(error.errors.password.kind).toBe('minlength')
      }
    })

    test('should fail when password is missing', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com'
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.password).toBeDefined()
        expect(error.errors.password.kind).toBe('required')
      }
    })

    test('should fail when password is too long', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'a'.repeat(2001)
      }

      const user = new UserModel(userData)
      await expect(user.save()).rejects.toThrow()

      try {
        await user.save()
      } catch (error) {
        expect(error.errors.password).toBeDefined()
        expect(error.errors.password.kind).toBe('maxlength')
      }
    })

    test('should fail when username is not unique', async () => {
      const userData1 = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test1@example.com',
        password: 'password12345'
      }

      await new UserModel(userData1).save()

      const userData2 = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test2@example.com',
        password: 'password12345'
      }

      const user2 = new UserModel(userData2)

      await expect(user2.save()).rejects.toThrow()

      try {
        await user2.save()
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.code).toBe(11000)
      }
    })

    test('should fail when email is not unique', async () => {
      const userData1 = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      await new UserModel(userData1).save()

      const userData2 = {
        username: 'differentuser',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user2 = new UserModel(userData2)

      await expect(user2.save()).rejects.toThrow()

      try {
        await user2.save()
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.code).toBe(11000)
      }
    })
  })

  describe('Password hashing', () => {
    test('should hash the password before saving', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await user.save()

      expect(user.password).not.toBe(userData.password)

      const isPasswordHashed = await bcrypt.compare(userData.password, user.password)
      expect(isPasswordHashed).toBe(true)
    })
  })

  describe('Authentication', () => {
    test('should authenticate user with valid credentials', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await user.save()

      const authenticatedUser = await UserModel.authenticate(userData.username, userData.password)
      expect(authenticatedUser).toBeDefined()
    })

    test('should not authenticate user with invalid username', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      await new UserModel(userData).save()

      await expect(UserModel.authenticate('wrongusername', userData.password)).rejects.toThrow('Invalid login attempt!')
    })

    test('should not authenticate user with invalid password', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      await new UserModel(userData).save()

      await expect(UserModel.authenticate(userData.username, 'wrongpassword')).rejects.toThrow('Invalid login attempt!')
    })

    test('should not authenticate user with empty username', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      await new UserModel(userData).save()

      await expect(UserModel.authenticate('', userData.password)).rejects.toThrow('Invalid login attempt!')
    })

    test('should not authenticate user with empty password', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      await new UserModel(userData).save()

      await expect(UserModel.authenticate(userData.username, '')).rejects.toThrow('Invalid login attempt!')
    })
  })

  describe('Instance methods', () => {
    test('should correctly compare passwords', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await user.save()

      const isMatch = await user.comparePassword(userData.password)
      expect(isMatch).toBe(true)
    })

    test('should reject incorrect passwords', async () => {
      const userData = {
        username: 'testuser123',
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        password: 'password12345'
      }

      const user = new UserModel(userData)
      await user.save()

      const isMatch = await user.comparePassword('wrongpassword')
      expect(isMatch).toBe(false)
    })
  })
})
