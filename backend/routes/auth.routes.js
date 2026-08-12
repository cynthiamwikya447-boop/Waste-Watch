import { Router } from 'express'
import { login, register, getMe } from '../controllers/auth.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.post('/login', login)
router.post('/register', protect, authorize('admin'), register)
router.get('/me', protect, getMe)

export default router
