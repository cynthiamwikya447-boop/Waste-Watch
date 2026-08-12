import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ApiError } from '../../lib/api.js'
import Banner from '../../components/Banner.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email.trim(), password)
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : '/collector')
      navigate(dest, { replace: true })
    } catch (err) {
      setFailedAttempts((n) => n + 1)
      setError(err instanceof ApiError ? err.message : 'Could not log in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-forest-900">Collector / admin login</h1>
      <p className="mt-2 text-forest-600">
        This login is for waste collectors and administrators. Residents don't need an account —{' '}
        <Link className="focus-ring rounded underline" to="/report">report a bin here</Link>.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Banner type="error">{error}</Banner>

        <div>
          <label className="block text-sm font-medium text-forest-800">Email</label>
          <input
            type="email"
            required
            autoComplete="username"
            className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-forest-800">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            className="focus-ring mt-1 w-full rounded-lg border border-forest-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="focus-ring w-full rounded-lg bg-forest-700 px-6 py-3 font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      {failedAttempts >= 1 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-500">
          Trouble logging in? If you've forgotten your password or think your account isn't set up
          correctly, an admin can help.{' '}
          <Link className="focus-ring rounded font-semibold underline" to="/contact">
            Contact admin →
          </Link>
        </div>
      )}
    </div>
  )
}
