/**
 * @file Defines the grouprouter.
 * @module groupRouter
 * @author Johan Persson
 */

import express from 'express'
import { GroupController } from '../controllers/GroupController.js'
import { MessageController } from '../controllers/MessageController.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

export const router = express.Router()

const controller = new GroupController()
const messageController = new MessageController()

router.use(isAuthenticated)

router.get('/', (req, res, next) => controller.index(req, res, next))
router.get('/new', (req, res, next) => controller.new(req, res, next))
router.post('/', (req, res, next) => controller.create(req, res, next))
router.get('/:id', (req, res, next) => controller.show(req, res, next))

router.post('/:id/messages', (req, res, next) => messageController.createMessage(req, res, next))

router.get('/:id/remove', (req, res, next) => controller.showRemoveUserForm(req, res, next))
router.post('/:id/remove', (req, res, next) => controller.removeMember(req, res, next))

router.get('/:id/delete', (req, res, next) => controller.showDeleteGroupForm(req, res, next))
router.post('/:id/delete', (req, res, next) => controller.deleteGroup(req, res, next))
