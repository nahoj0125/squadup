/**
 * @file Service for message operations.
 * @module MessageService
 * @author Johan Persson
 */

import { MessageModel } from '../models/messageModel.js'

/**
 *
 */
export class MessageService {
  /**
   * Creates a new message and saves it to the database.
   *
   * @param {string} content - The content of the message.
   * @param {string} senderId - The ID of the sender.
   * @param {string} groupId - The ID of the group.
   * @returns {Promise<object>} The created message object.
   */
  async createMessage (content, senderId, groupId) {
    try {
      const message = new MessageModel({
        content,
        sender: senderId,
        group: groupId
      })

      await message.save()

      return message
    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   * Retrieves messages for a specific group from the database.
   *
   * @param {string} groupId - The ID of the group to retrieve messages for.
   * @param {number} [limit=50] - The maximum number of messages to retrieve.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of message objects.
   */
  async getMessageByGroup (groupId, limit = 50) {
    try {
      return await MessageModel.find({ group: groupId })
        .populate('sender', 'username firstname lastname')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    } catch (error) {
      throw new Error(error)
    }
  }
}
