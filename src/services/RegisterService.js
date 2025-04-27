/**
 * @file Registerservice with business logic for authentication.
 * @module RegisterService
 * @author Johan Persson
 */

import { UserModel } from '../models/UserModel.js'

/**
 * Service for handling user registration.
 */
export class RegisterService {
  /**
   * Registers a new user in the database.
   *
   * @param {object} userData - The user data containing username, firstname, lastname, email, and password.
   * @returns {Promise<object>} - Returns the created user object without the password field.
   * @throws {Error} - Throws an error if the username or email is already taken, or if another issue occurs.
   */
  async register (userData) {
    try {
      const takenUsername = await UserModel.findOne({ username: userData.username })
      if (takenUsername) {
        throw new Error('Username is already taken')
      }

      const takenEmail = await UserModel.findOne({ email: userData.email })
      if (takenEmail) {
        throw new Error('Email is already taken')
      }

      const user = new UserModel(userData)
      await user.save()

      const userObject = user.toJSON()
      delete userObject.password

      return userObject
    } catch (error) {
      throw new Error(error)
    }
  }
}
