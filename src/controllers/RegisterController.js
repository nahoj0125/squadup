/**
 * @file Defines the RegisterController class.
 * @module RegisterController
 * @author Johan Persson
 */

import { RegisterService } from '../services/registerService.js'

/**
 * Encapsulates a controller.
 */
export class RegisterController {
  #registerService

  /**
   * Initialize the register controller with necessary services.
   */
  constructor () {
    this.#registerService = new RegisterService()
  }

  /**
   * Displays the registration form.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    try {
      res.render('register/index')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Process the registration form submission.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - Redirects the user to either the register page (if there's an error) or the homepage after successful registration.
   */
  async register (req, res, next) {
    try {
      if (req.body.password !== req.body.confirmPassword) {
        // Set flash error message for password mismatch
        req.session.flash = {
          type: 'error',
          text: 'Passwords do not match'
        }

        req.session.formData = {
          username: req.body.username,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email
        }

        return res.redirect('/register')
      }

      const userData = {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password
      }

      await this.#registerService.register(userData)

      req.session.flash = {
        type: 'success',
        text: 'Registration successful! You can now log in.'
      }

      res.redirect('/')
    } catch (error) {
      req.session.flash = {
        type: 'error',
        text: error.message
      }

      // Store form data in session
      req.session.formData = {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email
      }

      res.redirect('/register')
    }
  }
}
