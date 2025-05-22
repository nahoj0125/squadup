/**
 * @file Defines the MessageController class.
 * @module MessageController
 * @author Johan Persson
 */

import { MessageService } from '../services/MessageService.js'

/**
 * Represents the controller for handling messages.
 */
export class MessageController {
  #messageService

  /**
   * Initializes a new instance of the MessageController class.
   */
  constructor () {
    this.#messageService = new MessageService()
  }

  /**
   * Create a new message in a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async createMessage (req, res, next) {
    try {
      const groupId = req.params.id
      const userId = req.session.user.id
      const { content } = req.body

      if (!content || content.trim() === '') {
        req.session.flash = {
          type: 'error',
          text: 'Message cannot be empty'
        }
        return res.render(`/groups/${groupId}`)
      }
      await this.#messageService.createMessage(content, userId, groupId)

      return res.redirect(`/groups/${groupId}`)
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
    }
  }
}
