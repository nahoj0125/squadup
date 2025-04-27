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
   *
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
   *
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
