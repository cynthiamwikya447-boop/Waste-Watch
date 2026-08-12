import { useState } from 'react'
import { api, ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'

const initialForm = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Please fill in a subject and message.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/contact', form)
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-forest-900">Contact admin</h1>
      <p className="mt-2 text-forest-600">
        Having trouble logging in, or something not working? Send us a message and an admin will follow up.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-forest-200 bg-white p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-forest-900">Message sent</h2>
          <p className="mt-2 text-forest-600">Thanks — an admin will get back to you.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <Banner type="error">{error}</Banner>
          <Field label="Your name (optional)" value={form.name} onChange={update('name')} />
          <Field label="Your email (optional, so we can reply)" type="email" value={form.email} onChange={update('email')} />
          <Field label="Subject" required value={form.subject} onChange={update('subject')} placeholder="e.g. Can't log in to my collector account" />
          <div>
            <label className="block text-sm font-medium text-forest-800">
              Message <span className="text-clay">*</span>
            </label>
            <textarea
              className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2"
              rows={5}
              required
              value={form.message}
              onChange={update('message')}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-lg bg-forest-700 px-6 py-3 font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  )
}

function Field({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-forest-800">
        {label} {required && <span className="text-clay">*</span>}
      </label>
      <input className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2" required={required} {...props} />
    </div>
  )
}
