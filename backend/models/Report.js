import { randomBytes } from 'crypto'
import { run, get, all, insert } from '../config/db.js'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateSuffix(length = 6) {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

const SELECT_WITH_JOINS = `
  SELECT
    r.*,
    b.bin_id      AS bin_bin_id,
    b.address     AS bin_address,
    b.zone        AS bin_zone,
    collector.name AS collected_by_name,
    reviewer.name  AS reviewed_by_name
  FROM reports r
  LEFT JOIN bins b ON b.id = r.bin_id
  LEFT JOIN users collector ON collector.id = r.collected_by
  LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
`

function shapeRow(row) {
  if (!row) return null
  const {
    bin_bin_id, bin_address, bin_zone, collected_by_name, reviewed_by_name,
    ...report
  } = row
  return {
    ...report,
    bin: report.bin_id ? { id: report.bin_id, bin_id: bin_bin_id, address: bin_address, zone: bin_zone } : null,
    collected_by_name: collected_by_name || null,
    reviewed_by_name: reviewed_by_name || null,
  }
}

export const ReportModel = {
  generateTrackingCode() {
    return `WW-${generateSuffix()}`
  },

  async findAll({ status, zone } = {}) {
    const clauses = []
    const params = {}
    if (status) {
      clauses.push('r.status = @status')
      params.status = status
    }
    if (zone) {
      clauses.push('b.zone = @zone')
      params.zone = zone
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const rows = await all(`${SELECT_WITH_JOINS} ${where} ORDER BY r.created_at DESC`, params)
    return rows.map(shapeRow)
  },

  async findById(id) {
    return shapeRow(await get(`${SELECT_WITH_JOINS} WHERE r.id = @id`, { id }))
  },

  async findByTrackingCode(tracking_code) {
    return shapeRow(
      await get(`${SELECT_WITH_JOINS} WHERE r.tracking_code = @tracking_code`, {
        tracking_code: tracking_code.toUpperCase(),
      })
    )
  },

  async create({ reporterName, reporterEmail, reporterPhone, address, lat, lng, description, photo, binId }) {
    const tracking_code = this.generateTrackingCode()
    const id = await insert(
      `INSERT INTO reports
         (tracking_code, reporter_name, reporter_email, reporter_phone, address, lat, lng, description, photo_url, bin_id, priority)
       VALUES
         (@tracking_code, @reporter_name, @reporter_email, @reporter_phone, @address, @lat, @lng, @description, @photo_url, @bin_id, 'medium')`,
      {
        tracking_code,
        reporter_name: reporterName || null,
        reporter_email: reporterEmail || null,
        reporter_phone: reporterPhone,
        address,
        lat: lat ?? null,
        lng: lng ?? null,
        description: description || null,
        photo_url: photo || null,
        bin_id: binId || null,
      }
    )
    return this.findById(id)
  },

  async update(id, fields) {
    const allowed = ['status', 'priority', 'reviewed_by']
    const sets = []
    const params = { id }
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = @${key}`)
        params[key] = fields[key]
      }
    }
    if (!sets.length) return this.findById(id)
    sets.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`)
    await run(`UPDATE reports SET ${sets.join(', ')} WHERE id = @id`, params)
    return this.findById(id)
  },

  async markCollected(id, collectorId) {
    await run(
      `UPDATE reports
       SET status = 'collected', collected_by = @collectorId, collected_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = @id`,
      { id, collectorId }
    )
    return this.findById(id)
  },

  async confirm(id, { confirmed, note }) {
    const status = confirmed ? 'confirmed' : 'reopened'
    await run(
      `UPDATE reports
       SET status = @status, confirmed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), confirmation_note = @note, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = @id`,
      { id, status, note: note || null }
    )
    return this.findById(id)
  },
}
