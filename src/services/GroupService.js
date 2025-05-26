/**
 * @file Groupservice with business groups.
 * @module GroupService
 * @author Johan Persson
 */

import { GroupModel } from '../models/groupModel.js'
import { UserModel } from '../models/UserModel.js'

/**
 *
 */
export class GroupService {
  /**
   * Create a new group.
   *
   * @param {object} groupData - Group data including name, description, etc.
   * @param {string} creatorId - ID of the user creating the group
   * @returns {Promise<object>} The created group
   * @throws {Error} If creation fails
   */
  async createGroup (groupData, creatorId) {
    try {
      const group = await GroupModel({
        name: groupData.name,
        description: groupData.description,
        creator: creatorId,
        members: [creatorId]
      })
      await group.save()
      return group
    } catch (error) {
      throw new Error(`Failed to create group: ${error.message}`)
    }
  }

  /**
   * Get groups for a user.
   *
   * @param {string} userId - ID of the user
   * @returns {Promise<Array>} Groups the user is a member of
   */
  async getGroupByUser (userId) {
    try {
      return await GroupModel.find({ members: userId })
        .populate('creator', 'username')
        .sort({ createdAt: -1 })
    } catch (error) {
      throw new Error(`Failed to retrieve user groups: ${error.message}`)
    }
  }

  /**
   * Get a group by ID.
   *
   * @param {string} groupId - ID of the group
   * @returns {Promise<object>} The group
   * @throws {Error} If group not found
   */
  async getGroupById (groupId) {
    try {
      const group = await GroupModel.findById(groupId)
        .populate('creator', 'username firstname lastname')
        .populate('members', 'username firstname lastname')

      return group
    } catch (error) {
      throw new Error(`Failed to retrieve group: ${error.message}`)
    }
  }

  /**
   * Remove a member from a group.
   *
   * @param {string} groupId - ID of the group
   * @param {string} username - Username of the member to remove
   * @param {string} requesterId - ID of the user requesting the removal
   * @returns {Promise<void>} Resolves when the member is removed
   * @throws {Error} If removal fails
   */
  async removeMember (groupId, username, requesterId) {
    try {
      const group = await this.#getGroupWithMembers(groupId)
      this.#validateCreatorPermission(group, requesterId)
      const memberToRemove = await this.#findUserByUsername(username)
      this.#validateMemberRemoval(group, memberToRemove._id, username)
      await this.#removeMemberFromGroup(group, memberToRemove._id)

      return await this.#removeMemberFromGroup(group, memberToRemove._id)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Delete a group.
   *
   * @param {string} groupId - ID of the group to delete
   * @param {string} requesterId - ID of the user requesting the deletion
   * @returns {Promise<boolean>} True if the group was deleted
   * @throws {Error} If deletion fails or requester is not the creator
   */
  async deleteGroup (groupId, requesterId) {
    try {
      const group = await this.#findGroupById(groupId)
      this.#validateCreatorPermission(group, requesterId)
      await GroupModel.findByIdAndDelete(groupId)

      return true
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Retrieve a group by ID and populate its members and creator.
   *
   * @param {string} groupId - ID of the group
   * @returns {Promise<object>} The group with populated members and creator
   * @throws {Error} If group not found
   */
  async #getGroupWithMembers (groupId) {
    const group = await GroupModel.findById(groupId)
      .populate('members', 'username')
      .populate('creator', 'username')

    if (!group) {
      throw new Error('Group not found')
    }

    return group
  }

  /**
   * Validates if the requester is the creator of the group.
   *
   * @param {object} group - The group object.
   * @param {string} requesterId - ID of the user requesting the action.
   * @throws {Error} If the requester is not the creator.
   */
  async #validateCreatorPermission (group, requesterId) {
    if (group.creator._id.toString() !== requesterId) {
      throw new Error('Only the creator of the group can perform this action')
    }
  }

  /**
   * Finds a user by their username.
   *
   * @param {string} username - The username of the user to find.
   * @returns {Promise<object>} The user object if found.
   * @throws {Error} If the user is not found.
   */
  async #findUserByUsername (username) {
    const user = await UserModel.findOne({ username })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Validates if a member can be removed from the group.
   *
   * @param {object} group - The group object.
   * @param {object} memberToRemove - The member to remove (user object or ID).
   * @param {string} username - The username of the member to remove.
   * @throws {Error} If the member cannot be removed.
   */
  #validateMemberRemoval (group, memberToRemove, username) {
    const isMember = group.members.some(member => member._id.toString() === memberToRemove._id.toString())

    if (!isMember) {
      throw new Error(`User "${username}" is not a member of this group`)
    }

    if (memberToRemove.toString() === group.creator._id.toString()) {
      throw new Error('Group creator cannot be removed from the group')
    }
  }

  /**
   * Removes a member from the group's members array and saves the group.
   *
   * @param {object} group - The group object.
   * @param {string|object} memberId - The ID of the member to remove.
   * @returns {Promise<void>} Resolves when the member is removed and the group is saved.
   */
  async #removeMemberFromGroup (group, memberId) {
    group.members = group.members.filter(member => member._id.toString() !== memberId.toString())

    await group.save()
  }

  /**
   * Finds a group by its ID.
   *
   * @param {string} groupId - The ID of the group to find.
   * @returns {Promise<object>} The group object if found.
   * @throws {Error} If the group is not found.
   */
  async #findGroupById (groupId) {
    const group = await GroupModel.findById(groupId)

    if (!group) {
      throw new Error('Group not found')
    }

    return group
  }
}
