import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import StatusBadge from './StatusBadge.jsx'

const KENYA_CENTER = [-1.2833, 36.8167]

function dotColor(bin) {
  if (bin.status !== 'active') return '#9ca3af' // gray - maintenance/inactive
  if (bin.fill_level >= 80) return '#c0392b' // clay/red - needs collection
  if (bin.fill_level >= 50) return '#f2a93b' // amber - filling up
  return '#2f7d4f' // forest green - low
}

export default function BinMap({ bins, height = 420, zoom = 13 }) {
  const withCoords = bins.filter((b) => b.lat && b.lng)
  const center = withCoords.length
    ? [withCoords[0].lat, withCoords[0].lng]
    : KENYA_CENTER

  return (
    <div>
      <div
        className="overflow-hidden rounded-2xl border border-forest-100"
        style={{ height }}
      >
        <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {withCoords.map((bin) => (
            <CircleMarker
              key={bin.id}
              center={[bin.lat, bin.lng]}
              radius={10}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: dotColor(bin),
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-mono text-xs text-forest-400">{bin.bin_id}</p>
                  <p className="font-semibold text-forest-900">{bin.address}</p>
                  <p className="text-sm text-forest-500">{bin.zone}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">{bin.fill_level}% full</span>
                    <StatusBadge value={bin.status} />
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-forest-600">
        <Legend color="#2f7d4f" label="Under 50% full" />
        <Legend color="#f2a93b" label="50–79% full" />
        <Legend color="#c0392b" label="80%+ — needs collection" />
        <Legend color="#9ca3af" label="Maintenance / inactive" />
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-full border border-white" style={{ backgroundColor: color, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }} />
      {label}
    </span>
  )
}
