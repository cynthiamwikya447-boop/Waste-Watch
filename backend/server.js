import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/auth.routes.js'
import binsRoutes from './routes/bins.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import alertsRoutes from './routes/alerts.routes.js'
import usersRoutes from './routes/users.routes.js'
import contactRoutes from './routes/contact.routes.js'

try {
  await connectDB()
} catch (err) {
  console.error('\nCould not open/set up the SQLite database. Check backend/.env (DB_FILE) and make sure the process can write to that folder.\n')
  console.error(err.message)
  process.exit(1)
}

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/bins', binsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/alerts', alertsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/contact', contactRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Waste Watch API running on http://localhost:${PORT}`)
})
