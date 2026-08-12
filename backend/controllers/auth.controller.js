import asyncHandler from 'express-async-handler'
import { UserModel } from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'

// POST /api/auth/login  (collectors and admins only - citizens never log in)
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400)
    throw new Error('Email and password are required')
  }

  const user = await UserModel.findByEmail(String(email).toLowerCase().trim())
  const passwordOk = user ? await UserModel.matchPassword(user, password) : false

  if (!user || !passwordOk) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (!user.is_active) {
    res.status(403)
    throw new Error('This account has been deactivated. Please contact an administrator.')
  }

  res.json({
    token: generateToken(user.id, user.role),
    user: UserModel.toSafeObject(user),
  })
})

// POST /api/auth/register  (admin only - creates real collector/admin accounts)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email, and password are required')
  }
  if (password.length < 8) {
    res.status(400)
    throw new Error('Password must be at least 8 characters')
  }

  const normalizedEmail = String(email).toLowerCase().trim()
  const exists = await UserModel.findByEmail(normalizedEmail)
  if (exists) {
    res.status(400)
    throw new Error('A user with this email already exists')
  }

  const user = await UserModel.create({
    name,
    email: normalizedEmail,
    password,
    phone,
    role: ['collector', 'admin'].includes(role) ? role : 'collector',
  })

  res.status(201).json({ user: UserModel.toSafeObject(user) })
})

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: UserModel.toSafeObject(req.user) })
})
