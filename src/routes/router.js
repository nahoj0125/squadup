/**
 * @file Defines the main router.
 * @module router
 * @author Johan Persson
 */

import express from 'express'
import http from 'node:http'
import { router as homeRouter } from './homeRouter.js'
import { router as registerRouter } from './registerRouter.js'
import { router as loginRouter } from './loginRouter.js'
import { router as groupRouter } from './groupRouter.js'
import { router as invitationRouter } from './invitationRouter.js'
import { router as availabilityRouter } from './availabilityRouter.js'
import { router as messageRouter } from './messageRouter.js'

export const router = express.Router()

router.use('/', homeRouter)
router.use('/register', registerRouter)
router.use('/login', loginRouter)
router.use('/groups', groupRouter)
router.use('/groups', invitationRouter)
router.use('/invitations', invitationRouter)
router.use('/groups', availabilityRouter)
router.use('/groups', messageRouter)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => {
  const statusCode = 404
  const error = new Error(http.STATUS_CODES[statusCode])
  error.status = statusCode
  next(error)
})
