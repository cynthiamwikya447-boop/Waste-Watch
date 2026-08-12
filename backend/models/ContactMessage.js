import { run, get, all, insert } from '../config/db.js'

export const ContactMessageModel = {
  findAll(status) {
    if (status && status !== 'all') {
      return all('SELECT * FROM contact_messages WHERE status = @status ORDER BY created_at DESC', { status })
    }
    return all('SELECT * FROM contact_messages ORDER BY created_at DESC')
  },

  async create({ name, email, subject, message }) {
    const id = await insert(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES (@name, @email, @subject, @message)`,
      { name: name || null, email: email || null, subject, message }
    )
    return get('SELECT * FROM contact_messages WHERE id = @id', { id })
  },

  async close(id) {
    await run(`UPDATE contact_messages SET status = 'closed' WHERE id = @id`, { id })
    return get('SELECT * FROM contact_messages WHERE id = @id', { id })
  },
}
