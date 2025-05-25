/**
 * @file
 * @module UserService
 * @author Johan Persson
 */

import bcrypt from 'bcrypt'
import { AvailabilityModel } from '../models/availabliltyModel.js'
import { UserModel } from '../models/UserModel.js'
import { MessageModel } from '../models/messageModel.js'
import { InvitationModel } from '../models/inviteModel.js'
import { GroupModel } from '../models/groupModel.js'

/**
 * Service for user-related operations.
 */
export class UserService {
  /**
   * Delete a user account and all associated data.
   *
   * @param {string} userId - ID of the user to delete
   * @returns {Promise<boolean>} Success indicator
   * @throws {Error} If deletion fails
   */
  async deleteUserAccount (userId) {
    try {
      await this.#verifyUserExists(userId)
      await this.#deleteUserData(userId)
      await this.#removeUserFromGroups(userId)
      await this.#deleteUserCreatedGroups(userId)
      await this.#deleteUserAccount(userId)

      return true
    } catch (error) {
      throw new Error(`Failed to delete user account: ${error.message}`)
    }
  }

  /**
   * Verify that a user exists.
   *
   * @param {string} userId - ID of the user to verify
   * @throws {Error} If user not found
   * @private
   */
  async #verifyUserExists (userId) {
    const user = await UserModel.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }
  }

  /**
   * Delete user's personal data (availability, messages, invitations).
   *
   * @param {string} userId - ID of the user
   * @private
   */
  async #deleteUserData (userId) {
    await AvailabilityModel.deleteMany({ user: userId })
    await MessageModel.deleteMany({ user: userId })
    await InvitationModel.deleteMany({
      $or: [
        { inviter: userId },
        { invitedUser: userId }
      ]
    })
  }

  /**
   * Remove user from all groups they're members of.
   *
   * @param {string} userId - ID of the user
   * @private
   */
  async #removeUserFromGroups (userId) {
    await GroupModel.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    )
  }

  /**
   * Delete all groups created by the user and their associated data.
   *
   * @param {string} userId - ID of the user
   * @private
   */
  async #deleteUserCreatedGroups (userId) {
    const userGroups = await GroupModel.find({ creator: userId })

    for (const group of userGroups) {
      await this.#deleteGroupData(group._id)
      await GroupModel.findByIdAndDelete(group._id)
    }
  }

  /**
   * Delete all data associated with a specific group.
   *
   * @param {string} groupId - ID of the group
   * @private
   */
  async #deleteGroupData (groupId) {
    await MessageModel.deleteMany({ group: groupId })
    await AvailabilityModel.deleteMany({ group: groupId })
    await InvitationModel.deleteMany({ group: groupId })
  }

  /**
   * Delete the user account from the database.
   *
   * @param {string} userId - ID of the user
   * @private
   */
  async #deleteUserAccount (userId) {
    await UserModel.findByIdAndDelete(userId)
  }

  /**
   * Verify a user's password.
   *
   * @param {string} userId - ID of the user
   * @param {string} password - Plain text password to verify
   * @returns {Promise<boolean>} True if password is correct
   * @throws {Error} If user not found or password is incorrect
   */
  async verifyPassword (userId, password) {
    try {
      const user = await UserModel.findById(userId)

      if (!user) {
        throw new Error('User not found')
      }

      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        throw new Error('Invalid password')
      }

      return true
    } catch (error) {
      throw new Error(`Password verification failed: ${error.message}`)
    }
  }
}
