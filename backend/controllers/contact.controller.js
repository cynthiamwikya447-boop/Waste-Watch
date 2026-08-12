import asyncHandler from 'express-async-handler'
import { ContactMessageModel } from '../models/ContactMessage.js'
import { sendMail } from '../utils/mailer.js'

// POST /api/contact  (PUBLIC - "Contact Admin" form, also used for login-trouble help)
export const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body
  if (!subject || !message) {
    res.status(400)
    throw new Error('Subject and message are required')
  }

  const record = await ContactMessageModel.create({ name, email, subject, message })

  await sendMail({
    to: process.env.ADMIN_CONTACT_EMAIL,
    subject: `[Waste Watch Contact] ${subject}`,
    text: `From: ${name || 'Anonymous'} <${email || 'no email given'}>\n\n${message}`,
  })

  res.status(201).json({ contactMessage: record })
})

// GET /api/contact  (admin - view submitted messages)
export const getContactMessages = asyncHandler(async (req, res) => {
  const { status } = req.query
  res.json({ messages: await ContactMessageModel.findAll(status) })
})

// PATCH /api/contact/:id/close  (admin)
export const closeContactMessage = asyncHandler(async (req, res) => {
  const record = await ContactMessageModel.close(req.params.id)
  res.json({ contactMessage: record })
})
