import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import BinMap from '../../components/BinMap.jsx'

export default function BinsList() {
  const [bins, setBins] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/bins')
      .then(({ bins }) => setBins(bins))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load bins.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-forest-900">Bin locations</h1>
      <p className="mt-2 text-forest-600">Public fill-level status for every registered bin. Zoom or click a dot for details.</p>

      <div className="mt-6"><Banner type="error">{error}</Banner></div>

      {loading ? (
        <p className="mt-8 text-forest-500">Loading…</p>
      ) : bins.length === 0 ? (
        <p className="mt-8 rounded-xl border border-forest-100 bg-white p-6 text-forest-500">
          No bins registered yet. If you're the admin, add one from the Admin dashboard's Bins tab.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:sticky lg:top-20 lg:col-span-3 lg:self-start">
            <BinMap bins={bins} height={560} />
          </div>

          <div className="grid gap-4 lg:col-span-2 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
            {bins.map((bin) => (
              <div key={bin.id} className="rounded-xl border border-forest-100 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-forest-400">{bin.bin_id}</p>
                    <p className="font-semibold text-forest-900">{bin.address}</p>
                    <p className="text-sm text-forest-500">{bin.zone}</p>
                  </div>
                  <StatusBadge value={bin.status} />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-forest-500">
                    <span>Fill level</span>
                    <span>{bin.fill_level}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-forest-50">
                    <div
                      className={`h-full rounded-full ${bin.fill_level >= 80 ? 'bg-clay' : bin.fill_level >= 50 ? 'bg-amber-300' : 'bg-forest-500'}`}
                      style={{ width: `${bin.fill_level}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
