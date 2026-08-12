import asyncHandler from 'express-async-handler'
import { BinModel } from '../models/Bin.js'
import { AlertModel } from '../models/Alert.js'

// GET /api/bins  (public - citizens can see bin locations/fill levels on the map)
export const getBins = asyncHandler(async (req, res) => {
  const bins = await BinModel.findAll()
  res.json({ bins })
})

// GET /api/bins/:id
export const getBin = asyncHandler(async (req, res) => {
  const bin = await BinModel.findById(req.params.id)
  if (!bin) {
    res.status(404)
    throw new Error('Bin not found')
  }
  res.json({ bin })
})

// POST /api/bins  (admin)
export const createBin = asyncHandler(async (req, res) => {
  const { bin_id, address, zone, lat, lng, fill_level, status } = req.body
  if (!bin_id || !address || !zone || lat === undefined || lng === undefined) {
    res.status(400)
    throw new Error('bin_id, address, zone, lat, and lng are required')
  }
  const bin = await BinModel.create({ bin_id, address, zone, lat, lng, fill_level, status })
  res.status(201).json({ bin })
})

// PUT /api/bins/:id  (admin)
export const updateBin = asyncHandler(async (req, res) => {
  const existing = await BinModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('Bin not found')
  }
  const bin = await BinModel.update(req.params.id, req.body)
  res.json({ bin })
})

// DELETE /api/bins/:id  (admin)
export const deleteBin = asyncHandler(async (req, res) => {
  const existing = await BinModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('Bin not found')
  }
  await BinModel.delete(req.params.id)
  res.json({ message: 'Bin deleted' })
})

// PATCH /api/bins/:id/fill-level  (collector - updates after collection, or simulated sensor)
export const updateFillLevel = asyncHandler(async (req, res) => {
  const { fill_level } = req.body
  if (fill_level === undefined || fill_level < 0 || fill_level > 100) {
    res.status(400)
    throw new Error('fill_level must be a number between 0 and 100')
  }
  const existing = await BinModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('Bin not found')
  }

  const bin =
    Number(fill_level) === 0
      ? await BinModel.markCollected(existing.id)
      : await BinModel.update(existing.id, { fill_level })

  if (fill_level >= 80) {
    await AlertModel.create({
      bin: bin.id,
      message: `${bin.address} is at ${fill_level}% capacity`,
      severity: fill_level >= 95 ? 'critical' : 'warning',
    })
  }

  res.json({ bin })
})
