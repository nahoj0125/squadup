import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { GroupModel } from '../../src/models/groupModel.js'
import { UserModel } from '../../src/models/UserModel.js'
import { expect } from '@jest/globals'

let mongoServer

describe('GroupModel', () => {
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
    await GroupModel.deleteMany({})
    await UserModel.deleteMany({})
  })

  /**
   * Creates and saves a test user in the database.
   *
   * @param {string} username - The username of the test user.
   * @param {string} email - The email of the test user.
   * @returns {Promise<object>} The saved user document.
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

  describe('Validate schema', () => {
    test('should create a group with valid data', async () => {
      const user = await createTestUser()
      const groupData = {
        name: 'Test group',
        description: 'This is a test group.',
        creator: user._id,
        members: [user._id]
      }

      const group = new GroupModel(groupData)
      const savedGroup = await group.save()

      expect(savedGroup).toHaveProperty('_id')
      expect(savedGroup.name).toBe(groupData.name)
      expect(savedGroup.description).toBe(groupData.description)
      expect(savedGroup.creator.toString()).toBe(user._id.toString())
      expect(savedGroup.members.toString()).toBe(user._id.toString())
    })

    test('should not create a group without a name', async () => {
      const user = await createTestUser()
      const groupData = {
        description: 'This is a test group.',
        creator: user._id,
        members: [user._id]
      }

      const group = new GroupModel(groupData)

      await expect(group.save()).rejects.toThrow()

      try {
        await group.save()
      } catch (error) {
        expect(error.errors.name).toBeDefined()
        expect(error.errors.name.kind).toBe('required')
      }
    })

    test('should not create a group with a name longer than 100 characters', async () => {
      const user = await createTestUser()
      const groupData = {
        name: 'a'.repeat(101),
        description: 'This is a test group',
        creator: user._id,
        members: [user._id]
      }

      const group = new GroupModel(groupData)

      await expect(group.save()).rejects.toThrow()

      try {
        await group.save()
      } catch (error) {
        expect(error.errors.name).toBeDefined()
        expect(error.errors.name.kind).toBe('maxlength')
      }
    })

    test('should not create a group without a description', async () => {
      const user = await createTestUser()
      const groupData = {
        name: 'Test group',
        creator: user._id,
        members: [user._id]
      }

      const group = new GroupModel(groupData)

      await expect(group.save()).rejects.toThrow()

      try {
        await group.save()
      } catch (error) {
        expect(error.errors.description).toBeDefined()
        expect(error.errors.description.kind).toBe('required')
      }
    })

    test('should not create a group with a description longer than 1000 characters', async () => {
      const user = await createTestUser()
      const groupData = {
        name: 'Test group',
        description: 'a'.repeat(1001),
        creator: user._id,
        members: [user._id]
      }

      const group = new GroupModel(groupData)

      await expect(group.save()).rejects.toThrow()

      try {
        await group.save()
      } catch (error) {
        expect(error.errors.description).toBeDefined()
        expect(error.errors.description.kind).toBe('maxlength')
      }
    })

    test('should fail to creat a group without a creator', async () => {
      const user = await createTestUser()
      const groupData = {
        name: 'Test group',
        description: 'This is a test group.',
        members: [user.id]
      }
      const group = new GroupModel(groupData)

      await expect(group.save()).rejects.toThrow()

      try {
        await group.save()
      } catch (error) {
        expect(error.errors.creator).toBeDefined()
        expect(error.errors.creator.kind).toBe('required')
      }
    })

    test('should fail when name is not unique', async () => {
      const user = await createTestUser()
      const groupData1 = {
        name: 'Duplicate group name',
        description: 'This is a test group.',
        creator: user._id,
        members: [user._id]
      }

      await new GroupModel(groupData1).save()

      const groupData2 = {
        name: 'Duplicate group name',
        description: 'This is another test group.',
        creator: user._id,
        members: [user._id]
      }

      const secondGroup = new GroupModel(groupData2)
      await expect(secondGroup.save()).rejects.toThrow()
    })
  })

  describe('Member functionality', () => {
    test('should allow multiple members in a group', async () => {
      const user1 = await createTestUser('testuser1', 'test1@example.com')
      const user2 = await createTestUser('testuser2', 'test2@example.com')
      const user3 = await createTestUser('testuser3', 'test3@example.com')

      const groupData = {
        name: 'Test group',
        description: 'This is a test group with multiple members.',
        creator: user1._id,
        members: [user1._id, user2._id, user3._id]
      }

      const group = new GroupModel(groupData)
      const savedGroup = await group.save()

      expect(savedGroup.members).toHaveLength(3)
      expect(savedGroup.members[0].toString()).toBe(user1._id.toString())
      expect(savedGroup.members[1].toString()).toBe(user2._id.toString())
      expect(savedGroup.members[2].toString()).toBe(user3._id.toString())
    })

    test('should add a member to group', async () => {
      const creator = await createTestUser('creator', 'test1@example.com')

      const groupData = {
        name: 'Test group',
        description: 'This is a test group with members to be added.',
        creator: creator._id,
        members: [creator._id]
      }
      const group = new GroupModel(groupData)
      let savedGroup = await group.save()

      const newMember = await createTestUser('newmember', 'test2@example.com')

      savedGroup.members.push(newMember._id)
      savedGroup = await savedGroup.save()

      expect(savedGroup.members).toHaveLength(2)
      expect(savedGroup.members[1].toString()).toBe(newMember._id.toString())
    })

    test('should populate members', async () => {
      const user = await createTestUser()

      const groupData = {
        name: 'Test group',
        description: 'This is a test group with members to be populated.',
        creator: user._id,
        members: [user._id]
      }

      const group = new GroupModel(groupData)
      const savedGroup = await group.save()

      const populatedGroup = await GroupModel.findById(savedGroup._id)
        .populate('creator')
        .populate('members')

      expect(populatedGroup.creator.username).toBe('testuser')
      expect(populatedGroup.members[0].username).toBe('testuser')
    })
  })
})
