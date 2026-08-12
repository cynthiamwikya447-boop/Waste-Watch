import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer className="mt-16 border-t border-forest-100 bg-forest-900 text-forest-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold text-white">Waste Watch</p>
          <p className="mt-2 text-sm text-forest-200">
            Report an overflowing bin in under a minute. No account needed.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-forest-300">Residents</p>
          <ul className="mt-2 space-y-1 text-sm">
            {!user && <li><Link className="focus-ring rounded hover:underline" to="/report">Report a full bin</Link></li>}
            <li><Link className="focus-ring rounded hover:underline" to="/track">Track a report</Link></li>
            <li><Link className="focus-ring rounded hover:underline" to="/bins">Bin map</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-forest-300">
            {user ? 'Account' : 'Need help?'}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {!user && <li><Link className="focus-ring rounded hover:underline" to="/contact">Contact admin</Link></li>}
            {!user && <li><Link className="focus-ring rounded hover:underline" to="/login">Collector / admin login</Link></li>}
            {user?.role === 'collector' && <li><Link className="focus-ring rounded hover:underline" to="/collector">My dashboard</Link></li>}
            {user?.role === 'admin' && <li><Link className="focus-ring rounded hover:underline" to="/admin">Admin dashboard</Link></li>}
          </ul>
        </div>
      </div>
      <p className="border-t border-forest-800 px-4 py-4 text-center text-xs text-forest-300">
        © {new Date().getFullYear()} Waste Watch. Keeping the city clean, one report at a time.
      </p>
    </footer>
  )
}
