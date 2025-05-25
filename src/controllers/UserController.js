/**
 * @file Defines the UserController class.
 * @module UserController
 * @author Johan Persson
 */

import { UserService } from '../services/UserService.js'

/**
 * Controller for handling user-related operations.
 */
export class UserController {
  #userService

  /**
   * Creates an instance of UserController and initializes the UserService.
   */
  constructor () {
    this.#userService = new UserService()
  }

  /**
   * Renders the delete account form for the user.
   *
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  async showDeleteAccountForm (req, res, next) {
    try {
      res.render('user/delete-account', {
        title: 'Delete User || SquadUp',
        user: req.session.user
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the deletion of a user account after verifying confirmation and password.
   *
   * @param {import('express').Request} req - The request object.
   * @param {import('express').Response} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Resolves when the form is rendered or an error is passed to next.
   */
  async deleteAccount (req, res, next) {
    try {
      const userId = req.session.user.id
      const { confirmation, password } = req.body

      if (confirmation !== req.session.user.username) {
        req.session.flash = {
          type: 'error',
          text: 'Username confirmation did not match. Account was not deleted.'
        }
        return res.redirect('/account/delete')
      }

      if (password) {
        try {
          await this.#userService.verifyPassword(userId, password)
        } catch (authError) {
          req.session.flash = {
            type: 'error',
            text: 'Incorrect password. Account was not deleted.'
          }
          return res.redirect('/account/delete')
        }

        await this.#userService.deleteUserAccount(userId)

        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err)
          }

          res.clearCookie('connect.sid')

          res.render('user/account-deleted', {
            title: 'Account Deleted | SquadUp',
            message: 'Your account has been successfully deleted.'
          })
        })
      }
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }
      res.redirect('/account/delete')
    }
  }
}
