/**
 * @file Defines the AvailabilityController class.
 * @module AvailabilityController
 * @author Johan Persson
 */

import { GroupService } from '../services/GroupService.js'
import { AvailabilityService } from '../services/AvailablilityService.js'

/**
 * Controller for managing availability-related operations.
 */
export class AvailabilityController {
  #groupService
  #availabilityService

  /**
   * Initializes a new instance of the AvailabilityController class.
   */
  constructor () {
    this.#groupService = new GroupService()
    this.#availabilityService = new AvailabilityService()
  }

  /**
   * Display the availability form for a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
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
   * Set the availability for a user in a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
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
   * Display the common availability for a group.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
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
