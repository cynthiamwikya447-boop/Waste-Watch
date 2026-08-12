import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../../lib/api.js'
import { getSavedReports } from '../../lib/reportStore.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function TrackReport() {
  const { code: codeFromUrl } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(codeFromUrl || '')
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState([])

  useEffect(() => {
    setSaved(getSavedReports())
  }, [])

  async function lookup(e, overrideCode) {
    e?.preventDefault()
    const target = (overrideCode || code).trim().toUpperCase()
    if (!target) return
    setCode(target)
    setError('')
    setLoading(true)
    setReport(null)
    try {
      const { report } = await api.get(`/reports/track/${target}`)
      setReport(report)
      navigate(`/track/${target}`, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-forest-900">Track a report</h1>
      <p className="mt-2 text-forest-600">Enter the tracking code you were given when you reported a bin.</p>

      <form onSubmit={lookup} className="mt-8 flex gap-2">
        <input
          className="focus-ring flex-1 rounded-lg border border-forest-200 px-3 py-2 font-mono uppercase tracking-wider"
          placeholder="WW-XXXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="focus-ring rounded-lg bg-forest-700 px-5 py-2 font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
        >
          {loading ? 'Looking up…' : 'Track'}
        </button>
      </form>

      <div className="mt-6">
        <Banner type="error">{error}</Banner>
      </div>

      {!report && saved.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-forest-500">
            Your recent reports (saved on this device)
          </p>
          <div className="mt-3 grid gap-2">
            {saved.map((r) => (
              <button
                key={r.tracking_code}
                onClick={(e) => lookup(e, r.tracking_code)}
                className="focus-ring flex items-center justify-between rounded-lg border border-forest-100 bg-white px-4 py-3 text-left hover:border-forest-300"
              >
                <span>
                  <span className="font-mono font-semibold text-forest-800">{r.tracking_code}</span>
                  <span className="ml-2 text-sm text-forest-500">{r.address}</span>
                </span>
                <span className="text-sm text-forest-400">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {report && (
        <div className="mt-6 rounded-2xl border border-forest-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-lg font-bold text-forest-800">{report.tracking_code}</p>
            <StatusBadge value={report.status} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Address" value={report.address} />
            <Row label="Reported" value={new Date(report.created_at).toLocaleString()} />
            {report.description && <Row label="Details" value={report.description} />}
            {report.collected_at && <Row label="Collected" value={new Date(report.collected_at).toLocaleString()} />}
            {report.confirmed_at && <Row label="Confirmed" value={new Date(report.confirmed_at).toLocaleString()} />}
          </dl>

          {report.status === 'collected' && (
            <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-500">
              A collector marked this as collected.{' '}
              <a className="focus-ring rounded font-semibold underline" href={`/confirm/${report.tracking_code}`}>
                Please confirm it was actually emptied →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-forest-50 py-1.5">
      <dt className="text-forest-500">{label}</dt>
      <dd className="text-right text-forest-800">{value}</dd>
    </div>
  )
}
