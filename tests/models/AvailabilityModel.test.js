import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AvailabilityModel } from '../../src/models/availabliltyModel.js'
import { UserModel } from '../../src/models/UserModel.js'
import { GroupModel } from '../../src/models/groupModel.js'
import { beforeEach, describe } from '@jest/globals'

let mongoServer

describe('AvailabilityModel', () => {
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
    test('should create a vail avilability with valid data', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const timeNowPlusSixHours = new Date(timeNow)
      timeNowPlusSixHours.setHours(timeNow.getHours() + 6)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          },
          {
            start: timeNowPlusTwoHours,
            end: timeNowPlusSixHours
          }
        ]
      }

      const availability = new AvailabilityModel(availabilityData)
      const savedAvailability = await availability.save()

      const firstSlotDuration = savedAvailability.timeSlots[0].end - savedAvailability.timeSlots[0].start
      const sencondSlotDuration = savedAvailability.timeSlots[1].end - savedAvailability.timeSlots[1].start

      expect(savedAvailability).toHaveProperty('_id')
      expect(savedAvailability.user.toString()).toBe(user._id.toString())
      expect(savedAvailability.group.toString()).toBe(group._id.toString())
      expect(savedAvailability.timeSlots).toHaveLength(2)
      expect(savedAvailability.timeSlots[0].start).toEqual(timeNow)
      expect(savedAvailability.timeSlots[0].end).toEqual(timeNowPlusTwoHours)
      expect(savedAvailability.timeSlots[1].start).toEqual(timeNowPlusTwoHours)
      expect(savedAvailability.timeSlots[1].end).toEqual(timeNowPlusSixHours)
      expect(firstSlotDuration).toBe(2 * 60 * 60 * 1000)
      expect(sencondSlotDuration).toBe(4 * 60 * 60 * 1000)
    })

    test('should fail when there is no user', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData = {
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      const availability = new AvailabilityModel(availabilityData)

      await expect(availability.save()).rejects.toThrow()

      try {
        await availability.save()
      } catch (error) {
        expect(error.errors.user).toBeDefined()
        expect(error.errors.user.kind).toBe('required')
      }
    })

    test('should fail when there is no group', async () => {
      const user = await createTestUser()

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData = {
        user: user._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      const availability = new AvailabilityModel(availabilityData)

      await expect(availability.save()).rejects.toThrow()

      try {
        await availability.save()
      } catch (error) {
        expect(error.errors.group).toBeDefined()
        expect(error.errors.group.kind).toBe('required')
      }
    })

    test('should allow empty timeslots', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSlots: []
      }

      const availability = new AvailabilityModel(availabilityData)
      const savedAvailability = await availability.save()

      expect(savedAvailability.timeSlots).toHaveLength(0)
    })

    test('should fail when there is no start time', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSlots: [{
          end: timeNowPlusTwoHours
        }]
      }

      const availability = new AvailabilityModel(availabilityData)
      await expect(availability.save()).rejects.toThrow()

      try {
        await availability.save()
      } catch (error) {
        expect(error.errors['timeSlots.0.start']).toBeDefined()
        expect(error.errors['timeSlots.0.start'].kind).toBe('required')
      }
    })

    test('should fail when there is no end time', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSlots: [{
          start: timeNow
        }]
      }

      const availability = new AvailabilityModel(availabilityData)
      await expect(availability.save()).rejects.toThrow()

      try {
        await availability.save()
      } catch (error) {
        expect(error.errors['timeSlots.0.end']).toBeDefined()
        expect(error.errors['timeSlots.0.end'].kind).toBe('required')
      }
    })
  })

  describe('Compound index', () => {
    test('should allow multiple abaliabilities for the same user in multiple groups', async () => {
      const user = await createTestUser()
      const group1 = await createTestGroup(user, 'Group 1')
      const group2 = await createTestGroup(user, 'Group 2')

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData1 = {
        user: user._id,
        group: group1._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      await new AvailabilityModel(availabilityData1).save()

      const availabilityData2 = {
        user: user._id,
        group: group2._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      const savedAvailability = await new AvailabilityModel(availabilityData2).save()

      expect(savedAvailability).toHaveProperty('_id')
    })

    test('should allow mutiple avalabilities  for different users in the same group', async () => {
      const user1 = await createTestUser('testuser1', 'testuser1@example.com')
      const user2 = await createTestUser('testuser2', 'testuser2@example.com')
      const group = await createTestGroup(user1, 'Test Group')

      group.members.push(user2._id)
      await group.save()

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData1 = {
        user: user1._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      await new AvailabilityModel(availabilityData1).save()

      const availabilityData2 = {
        user: user2._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      const savedAvailability = await new AvailabilityModel(availabilityData2).save()
      expect(savedAvailability).toHaveProperty('_id')
    })

    test('should replace existing availability when user and group are the same', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData1 = {
        user: user._id,
        group: group._id,
        timeSlots: [{
          start: timeNow,
          end: timeNowPlusTwoHours
        }]
      }

      const savedAvailability = await new AvailabilityModel(availabilityData1).save()

      const nextDay = new Date()
      nextDay.setDate(nextDay.getDate() + 1)

      savedAvailability.timeSlots = [
        {
          start: timeNow,
          end: nextDay
        }
      ]

      const updatedAvailability = await savedAvailability.save()

      expect(updatedAvailability.timeSlots).toHaveLength(1)
      expect(updatedAvailability.timeSlots[0].start).toEqual(timeNow)
      expect(updatedAvailability.timeSlots[0].end).toEqual(nextDay)
    })
  })

  describe('Population', () => {
    test('should populate user and group', async () => {
      const user = await createTestUser('availabilityuser', 'testusavailabilityuserer@example.com')
      const group = await createTestGroup(user, 'Availability group')

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSolts: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      const availability = new AvailabilityModel(availabilityData)
      const savedAvailability = await availability.save()

      const populatedAvailability = await AvailabilityModel.findById(savedAvailability._id)
        .populate('user')
        .populate('group')

      expect(populatedAvailability.user).toHaveProperty('username')
      expect(populatedAvailability.user.username).toBe('availabilityuser')
      expect(populatedAvailability.group).toHaveProperty('name')
      expect(populatedAvailability.group.name).toBe('Availability group')
    })
  })

  describe('Time slot operations', () => {
    test('should add a new time slot to existing availability', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      const availability = new AvailabilityModel(availabilityData)
      let savedAvailability = await availability.save()

      const timeNowPlusFourHours = new Date(timeNow)
      timeNowPlusFourHours.setHours(timeNow.getHours() + 4)
      const timeNowPlusSixHours = new Date(timeNow)
      timeNowPlusSixHours.setHours(timeNow.getHours() + 6)

      savedAvailability.timeSlots.push({
        start: timeNowPlusFourHours,
        end: timeNowPlusSixHours
      })

      savedAvailability = await savedAvailability.save()

      expect(savedAvailability.timeSlots).toHaveLength(2)
      expect(savedAvailability.timeSlots[1].start).toEqual(timeNowPlusFourHours)
      expect(savedAvailability.timeSlots[1].end).toEqual(timeNowPlusSixHours)
    })

    test('should remove a time slot from existing availability', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)
      const timeNowPlusFourHours = new Date(timeNow)
      timeNowPlusFourHours.setHours(timeNow.getHours() + 4)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          },
          {
            start: timeNowPlusTwoHours,
            end: timeNowPlusFourHours
          }
        ]
      }

      const availability = new AvailabilityModel(availabilityData)
      let savedAvailability = await availability.save()

      savedAvailability.timeSlots.splice(0, 1)
      savedAvailability = await savedAvailability.save()

      expect(savedAvailability.timeSlots).toHaveLength(1)
      expect(savedAvailability.timeSlots[0].start).toEqual(timeNowPlusTwoHours)
      expect(savedAvailability.timeSlots[0].end).toEqual(timeNowPlusFourHours)
    })

    test('should update a time slot in existing availability', async () => {
      const user = await createTestUser()
      const group = await createTestGroup(user)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)
      const timeNowPlusFourHours = new Date(timeNow)
      timeNowPlusFourHours.setHours(timeNow.getHours() + 4)

      const availabilityData = {
        user: user._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }

      const availability = new AvailabilityModel(availabilityData)
      let savedAvailability = await availability.save()

      savedAvailability.timeSlots[0].end = timeNowPlusFourHours
      savedAvailability = await savedAvailability.save()

      expect(savedAvailability.timeSlots).toHaveLength(1)
      expect(savedAvailability.timeSlots[0].start).toEqual(timeNow)
      expect(savedAvailability.timeSlots[0].end).toEqual(timeNowPlusFourHours)
    })
  })

  describe('Query operations', () => {
    test('should fins availability by user and group', async () => {
      const user1 = await createTestUser('testuser1', 'testuser1@example.com')
      const user2 = await createTestUser('testuser2', 'testuser2@example.com')
      const group1 = await createTestGroup(user1, 'Group 1')
      const group2 = await createTestGroup(user1, 'Group 2')

      group1.members.push(user2._id)
      group2.members.push(user2._id)
      await group1.save()
      await group2.save()

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      await new AvailabilityModel({
        user: user1._id,
        group: group1._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }).save()

      await new AvailabilityModel({
        user: user1._id,
        group: group2._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }).save()

      await new AvailabilityModel({
        user: user2._id,
        group: group1._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }).save()

      const found = await AvailabilityModel.findOne({
        user: user1._id,
        group: group1.id
      })

      expect(found).toBeDefined()
      expect(found.user.toString()).toBe(user1._id.toString())
      expect(found.group.toString()).toBe(group1._id.toString())
    })

    test('should find all availabilities for a specific group', async () => {
      const user1 = await createTestUser('testuser1', 'testuser1@example.com')
      const user2 = await createTestUser('testuser2', 'testuser2@example.com')
      const user3 = await createTestUser('testuser3', 'testuser3@example.com')
      const group = await createTestGroup(user1, 'Group 1')

      group.members.push(user2._id, user3._id)

      const timeNow = new Date()
      const timeNowPlusTwoHours = new Date(timeNow)
      timeNowPlusTwoHours.setHours(timeNow.getHours() + 2)

      await new AvailabilityModel({
        user: user1._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }).save()

      await new AvailabilityModel({
        user: user2._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }).save()

      await new AvailabilityModel({
        user: user3._id,
        group: group._id,
        timeSlots: [
          {
            start: timeNow,
            end: timeNowPlusTwoHours
          }
        ]
      }).save()

      const availabilityFound = await AvailabilityModel.find({
        group: group._id
      })

      expect(availabilityFound).toHaveLength(3)
      expect(availabilityFound.map(a => a.user.toString())).toContain(user1._id.toString())
      expect(availabilityFound.map(a => a.user.toString())).toContain(user2._id.toString())
      expect(availabilityFound.map(a => a.user.toString())).toContain(user3._id.toString())
    })
  })
})
