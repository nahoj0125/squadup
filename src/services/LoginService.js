/**
 * @file Loginservice with business logic for authentication.
 * @module LoginService
 * @author Johan Persson
 */
import { UserModel } from '../models/UserModel.js'

/**
 * Handles business logic related to user authentication.
 */
export class LoginService {
  /**
   * Authenticates a user based on username and password.
   *
   * @param {string} username - The username of the user.
   * @param {string} password - The password provided for authentication.
   * @returns {Promise<object>} - The authenticated user object.
   * @throws {Error} - Throws an error if authentication fails.
   */
  async authenticateUser (username, password) {
    try {
      const user = await UserModel.authenticate(username, password)
      if (!user) {
        throw new Error('Invalid username or password')
      }
      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Retrieves a user document by ID.
   *
   * @param {string} id - The user ID to retrieve.
   * @returns {Promise<object>} - The user document.
   * @throws {Error} - Throws an error if user not found.
   */
  async getUserById (id) {
    const user = await UserModel.findById(id)
    if (!user) {
      throw new Error('The user you requested does not exist.')
    }
    return user
  }
}
