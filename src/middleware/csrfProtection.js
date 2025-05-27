// src/middleware/simpleCsrfProtection.js
import crypto from 'crypto'

// Generate a random token
/**
 * Generates a random CSRF token.
 *
 * @returns {string} A randomly generated token in hexadecimal format.
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// Create the CSRF middleware
/**
 * Configures CSRF protection middleware.
 *
 * @returns {object} An object containing `csrfToken` and `csrfProtect` middleware functions.
 */
export function configureCsrfProtection () {
  return {
    // Middleware to generate and set the CSRF token
    /**
     * Middleware to generate and set the CSRF token.
     *
     * @param {object} req - The HTTP request object.
     * @param {object} res - The HTTP response object.
     * @param {Function} next - The next middleware function.
     */
    csrfToken: (req, res, next) => {
      // Generate a token if it doesn't exist in the session
      if (!req.session.csrfToken) {
        req.session.csrfToken = generateToken()
      }

      // Make the token available to templates
      res.locals.csrfToken = req.session.csrfToken
      next()
    },

    // Middleware to validate the CSRF token
    /**
     * Middleware to validate the CSRF token.
     *
     * @param {object} req - The HTTP request object.
     * @param {object} res - The HTTP response object.
     * @param {Function} next - The next middleware function.
     * @returns {void} This middleware does not return a value.
     */
    csrfProtect: (req, res, next) => {
      // Skip validation for GET, HEAD, OPTIONS requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next()
      }

      // Get the token from the request
      const token = req.body._csrf || req.headers['x-csrf-token']

      // Check if the token exists and matches the one in the session
      if (!token || token !== req.session.csrfToken) {
        console.log('CSRF validation failed:')
        console.log('- Session token:', req.session.csrfToken)
        console.log('- Request token:', token)
        console.log('- Request body:', req.body)

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid CSRF token.'
        })
      }

      next()
    }
  }
}
