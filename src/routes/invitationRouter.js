/**
 * @file Defines the invitation router.
 * @module invitationRouter
 * @author Johan Persson
 */

import express from 'express'
import { InvitationController } from '../controllers/InvitationController.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

export const router = express.Router()

const controller = new InvitationController()

router.use(isAuthenticated)

router.get('/', (req, res, next) => controller.showInvitations(req, res, next))
router.get('/:id/invite', (req, res, next) => controller.showInviteForm(req, res, next))
router.post('/:id/invite', (req, res, next) => controller.inviteUser(req, res, next))
router.post('/:id/accept', (req, res, next) => controller.processInvitation(req, res, next))
router.post('/:id/decline', (req, res, next) => controller.processInvitation(req, res, next))
