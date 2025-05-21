/**
 * @file Defines the main application.
 * @module server
 * @author Johan Persson
 */

import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import logger from 'morgan'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectToDatabase } from './config/mongoose.js'
import { sessionOptions } from './config/sessionOptions.js'
import { router } from './routes/router.js'
import { errorHandler, flashMessages, configureCsrfProtection } from './middleware/index.js'
import helmetConfig from './config/helmetConfig.js'
import 'dotenv/config'
import cookieParser from 'cookie-parser'

try {
  // Connect to MongoDB.
  await connectToDatabase(process.env.DB_CONNECTION_STRING)

  // Creates an Express application.
  const app = express()

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  // Set the base URL to use for all relative URLs in a document.
  const baseURL = process.env.BASE_URL || '/'

  // Configure Helmet middleware
  app.use(helmetConfig)

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // View engine setup.
  app.set('view engine', 'ejs')
  app.set('views', join(directoryFullName, 'views'))
  app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))
  app.set('layout extractScripts', true)
  app.set('layout extractStyles', true)
  app.use(expressLayouts)

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // Serve static files.
  app.use(express.static(join(directoryFullName, '..', 'public')))

  // Setup and use session middleware (https://github.com/expressjs/session)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1) // trust first proxy
  }
  app.use(session(sessionOptions))

  // Parse cookies
  app.use(cookieParser())

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // Make baseURL available to all templates
  app.use((req, res, next) => {
    res.locals.baseURL = baseURL
    res.locals.user = req.session.user || null
    next()
  })

  // Configure and apply CSRF protection
  const { csrfProtect, csrfToken } = configureCsrfProtection()
  app.use(csrfProtect)
  app.use(csrfToken)

  // Middleware to be executed before the routes.
  app.use(flashMessages(baseURL))

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(errorHandler)

  // Starts the HTTP server listening for connections.
  const server = app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${server.address().port}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
