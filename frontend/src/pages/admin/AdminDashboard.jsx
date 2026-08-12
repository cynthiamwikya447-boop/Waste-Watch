import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import AdminBins from './AdminBins.jsx'
import AdminReports from './AdminReports.jsx'
import AdminUsers from './AdminUsers.jsx'
import AdminAlerts from './AdminAlerts.jsx'
import AdminContactMessages from './AdminContactMessages.jsx'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'reports', label: 'Reports' },
  { key: 'bins', label: 'Bins' },
  { key: 'users', label: 'Users' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'contact', label: 'Contact messages' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-forest-900">Admin dashboard</h1>
      <p className="mt-1 text-forest-600">Bins, reports, accounts, alerts — all in one place.</p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-forest-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`focus-ring -mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === t.key ? 'border-forest-700 text-forest-900' : 'border-transparent text-forest-500 hover:text-forest-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'overview' && <Overview onNavigate={setTab} />}
        {tab === 'reports' && <AdminReports />}
        {tab === 'bins' && <AdminBins />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'alerts' && <AdminAlerts />}
        {tab === 'contact' && <AdminContactMessages />}
      </div>
    </div>
  )
}

function Overview({ onNavigate }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/reports', { auth: true }),
      api.get('/bins'),
      api.get('/alerts?status=active', { auth: true }),
    ]).then(([{ reports }, { bins }, { alerts }]) => {
      setStats({
        pending: reports.filter((r) => ['pending', 'assigned', 'reopened'].includes(r.status)).length,
        awaitingConfirmation: reports.filter((r) => r.status === 'collected').length,
        confirmed: reports.filter((r) => r.status === 'confirmed').length,
        binsOver80: bins.filter((b) => b.fill_level >= 80).length,
        activeAlerts: alerts.length,
      })
    })
  }, [])

  if (!stats) return <p className="text-forest-500">Loading…</p>

  const cards = [
    { label: 'Open reports', value: stats.pending, tab: 'reports' },
    { label: 'Awaiting resident confirmation', value: stats.awaitingConfirmation, tab: 'reports' },
    { label: 'Confirmed collected', value: stats.confirmed, tab: 'reports' },
    { label: 'Bins over 80% full', value: stats.binsOver80, tab: 'bins' },
    { label: 'Active alerts', value: stats.activeAlerts, tab: 'alerts' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <button
          key={c.label}
          onClick={() => onNavigate(c.tab)}
          className="focus-ring rounded-xl border border-forest-100 bg-white p-5 text-left transition hover:border-forest-300"
        >
          <p className="text-3xl font-bold text-forest-800">{c.value}</p>
          <p className="mt-1 text-sm text-forest-600">{c.label}</p>
        </button>
      ))}
    </div>
  )
}
