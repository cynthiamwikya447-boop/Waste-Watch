import { Router } from 'express'
import { getUsers, updateUser, deleteUser } from '../controllers/users.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/', protect, authorize('admin'), getUsers)
router.patch('/:id', protect, authorize('admin'), updateUser)
router.delete('/:id', protect, authorize('admin'), deleteUser)

export default router
