/**
 * @file Defines the invitation router.
 * @module invitationRouter
 * @author Johan Persson
 */

import express from 'express'
import { GroupController } from '../controllers/GroupController.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

export const router = express.Router()

const controller = new GroupController()

router.use(isAuthenticated)

router.get('/', (req, res, next) => controller.showInvitations(req, res, next))
router.post('/:id/accept', (req, res, next) => controller.processInvitation(req, res, next))
router.post('/:id/decline', (req, res, next) => controller.processInvitation(req, res, next))
