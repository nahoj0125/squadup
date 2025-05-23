import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { AvailabilityService } from '../../src/services/AvailablilityService.js'
import { AvailabilityModel } from '../../src/models/availabliltyModel.js'
import { GroupModel } from '../../src/models/groupModel.js'
import { UserModel } from '../../src/models/UserModel.js'
import { describe, expect } from '@jest/globals'

let mongoServer

let testuser1
let testuser2
let testuser3
let testgroup1
let testgroup2

describe('AvailabilityService', () => {
  const availabilityService = new AvailabilityService()

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
    await AvailabilityModel.deleteMany({})
    await UserModel.deleteMany({})
    await GroupModel.deleteMany({})

    testuser1 = await createTestUser('testuser1', 'testuser1@example.com')
    testuser2 = await createTestUser('testuser2', 'testuser2@example.com')
    testuser3 = await createTestUser('testuser3', 'testuser3@example.com')

    testgroup1 = await createTestGroup('Test Group1', testuser1.id, [testuser1, testuser2])
    testgroup2 = await createTestGroup('Test Group2', testuser1.id, [testuser1, testuser2, testuser3])
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

  /**
   * Creates a test time slot object.
   *
   * @param {string} start - Start time as ISO string.
   * @param {string} end - End time as ISO string.
   * @returns {object} Time slot object.
   */
  const createTimeSlot = (start, end) => ({
    start: new Date(start),
    end: new Date(end)
  })

  /**
   * Creates an availability record directly using the model.
   *
   * @param {string} userId - User ObjectId.
   * @param {string} groupId - Group ObjectId.
   * @param {Array} timeSlots - Array of time slot objects.
   * @returns {Promise<object>} The saved availability document.
   */
  const createTestAvailability = async (userId, groupId, timeSlots) => {
    const availabilityData = new AvailabilityModel({
      user: userId,
      group: groupId,
      timeSlots
    })
    return await availabilityData.save()
  }

  describe('setAvailability', () => {
    test('should create new availability record when none exists', async () => {
      const timeSlots = [
        createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z'),
        createTimeSlot('2025-01-15T14:00:00Z', '2025-01-15T17:00:00Z')
      ]

      const result = await availabilityService.setAvailability(
        testuser1.id,
        testgroup1.id,
        timeSlots
      )

      expect(result).toBeDefined()
      expect(result.user.toString()).toBe(testuser1.id.toString())
      expect(result.group.toString()).toBe(testgroup1.id.toString())
      expect(result.timeSlots).toHaveLength(2)
      expect(result.timeSlots[0].start).toEqual(timeSlots[0].start)
      expect(result.timeSlots[0].end).toEqual(timeSlots[0].end)
      expect(result.timeSlots[1].start).toEqual(timeSlots[1].start)
      expect(result.timeSlots[1].end).toEqual(timeSlots[1].end)

      const savedRecord = await AvailabilityModel.findOne({
        user: testuser1.id,
        group: testgroup1.id
      })
      expect(savedRecord).toBeDefined()
      expect(savedRecord.timeSlots).toHaveLength(2)
    })

    test('should update existing availability record', async () => {
      const initialTimeSlots = [
        createTimeSlot('2025-01-14T10:00:00Z', '2025-01-14T11:00:00Z')
      ]

      const initialAvailability = await createTestAvailability(
        testuser1.id,
        testgroup1.id,
        initialTimeSlots
      )
      expect(initialAvailability.timeSlots).toHaveLength(1)

      const newTimeSlots = [
        createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z'),
        createTimeSlot('2025-01-15T14:00:00Z', '2025-01-15T17:00:00Z')
      ]

      const result = await availabilityService.setAvailability(
        testgroup1.id,
        testgroup1.id,
        newTimeSlots
      )

      expect(result.timeSlots).toHaveLength(2)
      expect(result.timeSlots[0].start).toEqual(newTimeSlots[0].start)
      expect(result.timeSlots[1].start).toEqual(newTimeSlots[1].start)

      const allRecords = await AvailabilityModel.find({
        user: testuser1.id,
        group: testgroup1.id
      })
      expect(allRecords).toHaveLength(1)
    })

    test('should handle empty time slots array', async () => {
      const result = await availabilityService.setAvailability(
        testuser1.id,
        testgroup1.id,
        []
      )

      expect(result.timeSlots).toEqual([])
      expect(result.user.toString()).toBe(testuser1.id.toString())
      expect(result.group.toString()).toBe(testgroup1.id.toString())

      const savedRecord = await AvailabilityModel.findOne({
        user: testuser1.id,
        group: testgroup1.id
      })
      expect(savedRecord.timeSlots).toEqual([])
    })

    test('should handle multiple users in same group', async () => {
      const timeSlots1 = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      const timeSlots2 = [createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T13:00:00Z')]

      const result1 = await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots1)
      const result2 = await availabilityService.setAvailability(testuser2.id, testgroup1.id, timeSlots2)

      expect(result1.user.toString()).toBe(testuser1.id.toString())
      expect(result2.user.toString()).toBe(testuser2.id.toString())

      const allRecords = await AvailabilityModel.find({ group: testgroup1.id })
      expect(allRecords).toHaveLength(2)

      const user1Record = allRecords.find(result => result.user.toString() === testuser1.id.toString())
      const user2Record = allRecords.find(result => result.user.toString() === testuser2.id.toString())

      expect(user1Record.timeSlots[0].start).toEqual(timeSlots1[0].start)
      expect(user2Record.timeSlots[0].start).toEqual(timeSlots2[0].start)
    })

    test('should handle user with availability in multiple groups', async () => {
      const timeSlots1 = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      const timeSlots2 = [createTimeSlot('2025-01-15T14:00:00Z', '2025-01-15T17:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots1)
      await availabilityService.setAvailability(testuser1.id, testgroup2.id, timeSlots2)

      const group1Record = await AvailabilityModel.findOne({
        user: testuser1.id,
        group: testgroup1.id
      })

      const group2Record = await AvailabilityModel.findOne({
        user: testuser1.id,
        group: testgroup2.id
      })

      expect(group1Record).toBeDefined()
      expect(group2Record).toBeDefined()
      expect(group1Record.timeSlots[0].start).toEqual(timeSlots1[0].start)
      expect(group2Record.timeSlots[0].start).toEqual(timeSlots2[0].start)
    })

    test('should properly index user and group combination', async () => {
      const timeSlots = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots)

      const indexRecord = await AvailabilityModel.findOne({
        user: testuser1.id,
        group: testgroup1.id
      })
      expect(indexRecord).toBeDefined()
      expect(indexRecord.user.toString()).toBe(testuser1.id.toString())
      expect(indexRecord.group.toString()).toBe(testgroup1.id.toString())
    })
  })

  describe('getUserAvailability', () => {
    test('should return availability record when found', async () => {
      const timeSlots = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots)

      const result = await availabilityService.getUserAvailability(testuser1.id, testgroup1.id)

      expect(result).toBeDefined()
      expect(result.user.toString()).toBe(testuser1.id.toString())
      expect(result.group.toString()).toBe(testgroup1.id.toString())
      expect(result.timeSlots).toHaveLength(1)
      expect(result.timeSlots[0].start).toEqual(timeSlots[0].start)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
    })

    test('should return null when no availability record exists', async () => {
      const result = await availabilityService.getUserAvailability(testgroup1.id, testgroup1.id)

      expect(result).toBeNull()
    })

    test('should return correct record for specific user and group combination', async () => {
      const timeSlots1 = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      const timeSlots2 = [createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T13:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots1)
      await availabilityService.setAvailability(testuser1.id, testgroup2.id, timeSlots2)

      const result = await availabilityService.getUserAvailability(testuser1.id, testgroup1.id)

      expect(result.group.toString()).toBe(testgroup1.id.toString())
      expect(result.timeSlots[0].start).toEqual(timeSlots1[0].start)
    })
  })

  describe('getGroupAvailability', () => {
    test('should return populated availability records for a group', async () => {
      const timeSlots1 = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      const timeSlots2 = [createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T13:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots1)
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, timeSlots2)

      const result = await availabilityService.getGroupAvailability(testgroup1.id)

      expect(result).toHaveLength(2)

      const user1Record = result.find(result => result.user._id.toString() === testuser1.id.toString())
      const user2Record = result.find(result => result.user._id.toString() === testuser2.id.toString())

      expect(user1Record).toBeDefined()
      expect(user1Record.user.username).toBe('testuser1')
      expect(user1Record.user.firstname).toBe('Test')
      expect(user2Record).toBeDefined()
      expect(user2Record.user.username).toBe('testuser2')
      expect(user2Record.user.firstname).toBe('Test')

      expect(user1Record.user._id.toString()).toBe(testuser1.id.toString())
      expect(user2Record.user._id.toString()).toBe(testuser2.id.toString())
    })

    test('should return empty array when no availabilities exist for group', async () => {
      const result = await availabilityService.getGroupAvailability(testgroup1.id)

      expect(result).toEqual([])
    })

    test('should only return availabilities for specified group', async () => {
      const timeSlots = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots)
      await availabilityService.setAvailability(testuser2.id, testgroup2.id, timeSlots)

      const result = await availabilityService.getGroupAvailability(testgroup1.id)

      expect(result).toHaveLength(1)
      expect(result[0].user._id.toString()).toBe(testuser1.id.toString())
      expect(result[0].group.toString()).toBe(testgroup1.id.toString())
    })

    test('should return records with populated user information only (no email or password)', async () => {
      const timeSlots = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots)

      const result = await availabilityService.getGroupAvailability(testgroup1.id)

      expect(result).toHaveLength(1)
      expect(result[0].user).toHaveProperty('username')
      expect(result[0].user).toHaveProperty('firstname')
      expect(result[0].user).toHaveProperty('lastname')

      expect(result[0].user).not.toContain('password')
      expect(result[0].user).not.toContain('email')
    })
  })

  describe('getCommonAvailability', () => {
    test('should find overlapping time slots for two users', async () => {
      const timeSlots1 = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      const timeSlots2 = [createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T13:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots1)
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, timeSlots2)

      const result = await availabilityService.getCommonAvailability(testgroup1.id)

      expect(result.length).toBeGreaterThan(0)

      const hasOverlap = result.some(slot => {
        return slot.user.length >= 2 &&
               slot.start <= new Date('2025-01-15T10:00:00Z') &&
               slot.end >= new Date('2025-01-15T12:00:00Z')
      })
      expect(hasOverlap).toBe(true)
    })

    test('should respect minimum required members parameter', async () => {
      const timeSlots1 = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      const timeSlots2 = [createTimeSlot('2025-01-15T14:00:00Z', '2025-01-15T17:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots1)
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, timeSlots2)

      const result = await availabilityService.getCommonAvailability(testgroup1.id, 2)

      expect(result).toEqual([])
    })

    test('should handle three-user overlapping scenario', async () => {
      const timeSlots1 = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T15:00:00Z')]
      const timeSlots2 = [createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T14:00:00Z')]
      const timeSlots3 = [createTimeSlot('2025-01-15T11:00:00Z', '2025-01-15T13:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup2.id, timeSlots1)
      await availabilityService.setAvailability(testuser2.id, testgroup2.id, timeSlots2)
      await availabilityService.setAvailability(testuser3.id, testgroup2.id, timeSlots3)

      const result = await availabilityService.getCommonAvailability(testgroup2.id, 2)

      expect(result.length).toBeGreaterThan(0)

      const hasMultiUserOverlap = result.some(slot => slot.user.length >= 2)
      expect(hasMultiUserOverlap).toBe(true)

      const hasThreeUserOverlap = result.some(slot => slot.user.length === 3)
      expect(hasThreeUserOverlap).toBe(true)
    })

    test('should handle single user availability', async () => {
      const timeSlots = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots)

      const result = await availabilityService.getCommonAvailability(testgroup1.id, 1)

      expect(result).toHaveLength(1)
      expect(result[0].user).toHaveLength(1)
      expect(result[0].user[0]).toBe(testuser1.id.toString())
      expect(result[0].start).toEqual(timeSlots[0].start)
      expect(result[0].end).toEqual(timeSlots[0].end)
    })

    test('should handle multiple time slots per user', async () => {
      const timeSlots1 = [
        createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T11:00:00Z'),
        createTimeSlot('2025-01-15T13:00:00Z', '2025-01-15T15:00:00Z')
      ]
      const timeSlots2 = [
        createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T12:00:00Z'),
        createTimeSlot('2025-01-15T14:00:00Z', '2025-01-15T16:00:00Z')
      ]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, timeSlots1)
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, timeSlots2)

      const result = await availabilityService.getCommonAvailability(testgroup1.id, 2)

      expect(result.length).toBeGreaterThan(0)

      const morningOverlap = result.some(slot =>
        slot.user.length >= 2 &&
        slot.start <= new Date('2025-01-15T10:30:00Z') &&
        slot.end >= new Date('2025-01-15T10:30:00Z')
      )

      const afternoonOverlap = result.some(slot =>
        slot.user.length >= 2 &&
        slot.start <= new Date('2025-01-15T14:30:00Z') &&
        slot.end >= new Date('2025-01-15T14:30:00Z')
      )

      expect(morningOverlap || afternoonOverlap).toBe(true)
    })
  })
  describe('Integration between methods', () => {
    test('should handle full user availability lifecycle', async () => {
      const user1TimeSlots = [
        createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z'),
        createTimeSlot('2025-01-15T14:00:00Z', '2025-01-15T17:00:00Z')
      ]
      const user2TimeSlots = [
        createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T13:00:00Z'),
        createTimeSlot('2025-01-15T15:00:00Z', '2025-01-15T18:00:00Z')
      ]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, user1TimeSlots)
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, user2TimeSlots)

      const user1Availability = await availabilityService.getUserAvailability(testuser1.id, testgroup1.id)
      const user2Availability = await availabilityService.getUserAvailability(testuser2.id, testgroup1.id)

      expect(user1Availability.timeSlots).toHaveLength(2)
      expect(user2Availability.timeSlots).toHaveLength(2)

      const groupAvailability = await availabilityService.getGroupAvailability(testgroup1.id)

      expect(groupAvailability).toHaveLength(2)
      expect(groupAvailability.map(availability => availability.user.username)).toContain('testuser1')
      expect(groupAvailability.map(availability => availability.user.username)).toContain('testuser2')

      const commonAvailability = await availabilityService.getCommonAvailability(testgroup1.id, 2)

      expect(commonAvailability.length).toBeGreaterThan(0)

      const hasExpectedOverlap = commonAvailability.some(slot =>
        slot.user.length === 2 &&
        slot.start >= new Date('2025-01-15T10:00:00Z') &&
        slot.end <= new Date('2025-01-15T12:00:00Z')
      )
      expect(hasExpectedOverlap).toBe(true)
    })
    test('should handle availability updates and reflect in common availability', async () => {
      const initialUser1Slots = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T11:00:00Z')]
      const initialUser2Slots = [createTimeSlot('2025-01-15T13:00:00Z', '2025-01-15T15:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, initialUser1Slots)
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, initialUser2Slots)

      let commonAvailability = await availabilityService.getCommonAvailability(testgroup1.id, 2)
      expect(commonAvailability).toHaveLength(0)

      const updatedUser2Slots = [createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T12:00:00Z')]
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, updatedUser2Slots)

      const updatedUser2Availability = await availabilityService.getUserAvailability(testuser2.id, testgroup1.id)
      expect(updatedUser2Availability.timeSlots).toHaveLength(1)
      expect(updatedUser2Availability.timeSlots[0].start).toEqual(updatedUser2Slots[0].start)

      const groupAvailability = await availabilityService.getGroupAvailability(testgroup1.id)
      const user2Record = groupAvailability.find(a => a.user.username === 'testuser2')
      expect(user2Record.timeSlots).toHaveLength(1)
      expect(user2Record.timeSlots[0].start).toEqual(updatedUser2Slots[0].start)

      commonAvailability = await availabilityService.getCommonAvailability(testgroup1.id, 2)
      expect(commonAvailability.length).toBeGreaterThan(0)

      const hasOverlap = commonAvailability.some(slot =>
        slot.user.length === 2 &&
        slot.start >= new Date('2025-01-15T10:00:00Z') &&
        slot.end <= new Date('2025-01-15T11:00:00Z')
      )
      expect(hasOverlap).toBe(true)
    })

    test('should maintain separate availability across different groups', async () => {
      const group1TimeSlots = [createTimeSlot('2025-01-15T09:00:00Z', '2025-01-15T12:00:00Z')]
      const group2TimeSlots = [createTimeSlot('2025-01-15T14:00:00Z', '2025-01-15T17:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, group1TimeSlots)
      await availabilityService.setAvailability(testuser1.id, testgroup2.id, group2TimeSlots)

      const group1Availability = await availabilityService.getUserAvailability(testuser1.id, testgroup1.id)
      const group2Availability = await availabilityService.getUserAvailability(testuser1.id, testgroup2.id)

      expect(group1Availability.timeSlots[0].start).toEqual(group1TimeSlots[0].start)
      expect(group2Availability.timeSlots[0].start).toEqual(group2TimeSlots[0].start)

      const group1Members = await availabilityService.getGroupAvailability(testgroup1.id)
      const group2Members = await availabilityService.getGroupAvailability(testgroup2.id)

      expect(group1Members).toHaveLength(1)
      expect(group2Members).toHaveLength(1)
      expect(group1Members[0].timeSlots[0].start).toEqual(group1TimeSlots[0].start)
      expect(group2Members[0].timeSlots[0].start).toEqual(group2TimeSlots[0].start)

      const group1Common = await availabilityService.getCommonAvailability(testgroup1.id, 1)
      const group2Common = await availabilityService.getCommonAvailability(testgroup2.id, 1)

      expect(group1Common[0].start).toEqual(group1TimeSlots[0].start)
      expect(group2Common[0].start).toEqual(group2TimeSlots[0].start)
    })

    test('should handle multi-group scenario with overlapping memberships', async () => {
      const user1Group1Slots = [createTimeSlot('2025-01-15T10:00:00Z', '2025-01-15T14:00:00Z')]
      const user1Group2Slots = [createTimeSlot('2025-01-15T11:00:00Z', '2025-01-15T15:00:00Z')]
      const user2Group1Slots = [createTimeSlot('2025-01-15T12:00:00Z', '2025-01-15T16:00:00Z')]
      const user3Group2Slots = [createTimeSlot('2025-01-15T13:00:00Z', '2025-01-15T17:00:00Z')]

      await availabilityService.setAvailability(testuser1.id, testgroup1.id, user1Group1Slots)
      await availabilityService.setAvailability(testuser1.id, testgroup2.id, user1Group2Slots)
      await availabilityService.setAvailability(testuser2.id, testgroup1.id, user2Group1Slots)
      await availabilityService.setAvailability(testuser3.id, testgroup2.id, user3Group2Slots)

      const group1Availability = await availabilityService.getGroupAvailability(testgroup1.id)
      const group2Availability = await availabilityService.getGroupAvailability(testgroup2.id)

      expect(group1Availability).toHaveLength(2)
      expect(group2Availability).toHaveLength(2)

      const group1UserIds = group1Availability.map(a => a.user._id.toString()).sort()
      const group2UserIds = group2Availability.map(a => a.user._id.toString()).sort()

      expect(group1UserIds).toEqual([testuser1.id.toString(), testuser2.id.toString()].sort())
      expect(group2UserIds).toEqual([testuser1.id.toString(), testuser3.id.toString()].sort())

      const group1Common = await availabilityService.getCommonAvailability(testgroup1.id, 2)
      const group2Common = await availabilityService.getCommonAvailability(testgroup2.id, 2)

      expect(group1Common.length).toBeGreaterThan(0)
      expect(group2Common.length).toBeGreaterThan(0)

      const group1HasExpectedOverlap = group1Common.some(slot =>
        slot.user.length === 2 &&
        slot.start >= new Date('2025-01-15T12:00:00Z') &&
        slot.end <= new Date('2025-01-15T14:00:00Z')
      )
      expect(group1HasExpectedOverlap).toBe(true)

      const group2HasExpectedOverlap = group2Common.some(slot =>
        slot.user.length === 2 &&
        slot.start >= new Date('2025-01-15T13:00:00Z') &&
        slot.end <= new Date('2025-01-15T15:00:00Z')
      )
      expect(group2HasExpectedOverlap).toBe(true)
    })
  })
})
