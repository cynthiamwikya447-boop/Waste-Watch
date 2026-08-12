import asyncHandler from 'express-async-handler'
import { AlertModel } from '../models/Alert.js'

// GET /api/alerts  (admin, collector)
export const getAlerts = asyncHandler(async (req, res) => {
  const { status = 'active' } = req.query
  const alerts = await AlertModel.findAll(status)
  res.json({ alerts })
})

// POST /api/alerts  (admin)
export const createAlert = asyncHandler(async (req, res) => {
  const { bin, message, severity } = req.body
  if (!message) {
    res.status(400)
    throw new Error('message is required')
  }
  const alert = await AlertModel.create({ bin, message, severity })
  res.status(201).json({ alert })
})

// PATCH /api/alerts/:id/resolve  (admin, collector)
export const resolveAlert = asyncHandler(async (req, res) => {
  const existing = await AlertModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('Alert not found')
  }
  const alert = await AlertModel.resolve(req.params.id, req.user.id)
  res.json({ alert })
})
