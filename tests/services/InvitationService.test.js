import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { InvitationService } from '../../src/services/InvitationService.js'
import { InvitationModel } from '../../src/models/inviteModel.js'
import { UserModel } from '../../src/models/UserModel.js'
import { GroupModel } from '../../src/models/groupModel.js'
import { describe, test } from '@jest/globals'

let mongoServer

describe('InvitationService', () => {
  const invitationService = new InvitationService()

  let testuser1
  let testuser2
  let testuser3
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
    await InvitationModel.deleteMany({})
    await UserModel.deleteMany({})
    await GroupModel.deleteMany({})

    testuser1 = await createTestUser('testuser1', 'testuser1@example.com')
    testuser2 = await createTestUser('testuser2', 'testuser2@example.com')
    testuser3 = await createTestUser('testuser3', 'testuser3@example.com')
    testGroup = await createTestGroup('Test Group', testuser1.id, [testuser1.id])
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

  describe('inviteUser', () => {
    test('should invite a user to a group', async () => {
      const invitation = await invitationService.inviteUser(testGroup.id, testuser1.id, testuser2.username)

      expect(invitation).toBeDefined()
      expect(invitation.group.toString()).toBe(testGroup.id)
      expect(invitation.invitedBy.toString()).toBe(testuser1.id)
      expect(invitation.invitedUser.toString()).toBe(testuser2.id)
      expect(invitation.status).toBe('pending')
    })

    test('should throw error when invited user does not exist', async () => {
      await expect(invitationService.inviteUser(testGroup.id, testuser1.id, 'nonexistinguser')).rejects.toThrow()
    })
  })

  describe('getPendingInvitations', () => {
    test('should retrieve pending invitations for a user', async () => {
      const invitationData1 = new InvitationModel({
        group: testGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'pending'
      })
      await invitationData1.save()

      const secondTestGroup = await createTestGroup('Second Group', testuser3.id, [testuser3.id])

      const invitationData2 = new InvitationModel({
        group: secondTestGroup.id,
        invitedBy: testuser3.id,
        invitedUser: testuser2.id,
        status: 'pending'
      })
      await invitationData2.save()

      const invitations = await invitationService.getPendingInvitations(testuser2.id)

      expect(invitations).toHaveLength(2)

      for (const invitation of invitations) {
        expect(invitation.group).toHaveProperty('name')
        expect(invitation.invitedBy).toHaveProperty('username')
      }
    })

    test('should not retrieve accepted or declined invitations', async () => {
      const pendingGroup = await createTestGroup('Pending Group', testuser1.id, [testuser1.id])
      const pendinginvitation = new InvitationModel({
        group: pendingGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'pending'
      })
      await pendinginvitation.save()

      const acceptedGroup = await createTestGroup('Accepted Group', testuser1.id, [testuser1.id])
      const acceptedinvitation = new InvitationModel({
        group: acceptedGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'accepted'
      })
      await acceptedinvitation.save()

      const declinedGroup = await createTestGroup('Declined Group', testuser1.id, [testuser1.id])
      const declinedinvitations = new InvitationModel({
        group: declinedGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'declined'
      })
      await declinedinvitations.save()

      const pendingInvitations = await invitationService.getPendingInvitations(testuser2.id)

      expect(pendingInvitations).toHaveLength(1)
      expect(pendingInvitations[0].status).toBe('pending')
      expect(pendingInvitations[0].group.name).toBe('Pending Group')
    })

    test('should return an empty array when a user has no pending invitations', async () => {
      const invitations = await invitationService.getPendingInvitations(testuser1.id)

      expect(invitations).toHaveLength(0)
    })
  })

  describe('processInvitations', () => {
    test('should accept an invitation and add user to a group', async () => {
      const invitation = new InvitationModel({
        group: testGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'pending'
      })
      await invitation.save()

      const processedInvitation = await invitationService.processInvitation(invitation, testuser2.id, true)

      expect(processedInvitation.status).toBe('accepted')

      const updatedGroup = await GroupModel.findById(testGroup)
      const membersId = updatedGroup.members.map(members => members.toString())
      expect(membersId).toContain(testuser2.id)
    })

    test('should decline an invitation without adding user to the group', async () => {
      const invitation = new InvitationModel({
        group: testGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'pending'
      })
      await invitation.save()

      const procressedInvitation = await invitationService.processInvitation(invitation, testuser2.id, false)

      expect(procressedInvitation.status).toBe('declined')

      const updatedGroup = await GroupModel.findById(testGroup)
      const membersId = updatedGroup.members.map(members => members.toString())
      expect(membersId).not.toContain(testuser2.id)
    })

    test('should throw an error when an invitation is not found', async () => {
      const invitation = new InvitationModel({
        group: testGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'pending'
      })
      await invitation.save()

      await expect(invitationService.processInvitation(invitation.id, testuser1.id, true)).rejects.toThrow('Invitation not found')
    })

    test('should throw an error when invitation has already been accepted', async () => {
      const invitation = new InvitationModel({
        group: testGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'accepted'
      })
      await invitation.save()

      await expect(invitationService.processInvitation(invitation.id, testuser2.id, true)).rejects.toThrow('Invitation already processed')
    })

    test('should not add user if user is already a member', async () => {
      testGroup.members.push(testuser2.id)
      await testGroup.save()

      const invitation = new InvitationModel({
        group: testGroup.id,
        invitedBy: testuser1.id,
        invitedUser: testuser2.id,
        status: 'pending'
      })
      await invitation.save()

      await invitationService.processInvitation(invitation.id, testuser2.id, true)

      const updatedGroup = await GroupModel.findById(testGroup.id)
      const membersId = updatedGroup.members.map(members => members.toString())
      expect(membersId.filter(id => id === testuser2.id)).toHaveLength(1)
    })
  })

  describe('Integration between methods', () => {
    test('should invite user, then fetch invitation', async () => {
      await invitationService.inviteUser(testGroup.id, testuser1.id, testuser2.username)
      const pendingInvitations = await invitationService.getPendingInvitations(testuser2.id)

      expect(pendingInvitations).toHaveLength(1)
    })

    test('should invite a user, accept the invitation, then verify membership', async () => {
      const invitation = await invitationService.inviteUser(testGroup, testuser1.id, testuser2.username)

      await invitationService.processInvitation(invitation.id, testuser2.id, true)

      const updatedGroup = await GroupModel.findById(testGroup.id)
      const membersId = updatedGroup.members.map(member => member.toString())
      expect(membersId).toContain(testuser2.id)

      const pendinginvitation = await invitationService.getPendingInvitations(testuser2.id)
      expect(pendinginvitation).toHaveLength(0)
    })

    test('should invite a user, decline the invitation, then verify non-membership', async () => {
      const invitation = await invitationService.inviteUser(testGroup.id, testuser1.id, testuser2.username)

      await invitationService.processInvitation(invitation.id, testuser2.id, false)

      const updatedGroup = await GroupModel.findById(testGroup)
      const membersId = updatedGroup.members.map(member => member.toString())
      expect(membersId).not.toContain(testuser2.id)

      const pendinginvitation = await invitationService.getPendingInvitations(testuser2.id)
      expect(pendinginvitation).toHaveLength(0)
    })
  })
})
