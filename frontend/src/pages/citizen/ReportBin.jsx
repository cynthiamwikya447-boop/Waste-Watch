import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'
import { api, ApiError } from '../../lib/api.js'
import { saveReport } from '../../lib/reportStore.js'
import Banner from '../../components/Banner.jsx'

const initialForm = {
  reporterName: '',
  reporterEmail: '',
  reporterPhone: '',
  address: '',
  description: '',
}

export default function ReportBin() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.reporterPhone.trim() || !form.address.trim()) {
      setError('Phone number and address are required so a collector can find the bin.')
      return
    }

    setSubmitting(true)
    try {
      const { report } = await api.post('/reports', form)
      setResult(report)
      saveReport(report)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-2xl border border-forest-200 bg-white p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-forest-900">Thanks — report received</h1>
          <p className="mt-2 text-forest-600">A collector will be notified. Save this tracking code — you'll need it to check status and confirm collection later:</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-forest-50 px-4 py-3">
            <p className="flex-1 font-mono text-2xl font-bold tracking-wider text-forest-800">
              {result.tracking_code}
            </p>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(result.tracking_code)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="focus-ring flex items-center gap-1.5 rounded-lg border border-forest-300 bg-white px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-100"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-4 text-sm text-forest-600">
            This code is also saved in this browser, so it'll show up automatically on the{' '}
            <Link className="focus-ring rounded underline" to="/track">Track a report</Link> page on this device
            {result.reporter_email ? ', and we emailed it to you as a backup.' : '.'} Screenshot or write it down if
            you might use a different device or browser later.
          </p>
          <button
            className="focus-ring mt-6 rounded-lg border border-forest-300 px-5 py-2.5 font-semibold text-forest-800 hover:bg-forest-50"
            onClick={() => {
              setForm(initialForm)
              setResult(null)
            }}
          >
            Report another bin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-forest-900">Report a full bin</h1>
      <p className="mt-2 text-forest-600">No account needed. Just a phone number in case a collector needs to reach you.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Banner type="error">{error}</Banner>

        <Field label="Your name (optional)" value={form.reporterName} onChange={update('reporterName')} placeholder="Jane Wanjiru" />
        <Field label="Email (optional — we'll ask you to confirm collection)" type="email" value={form.reporterEmail} onChange={update('reporterEmail')} placeholder="jane@example.com" />
        <Field label="Phone number" required value={form.reporterPhone} onChange={update('reporterPhone')} placeholder="07xx xxx xxx" />
        <Field label="Bin location / address" required value={form.address} onChange={update('address')} placeholder="e.g. City Market main entrance" />

        <div>
          <label className="block text-sm font-medium text-forest-800">What's the problem? (optional)</label>
          <textarea
            className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2"
            rows={3}
            value={form.description}
            onChange={update('description')}
            placeholder="Overflowing, smells, attracting animals, etc."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="focus-ring w-full rounded-lg bg-forest-700 px-6 py-3 font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-forest-800">
        {label} {required && <span className="text-clay">*</span>}
      </label>
      <input
        className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2"
        required={required}
        {...props}
      />
    </div>
  )
}
