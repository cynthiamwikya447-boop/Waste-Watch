const STYLES = {
  pending: 'bg-amber-100 text-amber-500',
  assigned: 'bg-forest-100 text-forest-700',
  collected: 'bg-forest-200 text-forest-800',
  confirmed: 'bg-forest-700 text-white',
  reopened: 'bg-clay/10 text-clay',
  rejected: 'bg-gray-200 text-gray-600',
  active: 'bg-forest-100 text-forest-700',
  maintenance: 'bg-amber-100 text-amber-500',
  inactive: 'bg-gray-200 text-gray-600',
  info: 'bg-forest-100 text-forest-700',
  warning: 'bg-amber-100 text-amber-500',
  critical: 'bg-clay/10 text-clay',
  resolved: 'bg-gray-200 text-gray-600',
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-500',
  high: 'bg-clay/10 text-clay',
  open: 'bg-amber-100 text-amber-500',
  closed: 'bg-gray-200 text-gray-600',
}

const LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  collected: 'Collected — awaiting confirmation',
  confirmed: 'Confirmed collected',
  reopened: 'Reopened by resident',
  rejected: 'Rejected',
}

export default function StatusBadge({ value }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[value] || 'bg-gray-100 text-gray-600'}`}>
      {LABELS[value] || value}
    </span>
  )
}
