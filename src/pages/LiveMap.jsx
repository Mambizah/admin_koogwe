import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TopBar, Loading, EmptyState } from '../components/UI'
import { liveService } from '../services/api'

function latLngToWorldPx(lat, lng, zoom) {
  const sin = Math.sin((lat * Math.PI) / 180)
  const z2 = 2 ** zoom
  const x = ((lng + 180) / 360) * 256 * z2
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 256 * z2
  return { x, y }
}

export default function LiveMap() {
  const [data, setData] = useState({ drivers: [], rides: [] })
  const [loading, setLoading] = useState(true)
  const [center, setCenter] = useState({ lat: 4.93, lng: -52.33 })
  const [zoom, setZoom] = useState(12)
  const containerRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const res = await liveService.getMap()
      setData(res)
      if (res.drivers?.length) {
        setCenter({ lat: res.drivers[0].lat, lng: res.drivers[0].lng })
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [load])

  const markers = useMemo(() => {
    const w = containerRef.current?.clientWidth || 800
    const h = containerRef.current?.clientHeight || 480
    const c = latLngToWorldPx(center.lat, center.lng, zoom)
    const toPx = (lat, lng) => {
      const p = latLngToWorldPx(lat, lng, zoom)
      return { x: w / 2 + (p.x - c.x), y: h / 2 + (p.y - c.y) }
    }
    return {
      drivers: (data.drivers || []).map((d) => ({ ...d, ...toPx(d.lat, d.lng) })),
      rides: (data.rides || []).map((r) => ({
        ...r,
        pickup: toPx(r.pickupLat, r.pickupLng),
        dropoff: toPx(r.dropoffLat, r.dropoffLng),
      })),
    }
  }, [data, center, zoom])

  const tileUrl = (x, y) =>
    `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`

  const tiles = useMemo(() => {
    const w = containerRef.current?.clientWidth || 800
    const h = containerRef.current?.clientHeight || 480
    const c = latLngToWorldPx(center.lat, center.lng, zoom)
    const z2 = 2 ** zoom
    const tileSize = 256
    const startX = Math.floor(c.x / tileSize) - Math.ceil(w / tileSize / 2)
    const startY = Math.floor(c.y / tileSize) - Math.ceil(h / tileSize / 2)
    const cols = Math.ceil(w / tileSize) + 2
    const rows = Math.ceil(h / tileSize) + 2
    const list = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tx = startX + col
        const ty = startY + row
        const wrappedX = ((tx % z2) + z2) % z2
        list.push({
          key: `${zoom}-${tx}-${ty}`,
          url: tileUrl(wrappedX, ty),
          left: col * tileSize - (c.x % tileSize) + w / 2 - tileSize * Math.ceil(w / tileSize / 2),
          top: row * tileSize - (c.y % tileSize) + h / 2 - tileSize * Math.ceil(h / tileSize / 2),
        })
      }
    }
    return list
  }, [center, zoom])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Carte live" />
      <div style={{ padding: '20px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '12px 18px', display: 'flex', gap: 20 }}>
            <div><span style={{ fontSize: 11, color: 'var(--text3)' }}>Chauffeurs en ligne</span><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{data.drivers?.length ?? 0}</div></div>
            <div><span style={{ fontSize: 11, color: 'var(--text3)' }}>Courses actives</span><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)' }}>{data.rides?.length ?? 0}</div></div>
          </div>
          <button className="btn btn-primary" onClick={load}>Actualiser</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setZoom((z) => Math.min(18, z + 1))}>+</button>
            <button className="btn" onClick={() => setZoom((z) => Math.max(4, z - 1))}>−</button>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>MAJ auto 8s · {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString('fr-FR') : '—'}</span>
        </div>

        {loading ? <Loading /> : (
          <div ref={containerRef} className="card" style={{ flex: 1, minHeight: 420, position: 'relative', overflow: 'hidden', borderRadius: 14 }}>
            {tiles.map((t) => (
              <img key={t.key} src={t.url} alt="" draggable={false} style={{ position: 'absolute', left: t.left, top: t.top, width: 256, height: 256, pointerEvents: 'none' }} />
            ))}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {markers.rides.map((r) => (
                <g key={r.id}>
                  <line x1={r.pickup.x} y1={r.pickup.y} x2={r.dropoff.x} y2={r.dropoff.y} stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" opacity={0.7} />
                  <circle cx={r.pickup.x} cy={r.pickup.y} r={6} fill="#10B981" />
                  <circle cx={r.dropoff.x} cy={r.dropoff.y} r={6} fill="#EF4444" />
                </g>
              ))}
              {markers.drivers.map((d) => (
                <g key={d.id}>
                  <circle cx={d.x} cy={d.y} r={10} fill="#2B5FF5" stroke="#fff" strokeWidth={2} />
                  <title>{d.name} · {d.vehicleType}</title>
                </g>
              ))}
            </svg>
            {!data.drivers?.length && !data.rides?.length && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState title="Aucune activité" subtitle="Aucun chauffeur en ligne ni course active" />
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#2B5FF5', marginRight: 6 }} />Chauffeur</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#10B981', marginRight: 6 }} />Départ course</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#EF4444', marginRight: 6 }} />Arrivée course</span>
        </div>
      </div>
    </div>
  )
}
