import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MessageModel } from '../../src/models/messageModel.js'
import { UserModel } from '../../src/models/UserModel.js'
import { GroupModel } from '../../src/models/groupModel.js'
import { beforeEach, expect } from '@jest/globals'

let mongoServer

describe('MessageModel', () => {
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
    await MessageModel.deleteMany({})
    await UserModel.deleteMany({})
    await GroupModel.deleteMany({})
  })

  /**
   * Creates a test user with the given username and email.
   *
   * @param {string} username - The username of the test user.
   * @param {string} email - The email of the test user.
   * @returns {Promise<object>} The saved user object.
   */
  const createTestUser = async (username = 'testuser', email = 'test@example.com') => {
    const user = new UserModel({
      username,
      firstname: 'Test',
      lastname: 'User',
      email,
      password: 'password12345'
    })

    return await user.save()
  }

  /**
   * Creates a test group with the given name and creator.
   *
   * @param {object} user - The user object representing the creator of the group.
   * @param {string} name - The name of the test group.
   * @returns {Promise<object>} The saved group object.
   */
  const createTestGroup = async (user, name = 'Test group') => {
    const group = new GroupModel({
      name,
      description: 'this is a test group.',
      creator: user._id,
      members: [user._id]
    })

    return await group.save()
  }

  describe('Validate schema', () => {
    test('should create a message with valid data', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const messageData = {
        content: 'This is a test message.',
        sender: user.id,
        group: group.id
      }

      const message = new MessageModel(messageData)
      const savedMessage = await message.save()

      expect(savedMessage).toHaveProperty('_id')
      expect(savedMessage.content).toBe(messageData.content)
      expect(savedMessage.sender.toString()).toBe(user._id.toString())
      expect(savedMessage.group.toString()).toBe(group._id.toString())
      expect(savedMessage).toHaveProperty('createdAt')
    })

    test('should fail when there is no content', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const messageData = {
        sender: user.id,
        group: group.id
      }
      const message = new MessageModel(messageData)
      await expect(message.save()).rejects.toThrow()

      try {
        await message.save()
      } catch (error) {
        expect(error.errors.content).toBeDefined()
        expect(error.errors.content.kind).toBe('required')
      }
    })

    test('should fail when there is no sender', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const messageData = {
        content: 'This is a test message.',
        group: group.id
      }
      const message = new MessageModel(messageData)
      await expect(message.save()).rejects.toThrow()

      try {
        await message.save()
      } catch (error) {
        expect(error.errors.sender).toBeDefined()
        expect(error.errors.sender.kind).toBe('required')
      }
    })

    test('should fail when content is longer than 2000 characters', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const messageData = {
        content: 'a'.repeat(2001),
        sender: user.id,
        group: group.id
      }

      const message = new MessageModel(messageData)
      await expect(message.save()).rejects.toThrow()

      try {
        await message.save()
      } catch (error) {
        expect(error.errors.content).toBeDefined()
        expect(error.errors.content.kind).toBe('maxlength')
      }
    })

    test('should fail when there is no group', async () => {
      const user = await createTestUser()

      const messageData = {
        content: 'a'.repeat(2001),
        sender: user.id
      }

      const message = new MessageModel(messageData)
      await expect(message.save()).rejects.toThrow()

      try {
        await message.save()
      } catch (error) {
        expect(error.errors.group).toBeDefined()
        expect(error.errors.group.kind).toBe('required')
      }
    })
  })

  describe('Population', () => {
    test('should populate sender and group references', async () => {
      const user = await createTestUser('sender', 'sernder@example.com')
      const group = await createTestGroup(user, 'Test Message Group')

      const messageData = {
        content: 'This is a test message.',
        sender: user.id,
        group: group.id
      }

      const message = new MessageModel(messageData)
      const savedMessage = await message.save()

      const populatedMessage = await MessageModel.findById(savedMessage.id)
        .populate('sender')
        .populate('group')

      expect(populatedMessage.sender).toHaveProperty('username')
      expect(populatedMessage.sender.username).toBe('sender')
      expect(populatedMessage.group).toHaveProperty('name')
      expect(populatedMessage.group.name).toBe('Test Message Group')
    })
  })
})
