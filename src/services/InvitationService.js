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
   *
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
   *
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
   *
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
