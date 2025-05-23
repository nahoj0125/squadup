import express from 'express'
import { MessageController } from '../controllers/MessageController.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

export const router = express.Router()

const controller = new MessageController()

router.use(isAuthenticated)

router.post('/:id/messages', (req, res, next) => controller.createMessage(req, res, next))
