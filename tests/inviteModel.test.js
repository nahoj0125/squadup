import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { InvitationModel } from '../src/models/inviteModel.js'
import { UserModel } from '../src/models/UserModel.js'
import { GroupModel } from '../src/models/groupModel.js'

let mongoServer

describe('InvitationModel', () => {
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
    await InvitationModel.deleteMany({})
    await GroupModel.deleteMany({})
    await UserModel.deleteMany({})
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
   * @param {string} name - The name of the test group.
   * @param {object} creator - The user object representing the creator of the group.
   * @returns {Promise<object>} The saved group object.
   */
  const createTestGroup = async (name = 'Test group', creator) => {
    const group = new GroupModel({
      name,
      description: 'this is a test group.',
      creator: creator._id,
      members: [creator._id]
    })

    return await group.save()
  }

  describe('Validate schema', () => {
    test('should create an invitation with valid data', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id
      }

      const invitation = new InvitationModel(invitationData)
      const savedInvitation = await invitation.save()

      expect(savedInvitation).toHaveProperty('_id')
      expect(savedInvitation.group.toString()).toBe(group._id.toString())
      expect(savedInvitation.invitedBy.toString()).toBe(creator._id.toString())
      expect(savedInvitation.invitedUser.toString()).toBe(invitedUser._id.toString())
      expect(savedInvitation.status).toBe('pending')
    })

    test('should fail wo create an invitation without a group', async () => {
      const creator = await createTestUser('creator', 'creator@example.com')
      const invitedUser = await createTestUser('invitedUser', 'invitedUser@example.com')

      const invitationData = {
        invitedBy: creator._id,
        invitedUser: invitedUser._id
      }

      const invitation = new InvitationModel(invitationData)
      await expect(invitation.save()).rejects.toThrow()

      try {
        await invitation.save()
      } catch (error) {
        expect(error.errors.group).toBeDefined()
        expect(error.errors.group.kind).toBe(('required'))
      }
    })

    test('should fail to create an invitation without creator', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedUser: invitedUser._id
      }

      const invitation = new InvitationModel(invitationData)
      await expect(invitation.save()).rejects.toThrow()

      try {
        await invitation.save()
      } catch (error) {
        expect(error.errors.invitedBy).toBeDefined()
        expect(error.errors.invitedBy.kind).toBe('required')
      }
    })

    test('should fail to create an invitation without invited user', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id
      }

      const invitation = new InvitationModel(invitationData)
      await expect(invitation.save()).rejects.toThrow()

      try {
        await invitation.save()
      } catch (error) {
        expect(error.errors.invitedUser).toBeDefined()
        expect(error.errors.invitedUser.kind).toBe('required')
      }
    })

    test('should fail to create an invitation with invalid status', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id,
        status: 'invalidStatus'
      }

      const invitation = new InvitationModel(invitationData)
      await expect(invitation.save()).rejects.toThrow()

      try {
        await invitation.save()
      } catch (error) {
        expect(error.errors.status).toBeDefined()
        expect(error.errors.status.kind).toBe('enum')
      }
    })

    test('should create an invitation with accepted status', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id,
        status: 'accepted'
      }

      const invitation = new InvitationModel(invitationData)
      const savedInvitation = await invitation.save()

      expect(savedInvitation.status).toBe('accepted')
    })

    test('should create an invitation with declined status', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id,
        status: 'declined'
      }

      const invitation = new InvitationModel(invitationData)
      const savedInvitation = await invitation.save()

      expect(savedInvitation.status).toBe('declined')
    })
  })

  describe('Invitation functionality', () => {
    test('should allow udating the status of an invitation from pending to accepted', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id
      }

      const invitation = new InvitationModel(invitationData)
      let savedInvitation = await invitation.save()

      savedInvitation.status = 'accepted'
      savedInvitation = await savedInvitation.save()

      expect(savedInvitation.status).toBe('accepted')
    })

    test('should allow updating the status of an invitation from pending to declined', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id
      }

      const invitation = new InvitationModel(invitationData)
      let savedInvitation = await invitation.save()

      savedInvitation.status = 'declined'
      savedInvitation = await savedInvitation.save()

      expect(savedInvitation.status).toBe('declined')
    })
  })

  describe('Populate', () => {
    test('should populate the group, invitedBy and invitedUser references', async () => {
      const creator = await createTestUser('creator', 'creator@example.com')
      const invitedUser = await createTestUser('invitedUser', 'inviteduser@example.com')
      const group = await createTestGroup('Populated group', creator)

      const invitationData = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id
      }

      const invitation = new InvitationModel(invitationData)
      const savedInvitation = await invitation.save()

      const populatedInvitation = await InvitationModel.findById(savedInvitation._id)
        .populate('group')
        .populate('invitedBy')
        .populate('invitedUser')

      expect(populatedInvitation.group).toHaveProperty('name')
      expect(populatedInvitation.group.name).toBe('Populated group')

      expect(populatedInvitation.invitedBy).toHaveProperty('username')
      expect(populatedInvitation.invitedBy.username).toBe('creator')

      expect(populatedInvitation.invitedUser).toHaveProperty('username')
      expect(populatedInvitation.invitedUser.username).toBe('invitedUser')
    })
  })

  describe('Invitation uniqueness', () => {
    test('should not allow duplicate invitations for the same user and group', async () => {
      const creator = await createTestUser('creator', 'test@example.com')
      const invitedUser = await createTestUser('inviteduser', 'inviteduser@example.com')
      const group = await createTestGroup('Test group', creator)

      const invitationData1 = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id
      }

      await new InvitationModel(invitationData1).save()

      const invitationData2 = {
        group: group._id,
        invitedBy: creator._id,
        invitedUser: invitedUser._id
      }

      const duplicateInvitation = new InvitationModel(invitationData2)

      await expect(duplicateInvitation.save()).rejects.toThrow()

      try {
        await duplicateInvitation.save()
      } catch (error) {
        expect(error.code).toBe(11000)
      }
    })
  })
})
