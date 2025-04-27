/**
 * @file Defines the loginrouter.
 * @module loginRouter
 * @author Johan Persson
 */

import express from 'express'
import { LoginController } from '../controllers/LoginController.js'

export const router = express.Router()

const controller = new LoginController()

router.get('/', (req, res, next) => controller.index(req, res, next))
router.post('/', (req, res, next) => controller.loginPost(req, res, next))
router.post('/logout', (req, res, next) => controller.logout(req, res, next))
