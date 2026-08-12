import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let db

/**
 * Opens (and, on first run, creates) a local SQLite database file - no
 * separate database server to install, configure, or keep running. The
 * file lives at `backend/data/wastewatch.db` by default; the whole app,
 * schema and data included, is portable as that one file. All queries in
 * this project are plain SQL run through the `better-sqlite3` package
 * (a native binding, but it ships prebuilt binaries so `npm install` just
 * works) - there is no ORM in between.
 */
export async function connectDB() {
  const defaultPath = join(__dirname, '..', 'data', 'wastewatch.db')
  const dbFile = process.env.DB_FILE || defaultPath

  if (dbFile !== ':memory:') {
    const dir = dirname(dbFile)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  db = new Database(dbFile)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin', 'collector')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS bins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bin_id TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL,
      zone TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      fill_level INTEGER NOT NULL DEFAULT 0 CHECK (fill_level BETWEEN 0 AND 100),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
      last_collected TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_code TEXT NOT NULL UNIQUE,
      reporter_name TEXT,
      reporter_email TEXT,
      reporter_phone TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL,
      lng REAL,
      description TEXT,
      photo_url TEXT,
      bin_id INTEGER REFERENCES bins(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'assigned', 'collected', 'confirmed', 'reopened', 'rejected')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      reviewed_by INTEGER REFERENCES users(id),
      collected_by INTEGER REFERENCES users(id),
      collected_at TEXT,
      confirmed_at TEXT,
      confirmation_note TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bin_id INTEGER REFERENCES bins(id) ON DELETE SET NULL,
      report_id INTEGER,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
      resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_reports_tracking_code ON reports(tracking_code)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_bins_zone ON bins(zone)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status)`)

  console.log(`SQLite database ready: ${dbFile}`)
  return db
}

export function getDB() {
  if (!db) throw new Error('Database not initialised - call connectDB() first')
  return db
}

/** Replaces undefined with null - better-sqlite3 rejects undefined bind values. */
function bindable(params = {}) {
  const out = {}
  for (const [key, value] of Object.entries(params)) {
    out[key] = value === undefined ? null : value
  }
  return out
}

/** Runs an INSERT/UPDATE/DELETE and returns the raw better-sqlite3 RunResult ({ changes, lastInsertRowid }). */
export function run(sqlText, params = {}) {
  return getDB().prepare(sqlText).run(bindable(params))
}

/** Runs a SELECT and returns the first row, or undefined. */
export function get(sqlText, params = {}) {
  return getDB().prepare(sqlText).get(bindable(params))
}

/** Runs a SELECT and returns all rows. */
export function all(sqlText, params = {}) {
  return getDB().prepare(sqlText).all(bindable(params))
}

/** Runs an INSERT and returns the new row's rowid (auto-increment id). */
export function insert(sqlText, params = {}) {
  return getDB().prepare(sqlText).run(bindable(params)).lastInsertRowid
}
