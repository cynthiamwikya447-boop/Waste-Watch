import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { UserModel } from '../models/User.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await UserModel.findById(decoded.id)
    if (!user || !user.is_active) {
      res.status(401)
      throw new Error('User not found or deactivated')
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401)
    throw new Error('Not authorized, token failed')
  }
})

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403)
    throw new Error(`Role '${req.user?.role}' is not permitted to perform this action`)
  }
  next()
}
