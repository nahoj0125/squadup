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
import helmetConfig from './config/helmetConfig.js'

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

  // Middleware to be executed before the routes.
  app.use((req, res, next) => {
    // Flash messages - survives only a round trip.
    if (req.session.flash) {
      res.locals.flash = req.session.flash
      delete req.session.flash
    }

    // Make user data available to all views
    res.locals.user = req.session?.user || null

    // Pass the base URL to the views.
    res.locals.baseURL = baseURL

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use((err, req, res, next) => {
    console.error(err)

    // 401 Not Found.
    if (err.status === 401) {
      res
        .status(401)
        .sendFile(join(directoryFullName, 'views', 'errors', '401.html'))
      return
    }

    // 403 Not Found.
    if (err.status === 403) {
      res
        .status(403)
        .sendFile(join(directoryFullName, 'views', 'errors', '403.html'))
      return
    }

    // 404 Not Found.
    if (err.status === 404) {
      res
        .status(404)
        .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
      return
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (process.env.NODE_ENV === 'production') {
      res
        .status(500)
        .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
      return
    }

    // ---------------------------------------------------
    // ⚠️ WARNING: Development Environment Only!
    //             Detailed error information is provided.
    // ---------------------------------------------------

    // Render the error page.
    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })

  // Starts the HTTP server listening for connections.
  const server = app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${server.address().port}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
