import asyncHandler from 'express-async-handler'
import { UserModel } from '../models/User.js'

// GET /api/users  (admin)
export const getUsers = asyncHandler(async (req, res) => {
  const users = (await UserModel.findAll()).map(UserModel.toSafeObject)
  res.json({ users })
})

// PATCH /api/users/:id  (admin - update role/active status)
export const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, name, phone } = req.body
  const existing = await UserModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('User not found')
  }
  if (existing.id === req.user.id && isActive === false) {
    res.status(400)
    throw new Error('You cannot deactivate your own account')
  }

  const user = await UserModel.update(req.params.id, {
    role,
    is_active: typeof isActive === 'boolean' ? isActive : undefined,
    name,
    phone,
  })
  res.json({ user: UserModel.toSafeObject(user) })
})

// DELETE /api/users/:id  (admin)
export const deleteUser = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    res.status(400)
    throw new Error('You cannot delete your own account')
  }
  const existing = await UserModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('User not found')
  }
  await UserModel.delete(req.params.id)
  res.json({ message: 'User deleted' })
})
