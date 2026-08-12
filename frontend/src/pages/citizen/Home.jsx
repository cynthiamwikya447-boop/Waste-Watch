import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, MapPin, Search, ShieldCheck } from 'lucide-react'
import { api } from '../../lib/api.js'
import BinMap from '../../components/BinMap.jsx'

export default function Home() {
  const [bins, setBins] = useState([])

  useEffect(() => {
    api.get('/bins').then(({ bins }) => setBins(bins)).catch(() => {})
  }, [])

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-amber-500">
          No account needed
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-forest-900 sm:text-5xl">
          See a bin overflowing? Report it in under a minute.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-forest-700">
          Waste Watch routes your report straight to a collector, and asks you to confirm once it's
          actually been emptied — so nothing falls through the cracks.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/report"
            className="focus-ring rounded-lg bg-forest-700 px-6 py-3 font-semibold text-white transition hover:bg-forest-800"
          >
            Report a full bin
          </Link>
          <Link
            to="/track"
            className="focus-ring rounded-lg border border-forest-300 px-6 py-3 font-semibold text-forest-800 transition hover:bg-forest-50"
          >
            Track an existing report
          </Link>
        </div>
      </section>

      <section className="border-y border-forest-100 bg-forest-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
          <Step icon={<Trash2 size={20} />} title="1. Report" text="Tell us where the bin is and what's wrong. No sign-up." />
          <Step icon={<MapPin size={20} />} title="2. A collector responds" text="Collectors see it on their dashboard and empty it." />
          <Step icon={<ShieldCheck size={20} />} title="3. You confirm" text="We ask you to confirm it was actually collected." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-forest-100 bg-white p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-semibold text-forest-900">Already reported a bin?</h2>
            <p className="mt-1 text-forest-600">Enter your tracking code to check the status or confirm collection.</p>
          </div>
          <Link
            to="/track"
            className="focus-ring flex shrink-0 items-center gap-2 rounded-lg bg-amber-300 px-5 py-3 font-semibold text-forest-900 transition hover:bg-amber-200"
          >
            <Search size={18} /> Track a report
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-forest-900">Bins near you</h2>
            <p className="mt-1 text-forest-600">Zoom in and click a pin to see its exact location and fill level.</p>
          </div>
          <Link to="/bins" className="focus-ring text-sm font-semibold text-forest-700 hover:underline">
            View full bin list →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BinMap bins={bins} height={380} zoom={12} />
          </div>
          <div className="grid gap-3 lg:col-span-2">
            {bins.slice(0, 4).map((bin) => (
              <div key={bin.id} className="flex items-center justify-between rounded-xl border border-forest-100 bg-white p-4">
                <div>
                  <p className="font-mono text-xs text-forest-400">{bin.bin_id}</p>
                  <p className="font-semibold text-forest-900">{bin.address}</p>
                  <p className="text-sm text-forest-500">{bin.zone}</p>
                </div>
                <span
                  className={`text-lg font-bold ${bin.fill_level >= 80 ? 'text-clay' : bin.fill_level >= 50 ? 'text-amber-500' : 'text-forest-700'}`}
                >
                  {bin.fill_level}%
                </span>
              </div>
            ))}
            {bins.length === 0 && (
              <p className="rounded-xl border border-forest-100 bg-white p-4 text-sm text-forest-500">
                No bins registered yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Step({ icon, title, text }) {
  return (
    <div>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-700 text-white">{icon}</span>
      <h3 className="mt-4 font-display text-lg font-semibold text-forest-900">{title}</h3>
      <p className="mt-1 text-sm text-forest-600">{text}</p>
    </div>
  )
}
