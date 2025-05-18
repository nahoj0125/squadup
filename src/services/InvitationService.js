/**
 * @file Service for invitation operations.
 * @module InvitationService
 * @author Johan Persson
 */

import { GroupModel } from '../models/groupModel.js'
import { InvitationModel } from '../models/inviteModel.js'
import { UserModel } from '../models/UserModel.js'

/**
 *
 */
export class InvitationService {
  /**
   * Invites a user to a group.
   *
   * @param {string} groupId - The ID of the group to which the user is being invited.
   * @param {string} inviterId - The ID of the user sending the invitation.
   * @param {string} username - The username of the user being invited.
   * @returns {Promise<object>} The created invitation object.
   */
  async inviteUser (groupId, inviterId, username) {
    const invitedUser = await UserModel.findOne({ username })
    if (!invitedUser) {
      throw new Error('User not found')
    }

    const invitation = new InvitationModel({
      group: groupId,
      invitedBy: inviterId,
      invitedUser: invitedUser._id
    })

    await invitation.save()
    return invitation
  }

  /**
   * Retrieves pending invitations for a specific user.
   *
   * @param {string} userId - The ID of the user whose pending invitations are being retrieved.
   * @returns {Promise<Array>} A promise that resolves to an array of pending invitations.
   */
  async getPendingInvitations (userId) {
    return InvitationModel.find({
      invitedUser: userId,
      status: 'pending'
    })
      .populate('group', 'name')
      .populate('invitedBy', 'username')
  }

  /**
   * Processes an invitation by either accepting or declining it.
   *
   * @param {string} invitationId - The ID of the invitation to process.
   * @param {string} userId - The ID of the user processing the invitation.
   * @param {boolean} accept - Whether the invitation is accepted (true) or declined (false).
   * @returns {Promise<object>} The updated invitation object.
   */
  async processInvitation (invitationId, userId, accept) {
    const invitation = await InvitationModel.findById(invitationId)

    if (!invitation || invitation.invitedUser.toString() !== userId) {
      throw new Error('Invitation not found')
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation already processed')
    }

    invitation.status = accept ? 'accepted' : 'declined'
    await invitation.save()

    if (accept) {
      await GroupModel.findByIdAndUpdate(
        invitation.group,
        { $addToSet: { members: userId } }
      )
    }
    return invitation
  }
}
