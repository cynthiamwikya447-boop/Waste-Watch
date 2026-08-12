import { Router } from 'express'
import {
  createReport,
  trackReport,
  confirmCollection,
  getReports,
  getReport,
  updateReport,
  markCollected,
} from '../controllers/reports.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.post('/', createReport)
router.get('/track/:code', trackReport)
router.post('/track/:code/confirm', confirmCollection)

router.get('/', protect, authorize('admin', 'collector'), getReports)
router.get('/:id', protect, authorize('admin', 'collector'), getReport)
router.patch('/:id', protect, authorize('admin'), updateReport)
router.patch('/:id/collect', protect, authorize('admin', 'collector'), markCollected)

export default router
