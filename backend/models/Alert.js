import { run, get, all, insert } from '../config/db.js'

const SELECT_WITH_JOINS = `
  SELECT a.*, b.bin_id AS bin_bin_id, b.address AS bin_address
  FROM alerts a
  LEFT JOIN bins b ON b.id = a.bin_id
`

function shapeRow(row) {
  if (!row) return null
  const { bin_bin_id, bin_address, ...alert } = row
  return {
    ...alert,
    bin: alert.bin_id ? { id: alert.bin_id, bin_id: bin_bin_id, address: bin_address } : null,
  }
}

export const AlertModel = {
  async findAll(status) {
    if (status && status !== 'all') {
      const rows = await all(`${SELECT_WITH_JOINS} WHERE a.status = @status ORDER BY a.created_at DESC`, { status })
      return rows.map(shapeRow)
    }
    const rows = await all(`${SELECT_WITH_JOINS} ORDER BY a.created_at DESC`)
    return rows.map(shapeRow)
  },

  async findById(id) {
    return shapeRow(await get(`${SELECT_WITH_JOINS} WHERE a.id = @id`, { id }))
  },

  async create({ bin, report_id, message, severity }) {
    const id = await insert(
      `INSERT INTO alerts (bin_id, report_id, message, severity)
       VALUES (@bin_id, @report_id, @message, @severity)`,
      {
        bin_id: bin || null,
        report_id: report_id || null,
        message,
        severity: severity || 'warning',
      }
    )
    return this.findById(id)
  },

  async resolve(id, resolvedBy) {
    await run(
      `UPDATE alerts SET status = 'resolved', resolved_by = @resolvedBy, resolved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = @id`,
      { id, resolvedBy }
    )
    return this.findById(id)
  },
}
