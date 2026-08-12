import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { CheckCircle2, RefreshCw } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'All open' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'collected', label: 'Awaiting confirmation' },
  { value: 'reopened', label: 'Reopened' },
]

export default function CollectorDashboard() {
  const [reports, setReports] = useState([])
  const [bins, setBins] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const query = status ? `?status=${status}` : ''
      const [{ reports }, { bins }] = await Promise.all([
        api.get(`/reports${query}`, { auth: true }),
        api.get('/bins'),
      ])
      setReports(status ? reports : reports.filter((r) => !['confirmed', 'rejected'].includes(r.status)))
      setBins(bins)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function markCollected(report) {
    setBusyId(report.id)
    setError('')
    setSuccess('')
    try {
      await api.patch(`/reports/${report.id}/collect`, {}, { auth: true })
      setSuccess(`Marked "${report.address}" as collected. The resident will be asked to confirm.`)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this report.')
    } finally {
      setBusyId(null)
    }
  }

  async function updateFillLevel(bin, fill_level) {
    setBusyId(`bin-${bin.id}`)
    setError('')
    try {
      await api.patch(`/bins/${bin.id}/fill-level`, { fill_level }, { auth: true })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the bin.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">Collector dashboard</h1>
          <p className="mt-1 text-forest-600">Reports waiting for pickup, and bins you can update.</p>
        </div>
        <button onClick={load} className="focus-ring flex items-center gap-2 rounded-lg border border-forest-300 px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <Banner type="error">{error}</Banner>
        <Banner type="success">{success}</Banner>
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`focus-ring rounded-full px-4 py-1.5 text-sm font-medium ${
                status === f.value ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-6 text-forest-500">Loading…</p>
        ) : reports.length === 0 ? (
          <p className="mt-6 rounded-xl border border-forest-100 bg-white p-6 text-forest-500">
            Nothing here right now. Nice work.
          </p>
        ) : (
          <div className="mt-6 grid gap-4">
            {reports.map((r) => (
              <div key={r.id} className="rounded-xl border border-forest-100 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-forest-400">{r.tracking_code}</p>
                    <p className="font-semibold text-forest-900">{r.address}</p>
                    {r.description && <p className="mt-1 text-sm text-forest-600">{r.description}</p>}
                    <p className="mt-1 text-xs text-forest-400">
                      Reported {new Date(r.created_at).toLocaleString()} · Phone: {r.reporter_phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge value={r.status} />
                    <StatusBadge value={r.priority} />
                  </div>
                </div>

                {['pending', 'assigned', 'reopened'].includes(r.status) && (
                  <button
                    onClick={() => markCollected(r)}
                    disabled={busyId === r.id}
                    className="focus-ring mt-4 flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
                  >
                    <CheckCircle2 size={16} /> {busyId === r.id ? 'Updating…' : 'Mark as collected'}
                  </button>
                )}
                {r.status === 'collected' && (
                  <p className="mt-4 text-sm text-amber-500">Waiting for resident to confirm collection.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-forest-900">Bin fill levels</h2>
        <p className="mt-1 text-sm text-forest-600">Update a bin to 0% once you've emptied it directly (no report needed).</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {bins.map((bin) => (
            <div key={bin.id} className="rounded-xl border border-forest-100 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-forest-400">{bin.bin_id}</p>
                  <p className="font-semibold text-forest-900">{bin.address}</p>
                </div>
                <span className="text-lg font-bold text-forest-800">{bin.fill_level}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={bin.fill_level}
                onChange={(e) => updateFillLevel(bin, Number(e.target.value))}
                disabled={busyId === `bin-${bin.id}`}
                className="mt-3 w-full accent-forest-700"
              />
              <button
                onClick={() => updateFillLevel(bin, 0)}
                disabled={busyId === `bin-${bin.id}`}
                className="focus-ring mt-2 text-sm font-semibold text-forest-700 hover:underline disabled:opacity-60"
              >
                Mark emptied (0%)
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
