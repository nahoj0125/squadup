/**
 * @file Authentication middleware for the application.
 * @module isAuthenticated
 * @author Johan Persson
 */

/**
 * Middleware to check if the user is authenticated.
 * If authenticated, proceeds to the next middleware or route handler.
 * If not authenticated, redirects to the login page and sets a flash message.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} - Does not return a value.
 */
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next()
  }

  req.session.returnTo = req.originalUrl

  req.session.flash = {
    type: 'error',
    text: 'You need to be logged in to access this page'
  }

  res.redirect('/login')
}
