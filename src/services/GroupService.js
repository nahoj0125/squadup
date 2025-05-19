/**
 * @file Groupservice with business groups.
 * @module GroupService
 * @author Johan Persson
 */

import { GroupModel } from '../models/groupModel.js'
import mongoose from 'mongoose'

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
    const group = await GroupModel({
      name: groupData.name,
      description: groupData.description,
      creator: creatorId,
      members: [creatorId]
    })
    await group.save()
    return group
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
      throw new Error(error)
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
      throw new Error(error)
    }
  }

  /**
   * Remove a member from a group.
   *
   * @param {string} groupId - ID of the group
   * @param {string} username - Username of the member to remove
   * @param {string} requesterId - ID of the user requesting the removal
   * @returns {Promise<object>} The updated group
   * @throws {Error} If the operation fails
   */
  async removeMember (groupId, username, requesterId) {
    try {
      const group = await GroupModel.findById(groupId)
        .populate('members', 'username')
        .populate('creator', 'username')

      if (!group) {
        throw new Error('Group not found')
      }

      if (group.creator._id.toString() !== requesterId) {
        throw new Error('Only the creator of the group can remove members')
      }

      const UserModel = mongoose.model('User')
      const memberToRemove = await UserModel.findOne({ username })

      if (!memberToRemove) {
        throw new Error(`User "${username}" not found`)
      }

      const isMember = group.members.some(member => member._id.toString() === memberToRemove._id.toString())
      if (!isMember) {
        throw new Error(`User "${username}" is not a member of this group`)
      }

      if (memberToRemove._id.toString() === group.creator._id.toString()) {
        throw new Error('Group creator cannot be removed from the group')
      }

      group.members = group.members.filter(member => member._id.toString() !== memberToRemove._id.toString())

      await group.save()

      return await GroupModel.findById(groupId)
        .populate('creator', 'username firstname lastname')
        .populate('members', 'username firstname lastname')
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Delete a group.
   *
   * @param {string} groupId - ID of the group to delete
   * @param {string} requesterId - ID of the user requesting the deletion
   * @returns {Promise<boolean>} True if the group was successfully deleted
   * @throws {Error} If the operation fails
   */
  async deleteGroup (groupId, requesterId) {
    try {
      const group = await GroupModel.findById(groupId)

      if (!group) {
        throw new Error('Group not found')
      }

      if (group.creator._id.toString() !== requesterId) {
        throw new Error('Only the creator of the group can delete the group')
      }

      await GroupModel.findByIdAndDelete(groupId)

      return true
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
