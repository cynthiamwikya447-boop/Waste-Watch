import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { Plus, Trash2 } from 'lucide-react'

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'collector' }

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  function load() {
    api.get('/users', { auth: true }).then(({ users }) => setUsers(users)).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await api.post('/auth/register', form, { auth: true })
      setSuccess(`Account created for ${form.email}. Share the password with them securely — it isn't stored anywhere else.`)
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(u) {
    try {
      await api.patch(`/users/${u.id}`, { isActive: !u.is_active }, { auth: true })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update user.')
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Delete ${u.name}'s account?`)) return
    try {
      await api.delete(`/users/${u.id}`, { auth: true })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete user.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-forest-900">Collector & admin accounts</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="focus-ring flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800"
        >
          <Plus size={16} /> {showForm ? 'Cancel' : 'New account'}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <Banner type="error">{error}</Banner>
        <Banner type="success">{success}</Banner>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 rounded-xl border border-forest-100 bg-white p-5 sm:grid-cols-2">
          <p className="text-xs text-forest-500 sm:col-span-2">
            Use this person's real email and set a strong real password — they'll use these to log in.
          </p>
          <Input label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
          <Input label="Password (min 8 characters)" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} required />
          <Input label="Phone (optional)" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <label className="block text-sm">
            <span className="font-medium text-forest-800">Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2"
            >
              <option value="collector">Collector</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={busy} className="focus-ring col-span-full mt-2 rounded-lg bg-forest-700 px-4 py-2 font-semibold text-white hover:bg-forest-800 disabled:opacity-60">
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-forest-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest-50 text-forest-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-forest-50">
                <td className="px-4 py-3 font-medium text-forest-900">{u.name}</td>
                <td className="px-4 py-3 text-forest-700">{u.email}</td>
                <td className="px-4 py-3 capitalize text-forest-700">{u.role}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={u.id === currentUser.id}
                    className={`focus-ring rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                      u.is_active ? 'bg-forest-100 text-forest-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(u)}
                    disabled={u.id === currentUser.id}
                    className="focus-ring rounded p-1.5 text-clay hover:bg-clay/10 disabled:opacity-30"
                    aria-label={`Delete ${u.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-forest-800">{label}</span>
      <input
        className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2"
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  )
}
