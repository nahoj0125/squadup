/**
 * @file Defines the InvitationController class.
 * @module InvitationController
 * @author Johan Persson
 */

import { GroupService } from '../services/GroupService.js'
import { InvitationService } from '../services/InvitationService.js'

/**
 * Controller for handling group invitations.
 */
export class InvitationController {
  #groupService
  #invitationService

  /**
   * Initializes a new instance of the InvitationController class.
   */
  constructor () {
    this.#groupService = new GroupService()
    this.#invitationService = new InvitationService()
  }

  /**
   * Display the invite form for a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
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
   * Display the user's pending invitations.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
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
   * Invite a user to a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
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

  /**
   * Process an invitation by accepting or declining it.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async processInvitation (req, res) {
    try {
      const invitationId = req.body.invitationId || req.params.id
      const accept = req.path.endsWith('/accept')

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
}
