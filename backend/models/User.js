import bcrypt from 'bcryptjs'
import { run, get, all, insert } from '../config/db.js'

function toSafeObject(row) {
  if (!row) return null
  const { password_hash, ...safe } = row
  return safe
}

export const UserModel = {
  toSafeObject,

  findByEmail(email) {
    return get('SELECT * FROM users WHERE email = @email', { email })
  },

  findById(id) {
    return get('SELECT * FROM users WHERE id = @id', { id })
  },

  findAll() {
    return all('SELECT * FROM users ORDER BY created_at DESC')
  },

  async create({ name, email, password, phone, role }) {
    const password_hash = await bcrypt.hash(password, 10)
    const id = await insert(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES (@name, @email, @password_hash, @phone, @role)`,
      { name, email, password_hash, phone: phone || null, role }
    )
    return this.findById(id)
  },

  async matchPassword(user, plainPassword) {
    return bcrypt.compare(plainPassword, user.password_hash)
  },

  async update(id, fields) {
    const allowed = ['name', 'phone', 'role', 'is_active']
    const sets = []
    const params = { id }
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = @${key}`)
        params[key] = key === 'is_active' ? (fields[key] ? 1 : 0) : fields[key]
      }
    }
    if (!sets.length) return this.findById(id)
    await run(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`, params)
    return this.findById(id)
  },

  delete(id) {
    return run('DELETE FROM users WHERE id = @id', { id })
  },
}
