import { run, get, all, insert } from '../config/db.js'

export const BinModel = {
  findAll() {
    return all('SELECT * FROM bins ORDER BY fill_level DESC')
  },

  findById(id) {
    return get('SELECT * FROM bins WHERE id = @id', { id })
  },

  findByBinId(bin_id) {
    return get('SELECT * FROM bins WHERE bin_id = @bin_id', { bin_id })
  },

  async create({ bin_id, address, zone, lat, lng, fill_level, status }) {
    const id = await insert(
      `INSERT INTO bins (bin_id, address, zone, lat, lng, fill_level, status)
       VALUES (@bin_id, @address, @zone, @lat, @lng, @fill_level, @status)`,
      {
        bin_id,
        address,
        zone,
        lat,
        lng,
        fill_level: fill_level ?? 0,
        status: status || 'active',
      }
    )
    return this.findById(id)
  },

  async update(id, fields) {
    const allowed = ['address', 'zone', 'lat', 'lng', 'fill_level', 'status']
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
    await run(`UPDATE bins SET ${sets.join(', ')} WHERE id = @id`, params)
    return this.findById(id)
  },

  async markCollected(id) {
    await run(
      `UPDATE bins SET fill_level = 0, last_collected = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = @id`,
      { id }
    )
    return this.findById(id)
  },

  delete(id) {
    return run('DELETE FROM bins WHERE id = @id', { id })
  },
}
