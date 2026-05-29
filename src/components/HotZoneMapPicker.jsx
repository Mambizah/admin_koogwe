import { useCallback, useMemo, useRef, useState } from 'react'

// Mini "slippy map" sans dépendances :
// - tuiles OpenStreetMap
// - clic pour choisir un centre (lat/lng)
// - cercle rayon (km) en overlay

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function wrap(n, max) {
  // wrap pour X (monde)
  const m = ((n % max) + max) % max
  return m
}

function latLngToWorldPx(lat, lng, zoom) {
  const sin = Math.sin((lat * Math.PI) / 180)
  const z2 = 2 ** zoom
  const x = ((lng + 180) / 360) * 256 * z2
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 256 * z2
  return { x, y }
}

function worldPxToLatLng(x, y, zoom) {
  const z2 = 2 ** zoom
  const lng = (x / (256 * z2)) * 360 - 180
  const n = Math.PI - (2 * Math.PI * y) / (256 * z2)
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
  return { lat, lng }
}

function metersPerPixel(lat, zoom) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / (2 ** zoom)
}

export function HotZoneMapPicker({
  value,
  onChange,
  radiusKm = 2,
  height = 360,
}) {
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(13)
  const [drag, setDrag] = useState(null) // {startX,startY,startCenterWorld}

  const center = useMemo(() => {
    const fallback = { lat: 4.9224, lng: -52.3135 } // Cayenne
    return {
      lat: Number(value?.centerLat ?? fallback.lat),
      lng: Number(value?.centerLng ?? fallback.lng),
    }
  }, [value?.centerLat, value?.centerLng])

  const size = useMemo(() => ({ w: 640, h: height }), [height])
  const centerWorld = useMemo(() => latLngToWorldPx(center.lat, center.lng, zoom), [center.lat, center.lng, zoom])

  const tiles = useMemo(() => {
    const tileSize = 256
    const halfW = size.w / 2
    const halfH = size.h / 2
    const topLeftWorld = { x: centerWorld.x - halfW, y: centerWorld.y - halfH }
    const bottomRightWorld = { x: centerWorld.x + halfW, y: centerWorld.y + halfH }

    const z2 = 2 ** zoom
    const maxTile = z2
    const minTileX = Math.floor(topLeftWorld.x / tileSize)
    const maxTileX = Math.floor(bottomRightWorld.x / tileSize)
    const minTileY = Math.floor(topLeftWorld.y / tileSize)
    const maxTileY = Math.floor(bottomRightWorld.y / tileSize)

    const out = []
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (ty < 0 || ty >= maxTile) continue
        const x = wrap(tx, maxTile)
        const y = ty
        const left = tx * tileSize - topLeftWorld.x
        const top = ty * tileSize - topLeftWorld.y
        out.push({ x, y, left, top })
      }
    }
    return out
  }, [centerWorld.x, centerWorld.y, zoom, size.w, size.h])

  const circlePx = useMemo(() => {
    const mpp = metersPerPixel(center.lat, zoom)
    const r = (Number(radiusKm) || 0) * 1000
    return r > 0 ? r / mpp : 0
  }, [center.lat, zoom, radiusKm])

  const updateCenterFromWorld = useCallback((worldX, worldY) => {
    const ll = worldPxToLatLng(worldX, worldY, zoom)
    onChange?.({ centerLat: ll.lat, centerLng: ll.lng })
  }, [onChange, zoom])

  const onMouseDown = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDrag({
      startX: e.clientX,
      startY: e.clientY,
      startCenterWorld: centerWorld,
      rect,
    })
  }, [centerWorld])

  const onMouseMove = useCallback((e) => {
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    // déplacement inverse : drag à droite => centre va à gauche
    const newWorld = { x: drag.startCenterWorld.x - dx, y: drag.startCenterWorld.y - dy }
    updateCenterFromWorld(newWorld.x, newWorld.y)
  }, [drag, updateCenterFromWorld])

  const onMouseUp = useCallback(() => setDrag(null), [])

  const onClick = useCallback((e) => {
    if (!containerRef.current) return
    // si c'était un drag, on évite de prendre ça pour un clic
    if (drag) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const worldX = centerWorld.x + (x - size.w / 2)
    const worldY = centerWorld.y + (y - size.h / 2)
    const ll = worldPxToLatLng(worldX, worldY, zoom)
    onChange?.({ centerLat: ll.lat, centerLng: ll.lng })
  }, [centerWorld.x, centerWorld.y, drag, onChange, size.w, size.h, zoom])

  const zoomIn = () => setZoom((z) => clamp(z + 1, 2, 19))
  const zoomOut = () => setZoom((z) => clamp(z - 1, 2, 19))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
          Centre : {center.lat.toFixed(5)}, {center.lng.toFixed(5)} · Zoom {zoom}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={zoomOut}>−</button>
          <button className="btn" onClick={zoomIn}>+</button>
        </div>
      </div>

      <div
        ref={containerRef}
        role="application"
        style={{
          width: size.w,
          height: size.h,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          border: '1.5px solid var(--border)',
          background: 'var(--surface2)',
          userSelect: 'none',
          cursor: drag ? 'grabbing' : 'grab',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={onClick}
      >
        {tiles.map((t) => (
          <img
            key={`${zoom}-${t.x}-${t.y}`}
            src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: t.left,
              top: t.top,
              width: 256,
              height: 256,
              imageRendering: 'auto',
            }}
          />
        ))}

        {/* Cercle rayon */}
        {circlePx > 0 && (
          <div
            style={{
              position: 'absolute',
              left: size.w / 2 - circlePx,
              top: size.h / 2 - circlePx,
              width: circlePx * 2,
              height: circlePx * 2,
              borderRadius: '50%',
              background: 'rgba(43,95,245,0.10)',
              border: '2px solid rgba(43,95,245,0.45)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Marqueur centre */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: 'var(--blue)',
            border: '2px solid white',
            boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
          }} />
          <div style={{
            width: 2,
            height: 18,
            background: 'rgba(43,95,245,0.9)',
            margin: '0 auto',
            borderRadius: 2,
          }} />
        </div>

        <div style={{
          position: 'absolute',
          left: 10,
          bottom: 10,
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '8px 10px',
          fontSize: 12,
          color: 'var(--text2)',
          fontWeight: 600,
          pointerEvents: 'none',
        }}>
          Cliquez pour placer le centre · Glissez pour déplacer
        </div>
      </div>
    </div>
  )
}

