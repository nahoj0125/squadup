import express from 'express'
import { AvailabilityController } from '../controllers/AvailabilityController.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

export const router = express.Router()

const controller = new AvailabilityController()

router.use(isAuthenticated)

router.get('/:id/availability', (req, res, next) => controller.showAvailabilityForm(req, res, next))
router.post('/:id/availability', (req, res, next) => controller.setAvailability(req, res, next))
router.get('/:id/common-availability', (req, res, next) => controller.viewCommonAvailability(req, res, next))
