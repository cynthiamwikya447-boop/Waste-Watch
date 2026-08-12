import { Router } from 'express'
import { getBins, getBin, createBin, updateBin, deleteBin, updateFillLevel } from '../controllers/bins.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', getBins)
router.get('/:id', getBin)
router.post('/', protect, authorize('admin'), createBin)
router.put('/:id', protect, authorize('admin'), updateBin)
router.delete('/:id', protect, authorize('admin'), deleteBin)
router.patch('/:id/fill-level', protect, authorize('admin', 'collector'), updateFillLevel)

export default router
