import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('active')
  const [error, setError] = useState('')

  function load() {
    api
      .get(`/alerts?status=${filter}`, { auth: true })
      .then(({ alerts }) => setAlerts(alerts))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load alerts.'))
  }

  useEffect(load, [filter])

  async function resolve(alert) {
    try {
      await api.patch(`/alerts/${alert.id}/resolve`, {}, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-forest-900">Alerts</h2>
        <div className="flex gap-2">
          {['active', 'resolved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`focus-ring rounded-full px-3 py-1 text-xs font-medium capitalize ${
                filter === f ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4"><Banner type="error">{error}</Banner></div>

      <div className="mt-4 grid gap-3">
        {alerts.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-forest-100 bg-white p-4">
            <div>
              <StatusBadge value={a.severity} />
              <p className="mt-2 text-forest-900">{a.message}</p>
              {a.bin && <p className="mt-1 text-xs text-forest-400">{a.bin.bin_id} · {a.bin.address}</p>}
              <p className="mt-1 text-xs text-forest-400">{new Date(a.created_at).toLocaleString()}</p>
            </div>
            {a.status === 'active' && (
              <button onClick={() => resolve(a)} className="focus-ring shrink-0 rounded-lg border border-forest-300 px-3 py-1.5 text-sm font-semibold text-forest-800 hover:bg-forest-50">
                Resolve
              </button>
            )}
          </div>
        ))}
        {alerts.length === 0 && <p className="text-forest-400">No alerts here.</p>}
      </div>
    </div>
  )
}
