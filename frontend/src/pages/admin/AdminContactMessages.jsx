import { useEffect, useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([])
  const [filter, setFilter] = useState('open')
  const [error, setError] = useState('')

  function load() {
    api
      .get(`/contact?status=${filter}`, { auth: true })
      .then(({ messages }) => setMessages(messages))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load messages.'))
  }

  useEffect(load, [filter])

  async function close(m) {
    try {
      await api.patch(`/contact/${m.id}/close`, {}, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-forest-900">Contact messages</h2>
        <div className="flex gap-2">
          {['open', 'closed', 'all'].map((f) => (
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
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-forest-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-forest-900">{m.subject}</p>
                <p className="text-xs text-forest-400">
                  {m.name || 'Anonymous'} {m.email ? `· ${m.email}` : ''} · {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
              <StatusBadge value={m.status} />
            </div>
            <p className="mt-2 text-sm text-forest-700">{m.message}</p>
            {m.status === 'open' && (
              <button onClick={() => close(m)} className="focus-ring mt-3 rounded-lg border border-forest-300 px-3 py-1.5 text-sm font-semibold text-forest-800 hover:bg-forest-50">
                Mark handled
              </button>
            )}
          </div>
        ))}
        {messages.length === 0 && <p className="text-forest-400">No messages here.</p>}
      </div>
    </div>
  )
}
