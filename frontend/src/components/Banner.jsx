const STYLES = {
  error: 'bg-clay/10 text-clay border-clay/30',
  success: 'bg-forest-100 text-forest-800 border-forest-300',
  info: 'bg-amber-50 text-amber-500 border-amber-200',
}

export default function Banner({ type = 'info', children }) {
  if (!children) return null
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${STYLES[type]}`}>
      {children}
    </div>
  )
}
