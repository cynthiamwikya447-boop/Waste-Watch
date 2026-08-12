import asyncHandler from 'express-async-handler'
import { ReportModel } from '../models/Report.js'
import { BinModel } from '../models/Bin.js'
import { AlertModel } from '../models/Alert.js'
import { sendMail } from '../utils/mailer.js'

// POST /api/reports  (PUBLIC - residents report a full bin, no account needed)
export const createReport = asyncHandler(async (req, res) => {
  const { reporterPhone, reporterName, reporterEmail, address, lat, lng, description, photo, binId } = req.body

  if (!reporterPhone || !address) {
    res.status(400)
    throw new Error('Phone number and address are required')
  }

  const report = await ReportModel.create({
    reporterPhone,
    reporterName,
    reporterEmail,
    address,
    lat,
    lng,
    description,
    photo,
    binId: binId || null,
  })

  if (reporterEmail) {
    await sendMail({
      to: reporterEmail,
      subject: `Waste Watch - your report ${report.tracking_code} was received`,
      text:
        `Thanks for reporting a full bin at "${address}".\n\n` +
        `Your tracking code is: ${report.tracking_code}\n` +
        `Use it any time to check the status at /track, and we'll ask you to confirm ` +
        `once a collector marks it as emptied.`,
    })
  }

  res.status(201).json({ report })
})

// GET /api/reports/track/:code  (PUBLIC - resident checks status with their tracking code)
export const trackReport = asyncHandler(async (req, res) => {
  const report = await ReportModel.findByTrackingCode(req.params.code)
  if (!report) {
    res.status(404)
    throw new Error('No report found with that tracking code')
  }
  res.json({ report })
})

// POST /api/reports/track/:code/confirm  (PUBLIC - resident confirms/denies collection)
export const confirmCollection = asyncHandler(async (req, res) => {
  const { confirmed, note } = req.body
  if (typeof confirmed !== 'boolean') {
    res.status(400)
    throw new Error('confirmed (true/false) is required')
  }

  const report = await ReportModel.findByTrackingCode(req.params.code)
  if (!report) {
    res.status(404)
    throw new Error('No report found with that tracking code')
  }
  if (report.status !== 'collected') {
    res.status(400)
    throw new Error('This report is not awaiting confirmation yet')
  }

  const updated = await ReportModel.confirm(report.id, { confirmed, note })

  if (!confirmed) {
    await AlertModel.create({
      bin: report.bin_id,
      report_id: report.id,
      message: `Resident says bin at "${report.address}" (report ${report.tracking_code}) was NOT actually collected`,
      severity: 'critical',
    })
  }

  res.json({ report: updated })
})

// GET /api/reports  (admin, collector)
export const getReports = asyncHandler(async (req, res) => {
  const { status, zone } = req.query
  const reports = await ReportModel.findAll({ status, zone })
  res.json({ reports })
})

// GET /api/reports/:id  (admin, collector)
export const getReport = asyncHandler(async (req, res) => {
  const report = await ReportModel.findById(req.params.id)
  if (!report) {
    res.status(404)
    throw new Error('Report not found')
  }
  res.json({ report })
})

// PATCH /api/reports/:id  (admin - approve/reject, set priority, assign)
export const updateReport = asyncHandler(async (req, res) => {
  const { status, priority } = req.body
  const existing = await ReportModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('Report not found')
  }

  const report = await ReportModel.update(req.params.id, {
    status,
    priority,
    reviewed_by: req.user.id,
  })

  res.json({ report })
})

// PATCH /api/reports/:id/collect  (collector - mark as collected, triggers resident confirmation)
export const markCollected = asyncHandler(async (req, res) => {
  const existing = await ReportModel.findById(req.params.id)
  if (!existing) {
    res.status(404)
    throw new Error('Report not found')
  }
  if (existing.status === 'collected' || existing.status === 'confirmed') {
    res.status(400)
    throw new Error('This report has already been marked as collected')
  }

  const report = await ReportModel.markCollected(req.params.id, req.user.id)

  if (report.bin_id) {
    await BinModel.markCollected(report.bin_id)
  }

  if (report.reporter_email) {
    await sendMail({
      to: report.reporter_email,
      subject: `Waste Watch - please confirm collection (${report.tracking_code})`,
      text:
        `A collector has marked the bin at "${report.address}" as collected.\n\n` +
        `Please confirm this is correct by visiting /confirm/${report.tracking_code} ` +
        `and letting us know it was actually emptied. If it wasn't, you can flag that too.`,
    })
  }

  res.json({ report })
})
