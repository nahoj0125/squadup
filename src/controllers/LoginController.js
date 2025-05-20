/**
 * @file Defines the LoginController class.
 * @module LoginController
 * @author Johan Persson
 */

import { LoginService } from '../services/LoginService.js'

/**
 * Encapsulates a controller.
 */
export class LoginController {
  #loginService

  /**
   * Initialize the register controller with necessary services.
   */
  constructor () {
    this.#loginService = new LoginService()
  }

  /**
   * Provide `req.doc` with the user document if `:id` is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the user ID to load.
   */
  async loadUserDocument (req, res, next, id) {
    try {
      req.doc = await this.#loginService.getUserById(id)
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Displays the login form.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    try {
      res.render('login/index')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the login POST request.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async loginPost (req, res, next) {
    try {
      const { username, password } = req.body

      const user = await this.#loginService.authenticateUser(username, password)

      req.session.regenerate((err) => {
        if (err) {
          req.session.flash = { type: 'danger', text: 'Failed to regenerate session' }
          return res.redirect('./login')
        }

        req.session.user = user
        req.session.flash = { type: 'success', text: 'Login successful!' }
        res.redirect('./')
      })
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: 'Invalid username or password. Please try again.'
      }
      res.redirect('./login')
    }
  }

  /**
   * Handles the logout request by destroying the user session.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async logout (req, res) {
    req.session.destroy((err) => {
      if (err) {
        req.session.flash = { type: 'danger', text: 'Failed to log out' }
        return res.redirect('/')
      }
      res.redirect('..')
    })
  }
}
