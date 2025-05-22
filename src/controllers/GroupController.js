/**
 * @file Defines the GroupController class.
 * @module GroupController
 * @author Johan Persson
 */

import { GroupService } from '../services/GroupService.js'
import { MessageService } from '../services/MessageService.js'

/**
 *
 */
export class GroupController {
  #groupService
  #messageService

  /**
   * Initialize the group controller with necessary services.
   */
  constructor () {
    this.#groupService = new GroupService()
    this.#messageService = new MessageService()
  }

  /**
   * Display groups the user is a member of.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async index (req, res, next) {
    try {
      const userId = req.session.user.id
      const groups = await this.#groupService.getGroupByUser(userId)

      res.render('groups/index', {
        groups,
        title: 'Squad Up | My Groups'
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Show a single group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async show (req, res, next) {
    try {
      const groupId = req.params.id
      const group = await this.#groupService.getGroupById(groupId)
      const messages = await this.#messageService.getMessageByGroup(groupId)

      res.render('groups/show', {
        group,
        messages,
        title: `SquadUp | ${group.name}`
      })
    } catch {

    }
  }

  /**
   * Display the create group form.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async new (req, res, next) {
    try {
      res.render('groups/new', {
        title: 'Create Group | SquadUp',
        formData: {}
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create a new group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async create (req, res, next) {
    try {
      const userId = req.session.user.id

      const groupData = {
        name: req.body.name,
        description: req.body.description
      }

      const group = await this.#groupService.createGroup(groupData, userId)

      req.session.flash = {
        type: 'success',
        text: `Group "${group.name}" created successfully!`
      }

      res.redirect('/groups')
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }

      req.session.formData = {
        name: req.body.name,
        description: req.body.description
      }

      res.redirect('/groups/new')
    }
  }

  /**
   * Display the delete group confirmation form.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async showDeleteGroupForm (req, res, next) {
    try {
      const groupId = req.params.id
      const group = await this.#groupService.getGroupById(groupId)

      if (group.creator._id.toString() !== req.session.user.id) {
        req.session.flash = {
          type: 'error',
          text: 'Only the creator of the group can delete the group'
        }
        return res.redirect(`/groups/${groupId}`)
      }
      res.render('groups/delete', { group })
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect('/groups')
    }
  }

  /**
   * Delete a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteGroup (req, res, next) {
    try {
      const groupId = req.params.id
      const requesterId = req.session.user.id

      await this.#groupService.deleteGroup(groupId, requesterId)

      req.session.flash = {
        type: 'success',
        text: 'Group has been deleted'
      }

      res.redirect('/groups')
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect(`/groups/${req.params.id}`)
    }
  }

  // ***** Membership *****

  /**
   * Display the remove user form for a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async showRemoveUserForm (req, res) {
    try {
      const groupId = req.params.id
      const group = await this.#groupService.getGroupById(groupId)

      if (group.creator.id !== req.session.user.id) {
        req.session.flash = {
          type: 'error',
          text: 'Only the creator can remove users'
        }
        return res.redirect(`/groups/${groupId}`)
      }

      res.render('groups/remove', { group })
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
    }
  }

  /**
   * Remove a member from a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeMember (req, res, next) {
    try {
      const groupId = req.params.id
      const username = req.body.username
      const requesterId = req.session.user.id

      await this.#groupService.removeMember(groupId, username, requesterId)

      req.session.flash = {
        type: 'success',
        text: 'Member has been removed from the group'
      }

      res.redirect(`/groups/${groupId}`)
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect(`/groups/${req.params.id}`)
    }
  }
}
