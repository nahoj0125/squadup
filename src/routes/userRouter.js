import express from 'express'
import { UserController } from '../controllers/UserController.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'

export const router = express.Router()
const userController = new UserController()

router.get('/account/delete', isAuthenticated, (req, res, next) => userController.showDeleteAccountForm(req, res, next))

router.post('/account/delete', isAuthenticated, (req, res, next) => userController.deleteAccount(req, res, next))
