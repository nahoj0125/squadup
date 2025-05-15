import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MessageService } from '../../src/services/MessageService.js'
import { MessageModel } from '../../src/models/messageModel.js'
import { UserModel } from '../../src/models/UserModel.js'
import { GroupModel } from '../../src/models/groupModel.js'
import { beforeEach, expect } from '@jest/globals'

let mongoServer

describe('MessageService', () => {
  const messageService = new MessageService()

  let testUser1
  let testUser2

  let testGroup

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

    testUser1 = await createTestUser('testuser1', 'testuser1@example.com')
    testUser2 = await createTestUser('testuser2', 'testuser2@example.com')

    testGroup = await createTestGroup('Test Group', testUser1.id, [testUser1, testUser2])
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
    const userData = new UserModel({
      username,
      firstname: 'Test',
      lastname: 'User',
      email,
      password
    })
    return await userData.save()
  }

  /**
   * Creates a test group in the database.
   *
   * @param {string} [name='Test Group'] - The name of the test group.
   * @param {string} creatorId - The ID of the user creating the group.
   * @param {Array<string>} [membersId=[]] - The IDs of the members in the group.
   * @returns {Promise<object>} The saved group document.
   */
  const createTestGroup = async (name = 'Test Group', creatorId, membersId = []) => {
    const groupData = new GroupModel({
      name,
      description: 'This is a test group',
      creator: creatorId,
      members: membersId
    })
    return await groupData.save()
  }

  describe('createMessage', () => {
    test('should create a message with valid data', async () => {
      const content = 'This is a test message'

      const message = await messageService.createMessage(content, testUser1.id, testGroup.id)

      expect(message).toBeDefined()
      expect(message.content).toBe(content)
      expect(message.sender.toString()).toBe(testUser1.id.toString())
      expect(message.group.toString()).toBe(testGroup.id.toString())
      expect(message).toHaveProperty('createdAt')

      const savedMessage = await MessageModel.findById(message.id)
      expect(savedMessage).toBeDefined()
      expect(savedMessage.content).toBe(content)
    })

    test('should handle content validation error', async () => {
      await expect(messageService.createMessage('', testUser1.id, testGroup.id)).rejects.toThrow()

      const tooLongContent = 'a'.repeat(2001)
      await expect(messageService.createMessage(tooLongContent, testUser1.id, testGroup.id)).rejects.toThrow()
    })

    test('should handle sender id validation', async () => {
      await expect(messageService.createMessage('test message', 'noId', testGroup.id)).rejects.toThrow()
    })

    test('should handle group id validation', async () => {
      await expect(messageService.createMessage('Test message', testUser1.id, 'noId')).rejects.toThrow()
    })
  })

  describe('getMessageByGroup', () => {
    test('should retrive messages for a group', async () => {
      const timeNow = new Date()

      const messageData1 = new MessageModel({
        content: 'Message 1',
        sender: testUser1.id,
        group: testGroup.id,
        createdAt: new Date(timeNow.getTime() - 2000)
      })
      await messageData1.save()

      const messageData2 = new MessageModel({
        content: 'Message 2',
        sender: testUser1.id,
        group: testGroup.id,
        createdAt: new Date(timeNow.getTime() - 1000)
      })
      await messageData2.save()

      const messageData3 = new MessageModel({
        content: 'Message 3',
        sender: testUser1.id,
        group: testGroup.id,
        createdAt: new Date(timeNow.getTime())
      })
      await messageData3.save()

      const messages = await messageService.getMessageByGroup(testGroup.id)

      expect(messages).toHaveLength(3)
      expect(messages[0].content).toBe('Message 3')
      expect(messages[1].content).toBe('Message 2')
      expect(messages[2].content).toBe('Message 1')
    })
    test('should limit the number of messages returned', async () => {
      await messageService.createMessage('Message 1', testUser1.id, testGroup.id)
      await messageService.createMessage('Message 2', testUser2.id, testGroup.id)
      await messageService.createMessage('Message 3', testUser1.id, testGroup.id)
      await messageService.createMessage('Message 4', testUser2.id, testGroup.id)
      await messageService.createMessage('Message 5', testUser1.id, testGroup.id)

      const messages = await messageService.getMessageByGroup(testGroup.id, 2)

      expect(messages).toHaveLength(2)
      expect(messages[0].content).toBe('Message 5')
      expect(messages[1].content).toBe('Message 4')
    })

    test('should return messages with populated sender information', async () => {
      await messageService.createMessage('test Message', testUser1.id, testGroup.id)

      const messages = await messageService.getMessageByGroup(testGroup.id)

      expect(messages).toHaveLength(1)
      expect(messages[0].sender).toBeDefined()
      expect(messages[0].sender).toHaveProperty('username')
      expect(messages[0].sender).toHaveProperty('firstname')
      expect(messages[0].sender).toHaveProperty('lastname')
      expect(messages[0].sender.username).toBe('testuser1')
    })

    test('should return an empty array when no message for the group exists', async () => {
      const groupWithNoMessages = await createTestGroup('Empty Group', testUser1.id, testGroup.id1)

      const messages = await messageService.getMessageByGroup(groupWithNoMessages.id)

      expect(messages).toHaveLength(0)
    })

    test('should sort message by creation date in descending order', async () => {
      const messageData1 = new MessageModel({
        content: 'Oldest message',
        sender: testUser1.id,
        group: testGroup.id,
        createdAt: new Date(2025, 0, 1)
      })
      await messageData1.save()

      const messageData2 = new MessageModel({
        content: 'Mid message',
        sender: testUser1.id,
        group: testGroup.id,
        createdAt: new Date(2025, 0, 2)
      })
      await messageData2.save()

      const messageData3 = new MessageModel({
        content: 'Newest message',
        sender: testUser1.id,
        group: testGroup.id,
        createdAt: new Date(2025, 0, 3)
      })
      await messageData3.save()

      const messages = await messageService.getMessageByGroup(testGroup.id)

      expect(messages).toHaveLength(3)
      expect(messages[0].content).toBe('Newest message')
      expect(messages[1].content).toBe('Mid message')
      expect(messages[2].content).toBe('Oldest message')
    })

    test('should handle invalid group id format', async () => {
      await expect(messageService.getMessageByGroup('invalidid')).rejects.toThrow()
    })
  })

  describe('Integration between methods', () => {
    test('should create message and then retrieve them for a group', async () => {
      await messageService.createMessage('Message from testuser1', testUser1.id, testGroup.id)
      await messageService.createMessage('Message from testuser2', testUser2.id, testGroup.id)

      const messages = await messageService.getMessageByGroup(testGroup.id)

      expect(messages).toHaveLength(2)

      const contents = messages.map(message => message.content)
      expect(contents).toContain('Message from testuser1')
      expect(contents).toContain('Message from testuser2')

      for (const message of messages) {
        expect(message.sender).toHaveProperty('username')
        if (message.content === 'Message from testuser1') {
          expect(message.sender.username).toBe('testuser1')
        } else {
          expect(message.sender.username).toBe('testuser2')
        }
      }
    })

    test('should not retrieve messages from other groups', async () => {
      const sencondGroup = await createTestGroup('Second Group', testUser1.id, testGroup.id)

      await messageService.createMessage('Message in test group', testUser1.id, testGroup.id)
      await messageService.createMessage('Message in second group', testUser1.id, sencondGroup.id)

      const testGroupMessages = await messageService.getMessageByGroup(testGroup.id)

      expect(testGroupMessages).toHaveLength(1)
      expect(testGroupMessages[0].content).toBe('Message in test group')

      const secondGroupMessages = await messageService.getMessageByGroup(sencondGroup.id)

      expect(secondGroupMessages).toHaveLength(1)
      expect(secondGroupMessages[0].content).toBe('Message in second group')
    })
  })
})
