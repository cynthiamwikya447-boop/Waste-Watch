import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const publicLinks = [
  { to: '/report', label: 'Report a full bin' },
  { to: '/track', label: 'Track a report' },
  { to: '/bins', label: 'Bin map' },
  { to: '/contact', label: 'Contact admin' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Collectors and admins don't need the citizen-facing "report" or
  // "contact admin" links in their nav - they have their own dashboards.
  const visibleLinks = user
    ? publicLinks.filter((l) => l.to !== '/report' && l.to !== '/contact')
    : publicLinks

  function handleLogout() {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `focus-ring rounded px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-forest-800 bg-forest-100' : 'text-forest-700 hover:bg-forest-50'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest-700 text-paper">
            <Trash2 size={18} />
          </span>
          <span className="font-display text-lg font-semibold text-forest-900">Waste Watch</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}

          {!user && (
            <NavLink to="/login" className={linkClass}>
              Collector / Admin login
            </NavLink>
          )}

          {user?.role === 'collector' && (
            <NavLink to="/collector" className={linkClass}>
              My dashboard
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={linkClass}>
              Admin dashboard
            </NavLink>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="focus-ring ml-2 rounded border border-forest-200 px-3 py-2 text-sm font-medium text-forest-700 hover:bg-forest-50"
            >
              Log out ({user.name.split(' ')[0]})
            </button>
          )}
        </div>

        <button
          className="focus-ring rounded p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-forest-100 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {visibleLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {!user && (
              <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                Collector / Admin login
              </NavLink>
            )}
            {user?.role === 'collector' && (
              <NavLink to="/collector" className={linkClass} onClick={() => setOpen(false)}>
                My dashboard
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                Admin dashboard
              </NavLink>
            )}
            {user && (
              <button
                onClick={() => {
                  setOpen(false)
                  handleLogout()
                }}
                className="focus-ring rounded border border-forest-200 px-3 py-2 text-left text-sm font-medium text-forest-700"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
