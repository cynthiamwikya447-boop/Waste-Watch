import { Router } from 'express'
import { sendContactMessage, getContactMessages, closeContactMessage } from '../controllers/contact.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.post('/', sendContactMessage)
router.get('/', protect, authorize('admin'), getContactMessages)
router.patch('/:id/close', protect, authorize('admin'), closeContactMessage)

export default router
