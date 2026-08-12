import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-forest-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-forest-900">Page not found</h1>
      <p className="mt-2 text-forest-600">That link doesn't lead anywhere. Let's get you back on track.</p>
      <Link to="/" className="focus-ring mt-6 inline-block rounded-lg bg-forest-700 px-6 py-3 font-semibold text-white hover:bg-forest-800">
        Back to home
      </Link>
    </div>
  )
}
