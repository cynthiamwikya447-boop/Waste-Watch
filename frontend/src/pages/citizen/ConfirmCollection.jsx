import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function ConfirmCollection() {
  const { code: codeFromUrl } = useParams()
  const [code, setCode] = useState(codeFromUrl || '')
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [done, setDone] = useState(null) // true | false | null

  useEffect(() => {
    if (codeFromUrl) lookup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl])

  async function lookup(e) {
    e?.preventDefault()
    if (!code.trim()) return
    setError('')
    setLoading(true)
    setReport(null)
    try {
      const { report } = await api.get(`/reports/track/${code.trim().toUpperCase()}`)
      setReport(report)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function respond(confirmed) {
    setError('')
    setLoading(true)
    try {
      const { report: updated } = await api.post(`/reports/track/${report.tracking_code}/confirm`, {
        confirmed,
        note: note.trim() || undefined,
      })
      setReport(updated)
      setDone(confirmed)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-forest-900">Confirm collection</h1>
      <p className="mt-2 text-forest-600">
        Let us know whether the bin you reported was actually emptied.
      </p>

      {!report && (
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
            {loading ? 'Looking up…' : 'Find report'}
          </button>
        </form>
      )}

      <div className="mt-6"><Banner type="error">{error}</Banner></div>

      {report && done === null && (
        <div className="mt-6 rounded-2xl border border-forest-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-lg font-bold text-forest-800">{report.tracking_code}</p>
            <StatusBadge value={report.status} />
          </div>
          <p className="mt-2 text-sm text-forest-600">{report.address}</p>

          {report.status !== 'collected' ? (
            <p className="mt-4 rounded-lg bg-forest-50 p-4 text-sm text-forest-700">
              This report isn't awaiting confirmation right now. Current status:{' '}
              <StatusBadge value={report.status} />
            </p>
          ) : (
            <>
              <p className="mt-4 text-forest-800">Was this bin actually emptied?</p>
              <textarea
                className="focus-ring mt-3 w-full rounded-lg border border-forest-200 px-3 py-2 text-sm"
                rows={2}
                placeholder="Optional note (e.g. still half full, spilled nearby, etc.)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => respond(true)}
                  disabled={loading}
                  className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg bg-forest-700 px-5 py-3 font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
                >
                  <CheckCircle2 size={18} /> Yes, it was collected
                </button>
                <button
                  onClick={() => respond(false)}
                  disabled={loading}
                  className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg border border-clay/40 px-5 py-3 font-semibold text-clay hover:bg-clay/5 disabled:opacity-60"
                >
                  <XCircle size={18} /> No, still not collected
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {done !== null && (
        <div className="mt-6 rounded-2xl border border-forest-200 bg-white p-8 text-center">
          {done ? (
            <>
              <CheckCircle2 className="mx-auto text-forest-600" size={40} />
              <h2 className="mt-3 font-display text-xl font-semibold text-forest-900">Thanks for confirming!</h2>
              <p className="mt-1 text-forest-600">Report {report.tracking_code} is now marked as confirmed collected.</p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto text-clay" size={40} />
              <h2 className="mt-3 font-display text-xl font-semibold text-forest-900">Thanks — we've reopened it</h2>
              <p className="mt-1 text-forest-600">
                We've flagged this to the admin team as an issue. Report {report.tracking_code} has been reopened.
              </p>
            </>
          )}
          <Link to="/" className="focus-ring mt-6 inline-block rounded-lg border border-forest-300 px-5 py-2.5 font-semibold text-forest-800 hover:bg-forest-50">
            Back to home
          </Link>
        </div>
      )}
    </div>
  )
}
