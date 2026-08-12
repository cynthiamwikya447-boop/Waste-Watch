import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Plus, Trash2 } from 'lucide-react'

const emptyForm = { bin_id: '', address: '', zone: '', lat: '', lng: '', fill_level: 0, status: 'active' }

export default function AdminBins() {
  const [bins, setBins] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  function load() {
    api.get('/bins').then(({ bins }) => setBins(bins)).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post(
        '/bins',
        { ...form, lat: Number(form.lat), lng: Number(form.lng), fill_level: Number(form.fill_level) },
        { auth: true }
      )
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create bin.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(bin) {
    if (!confirm(`Delete bin ${bin.bin_id}? This can't be undone.`)) return
    try {
      await api.delete(`/bins/${bin.id}`, { auth: true })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete bin.')
    }
  }

  async function handleStatusChange(bin, status) {
    try {
      await api.put(`/bins/${bin.id}`, { status }, { auth: true })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update bin.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-forest-900">Bins</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="focus-ring flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800"
        >
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add bin'}
        </button>
      </div>

      <div className="mt-4"><Banner type="error">{error}</Banner></div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 rounded-xl border border-forest-100 bg-white p-5 sm:grid-cols-2">
          <TextInput label="Bin ID" value={form.bin_id} onChange={(v) => setForm((f) => ({ ...f, bin_id: v }))} required />
          <TextInput label="Zone" value={form.zone} onChange={(v) => setForm((f) => ({ ...f, zone: v }))} required />
          <div className="sm:col-span-2">
            <TextInput label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} required />
          </div>
          <TextInput label="Latitude" value={form.lat} onChange={(v) => setForm((f) => ({ ...f, lat: v }))} required type="number" step="any" />
          <TextInput label="Longitude" value={form.lng} onChange={(v) => setForm((f) => ({ ...f, lng: v }))} required type="number" step="any" />
          <button type="submit" disabled={busy} className="focus-ring col-span-full mt-2 rounded-lg bg-forest-700 px-4 py-2 font-semibold text-white hover:bg-forest-800 disabled:opacity-60">
            {busy ? 'Creating…' : 'Create bin'}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-forest-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest-50 text-forest-500">
            <tr>
              <th className="px-4 py-3">Bin</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Fill</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bins.map((bin) => (
              <tr key={bin.id} className="border-t border-forest-50">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs text-forest-400">{bin.bin_id}</p>
                  <p className="font-medium text-forest-900">{bin.address}</p>
                </td>
                <td className="px-4 py-3 text-forest-700">{bin.zone}</td>
                <td className="px-4 py-3 text-forest-700">{bin.fill_level}%</td>
                <td className="px-4 py-3">
                  <select
                    value={bin.status}
                    onChange={(e) => handleStatusChange(bin, e.target.value)}
                    className="focus-ring rounded border border-forest-200 px-2 py-1 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(bin)} className="focus-ring rounded p-1.5 text-clay hover:bg-clay/10" aria-label={`Delete ${bin.bin_id}`}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {bins.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-forest-400">No bins yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TextInput({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-forest-800">{label}</span>
      <input className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2" {...props} onChange={(e) => props.onChange(e.target.value)} value={props.value} />
    </label>
  )
}
