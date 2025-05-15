import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { GroupService } from '../../src/services//GroupService.js'
import { GroupModel } from '../../src/models/groupModel.js'
import { UserModel } from '../../src/models/UserModel.js'
import { describe } from '@jest/globals'

let mongoServer

let testuser1
let testuser2
let testuser3

describe('GroupService', () => {
  const groupService = new GroupService()

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

    testuser1 = await createTestUser('testuser1', 'testuser1@example.com')
    testuser2 = await createTestUser('testuser2', 'testuser2@example.com')
    testuser3 = await createTestUser('testuser3', 'testuser3@example.com')
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

  describe('createGroup', () => {
    test('should create a group with the provided data', async () => {
      const groupData = {
        name: 'Test Group',
        description: 'This is a test group'
      }

      const group = await groupService.createGroup(groupData, testuser1.id)

      expect(group).toBeDefined()
      expect(group.name).toBe(groupData.name)
      expect(group.description).toBe(groupData.description)
      expect(group.creator.toString()).toBe(testuser1.id.toString())
      expect(group.members).toHaveLength(1)
      expect(group.members[0].toString()).toBe(testuser1.id.toString())
    })
  })

  describe('getGroupById', () => {
    test('should return groups where the user is a number', async () => {
      const group1Data = new GroupModel({
        name: 'Group 1',
        description: 'First group',
        creator: testuser1.id,
        members: [testuser1.id]
      })
      await group1Data.save()

      const group2Data = new GroupModel({
        name: 'Group 2',
        description: 'Second group',
        creator: testuser2.id,
        members: [testuser1.id, testuser2.id]
      })
      await group2Data.save()

      const group3Data = new GroupModel({
        name: 'Group 3',
        description: 'Testuser1 not a mamber',
        creator: testuser2.id,
        members: [testuser2.id, testuser3.id]
      })
      await group3Data.save()

      const groupsForTestuser1 = await groupService.getGroupByUser(testuser1.id)

      expect(groupsForTestuser1).toHaveLength(2)
      expect(groupsForTestuser1.map(groups => groups.name)).toContain('Group 1')
      expect(groupsForTestuser1.map(groups => groups.name)).toContain('Group 2')
      expect(groupsForTestuser1.map(groups => groups.name)).not.toContain('Group 3')
    })

    test('should populate creator information', async () => {
      const groupData = new GroupModel({
        name: 'Creator group',
        description: 'Creator population test',
        creator: testuser2.id,
        members: [testuser1.id, testuser2.id]
      })
      await groupData.save()

      const groups = await groupService.getGroupByUser(testuser2.id)

      expect(groups).toHaveLength(1)
      expect(groups[0].creator).toBeDefined()
      expect(groups[0].creator).toHaveProperty('username')
      expect(groups[0].creator.username).toBe('testuser2')
    })

    test('should return empty array when user has no user', async () => {
      const groups = await groupService.getGroupByUser(testuser1.id)

      expect(groups).toHaveLength(0)
    })
  })

  describe('getGroupsbyId', () => {
    test('should find group by its id', async () => {
      const groupData = new GroupModel({
        name: 'ID Test Group',
        description: 'Testing getGroupById',
        creator: testuser1.id,
        members: [testuser1.id, testuser2.id]
      })
      const savedGroup = await groupData.save()
      const retrievedGroup = await groupService.getGroupById(savedGroup.id)

      expect(retrievedGroup).toBeDefined()
      expect(retrievedGroup.id).toBe(savedGroup.id)
      expect(retrievedGroup.name).toBe('ID Test Group')
      expect(retrievedGroup.description).toBe('Testing getGroupById')
    })

    test('should populate creator and members information', async () => {
      const groupData = new GroupModel({
        name: 'Populate Test Group',
        description: 'Testing populate',
        creator: testuser1.id,
        members: [testuser1.id, testuser2.id, testuser3]
      })
      const savedGroup = await groupData.save()

      const retrievedGroup = await groupService.getGroupById(savedGroup.id)

      expect(retrievedGroup.creator).toBeDefined()
      expect(retrievedGroup.creator).toHaveProperty('username')
      expect(retrievedGroup.creator).toHaveProperty('firstname')
      expect(retrievedGroup.creator).toHaveProperty('lastname')
      expect(retrievedGroup.creator.username).toBe('testuser1')

      expect(retrievedGroup.members).toHaveLength(3)
      expect(retrievedGroup.members[0]).toHaveProperty('username')
      expect(retrievedGroup.members[0]).toHaveProperty('firstname')
      expect(retrievedGroup.members[0]).toHaveProperty('lastname')

      const membersUsernames = retrievedGroup.members.map(member => member.username)
      expect(membersUsernames).toContain('testuser1')
      expect(membersUsernames).toContain('testuser2')
      expect(membersUsernames).toContain('testuser3')
    })

    test('should return null when a group id does not exist', async () => {
      const noId = new mongoose.Types.ObjectId()

      const group = await groupService.getGroupById(noId)

      expect(group).toBeNull()
    })

    test('should handle invalid ObjectId format', async () => {
      await expect(groupService.getGroupById('invalidId')).rejects.toThrow()
    })
  })

  describe('Integration between methods', () => {
    test('should create a group and then retrieve it by id', async () => {
      const groupData = {
        name: 'Integration Test Group',
        description: 'Testing integration between methods'
      }

      const createdGroup = await groupService.createGroup(groupData, testuser1.id)
      expect(createdGroup).toBeDefined()

      const retrievedGroup = await groupService.getGroupById(createdGroup.id)
      expect(retrievedGroup).toBeDefined()
      expect(retrievedGroup.name).toBe(groupData.name)
      expect(retrievedGroup.description).toBe(groupData.description)
    })

    test('should create a group and find the users groups', async () => {
      const groupData = {
        name: 'User Group Test',
        description: 'Testing getGroupsByUser'
      }

      const createdGroup = await groupService.createGroup(groupData, testuser1.id)
      expect(createdGroup).toBeDefined()

      const userGroups = await groupService.getGroupByUser(testuser1.id)
      expect(userGroups).toBeDefined()
      expect(userGroups).toHaveLength(1)
      expect(userGroups[0].name).toBe(groupData.name)
    })
  })
})
