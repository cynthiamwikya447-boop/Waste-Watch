import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (transporter !== null) return transporter
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  } else {
    transporter = false // configured-and-off
  }
  return transporter
}

/**
 * Sends an email if SMTP is configured in .env. If it isn't, this safely
 * logs the email to the console instead so the rest of the app (report
 * tracking codes, confirmation links, etc.) still works in local dev.
 */
export async function sendMail({ to, subject, text, html }) {
  const t = getTransporter()
  if (!to) return { skipped: true, reason: 'no recipient' }

  if (!t) {
    console.log('\n--- EMAIL (SMTP not configured, logging only) ---')
    console.log(`To: ${to}\nSubject: ${subject}\n\n${text}`)
    console.log('---------------------------------------------------\n')
    return { skipped: true, reason: 'smtp not configured' }
  }

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'Waste Watch <no-reply@wastewatch.example>',
      to,
      subject,
      text,
      html,
    })
    return { sent: true }
  } catch (err) {
    console.error('Failed to send email:', err.message)
    return { sent: false, error: err.message }
  }
}
