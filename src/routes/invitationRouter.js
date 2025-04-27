/**
 * @file Defines the invitation router.
 * @module invitationRouter
 * @author Johan Persson
 */

import express from 'express'
import { GroupController } from '../controllers/GroupController.js'

export const router = express.Router()

const controller = new GroupController()

router.get('/', (req, res, next) => controller.showInvitations(req, res, next))
router.post('/:id/accept', (req, res, next) => controller.processInvitation(req, res, next))
router.post('/:id/decline', (req, res, next) => controller.processInvitation(req, res, next))
