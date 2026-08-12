import { Router } from 'express'
import { getAlerts, createAlert, resolveAlert } from '../controllers/alerts.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', protect, authorize('admin', 'collector'), getAlerts)
router.post('/', protect, authorize('admin'), createAlert)
router.patch('/:id/resolve', protect, authorize('admin', 'collector'), resolveAlert)

export default router
