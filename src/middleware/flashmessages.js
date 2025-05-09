/**
 * @file Flash messages middleware for the application.
 * @module flashMessages
 * @author Johan Persson
 */

/**
 * Middleware for handling flash messages and view locals.
 *
 * @param {string} baseURL - The base URL for the application.
 * @returns {Function} Express middleware function.
 */
export const flashMessages = (baseURL) => (req, res, next) => {
  // Flash messages - survives only a round trip.
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }

  // Make user data available to all views
  res.locals.user = req.session?.user || null

  // Pass the base URL to the views.
  res.locals.baseURL = process.env.BASE_URL || '/'

  next()
}
