/**
 * @file Defines the GroupController class.
 * @module GroupController
 * @author Johan Persson
 */

import { GroupService } from '../services/GroupService.js'
import { MessageService } from '../services/MessageService.js'
import { InvitationService } from '../services/InvitationService.js'
import { AvailabilityService } from '../services/AvailablilityService.js'

/**
 *
 */
export class GroupController {
  #groupService
  #messageService
  #invitationService
  #availabilityService

  /**
   * Initialize the group controller with necessary services.
   */
  constructor () {
    this.#groupService = new GroupService()
    this.#messageService = new MessageService()
    this.#invitationService = new InvitationService()
    this.#availabilityService = new AvailabilityService()
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
        description: req.body.description,
        isPublic: req.body.isPublic
      }

      res.redirect('/groups/new')
    }
  }

  // ***** Messages ******

  /**
   *
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

  // ***** Membership *****

  /**
   *
   */
  async showInviteForm (req, res) {
    try {
      const groupId = req.params.id
      const group = await this.#groupService.getGroupById(groupId)

      if (group.creator.id !== req.session.user.id) {
        req.session.flash = {
          type: 'error',
          text: 'Only the creator can invite users'
        }
        return res.redirect(`/groups/${groupId}`)
      }

      res.render('groups/invite', { group })
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
    }
  }

  /**
   *
   */
  async showInvitations (req, res) {
    try {
      const invitations = await this.#invitationService.getPendingInvitations(req.session.user.id)
      const group = invitations.length > 0 ? await this.#groupService.getGroupById(invitations[0].group) : null

      res.render('invitations', { invitations, group })
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect('/')
    }
  }

  /**
   *
   */
  async inviteUser (req, res) {
    try {
      const groupId = req.params.id
      const { username } = req.body

      await this.#invitationService.inviteUser(
        groupId,
        req.session.user.id,
        username
      )

      req.session.flash = {
        type: 'success',
        text: `Invitation sent to ${username}`
      }

      res.redirect(`/groups/${groupId}/invite`)
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect('/')
    }
  }

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

  /**
   *
   */
  async processInvitation (req, res) {
    try {
      const invitationId = req.body.invitationId || req.params.id
      const accept = req.path.endsWith('/accept')

      console.log(`Processing invitation ID: ${invitationId}, Accept: ${accept}`)

      await this.#invitationService.processInvitation(invitationId, req.session.user.id, accept)

      req.session.flash = {
        type: 'success',
        text: accept ? 'Invitation accepted' : 'Invitation declined'
      }

      res.redirect(accept ? '/groups' : '/invitations')
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: 'Something went wrong while processing the invitation.'
      }
    }
  }

  // ***** Availability *****

  /**
   *
   */
  async showAvailabilityForm (req, res, next) {
    try {
      const groupId = req.params.id
      const userId = req.session.user.id

      const group = await this.#groupService.getGroupById(groupId)
      const userAvailability = await this.#availabilityService.getUserAvailability(userId, groupId)

      res.render('groups/availability', {
        group,
        availability: userAvailability,
        title: `Set Availability for ${group.name}`
      })
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect('/groups')
    }
  }

  /**
   *
   */
  async setAvailability (req, res, next) {
    try {
      const groupId = req.params.id
      const userId = req.body.userId
      const timeSlots = JSON.parse(req.body.timeSlots)

      await this.#availabilityService.setAvailability(userId, groupId, timeSlots)

      req.session.flash = {
        type: 'success',
        text: 'Your availability has been updated'
      }

      res.redirect(`/groups/${groupId}`)
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect('/groups')
    }
  }

  /**
   *
   */
  async viewCommonAvailability (req, res, next) {
    try {
      const groupId = req.params.id
      const group = await this.#groupService.getGroupById(groupId)
      const commonTimes = await this.#availabilityService.getCommonAvailability(groupId)

      res.render('groups/common-availability', {
        group,
        commonTimes,
        currentUserId: req.session.user.id,
        title: `Common Availability for ${group.name}`
      })
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect('/groups/')
    }
  }
}
