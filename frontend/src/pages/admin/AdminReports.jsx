import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

const FILTERS = ['', 'pending', 'assigned', 'collected', 'confirmed', 'reopened', 'rejected']

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get(`/reports${status ? `?status=${status}` : ''}`, { auth: true })
      .then(({ reports }) => setReports(reports))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load reports.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status])

  async function setPriority(report, priority) {
    try {
      await api.patch(`/reports/${report.id}`, { priority }, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function setStatusFor(report, newStatus) {
    try {
      await api.patch(`/reports/${report.id}`, { status: newStatus }, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-forest-900">Reports</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`focus-ring rounded-full px-3 py-1 text-xs font-medium ${
              status === f ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
            }`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      <div className="mt-4"><Banner type="error">{error}</Banner></div>

      {loading ? (
        <p className="mt-6 text-forest-500">Loading…</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-forest-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-forest-400">{r.tracking_code}</p>
                  <p className="font-semibold text-forest-900">{r.address}</p>
                  <p className="text-xs text-forest-400">
                    {r.reporter_name || 'Anonymous'} · {r.reporter_phone}
                    {r.reporter_email ? ` · ${r.reporter_email}` : ''}
                  </p>
                  {r.collected_by_name && (
                    <p className="mt-1 text-xs text-forest-500">Collected by {r.collected_by_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={r.status} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-1.5">
                  <span className="text-forest-500">Priority</span>
                  <select
                    value={r.priority}
                    onChange={(e) => setPriority(r, e.target.value)}
                    className="focus-ring rounded border border-forest-200 px-2 py-1"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="text-forest-500">Status</span>
                  <select
                    value={r.status}
                    onChange={(e) => setStatusFor(r, e.target.value)}
                    className="focus-ring rounded border border-forest-200 px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="collected">Collected</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="reopened">Reopened</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-forest-400">No reports here.</p>}
        </div>
      )}
    </div>
  )
}
