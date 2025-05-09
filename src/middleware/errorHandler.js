/**
 * @file Error handler middleware for the application.
 * @module errorHandler
 * @author Johan Persson
 */

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Gets the directory path for this module.
 *
 * @returns {string} The directory path.
 */
const getDirectoryPath = () => {
  return join(dirname(fileURLToPath(import.meta.url)), '..')
}

/**
 * Error handler middleware.
 *
 * @param {Error} err - The error object.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err)

  const directoryFullName = getDirectoryPath()

  // 401 Unauthorized
  if (err.status === 401) {
    return res
      .status(401)
      .sendFile(join(directoryFullName, 'views', 'errors', '401.html'))
  }

  // 403 Forbidden
  if (err.status === 403) {
    return res
      .status(403)
      .sendFile(join(directoryFullName, 'views', 'errors', '403.html'))
  }

  // 404 Not Found
  if (err.status === 404) {
    return res
      .status(404)
      .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
  }

  // 500 Internal Server Error (in production, all other errors send this response)
  if (process.env.NODE_ENV === 'production') {
    return res
      .status(500)
      .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
  }

  res
    .status(err.status || 500)
    .render('errors/error', { error: err })
}
