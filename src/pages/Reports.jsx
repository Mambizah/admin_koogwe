import { useCallback, useEffect, useState } from 'react'
import { TopBar, Loading } from '../components/UI'
import { exportService, healthService, financeService, dashboardService } from '../services/api'
import { downloadCsv, printHtmlReport } from '../utils/export'

export default function Reports() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [health, setHealth] = useState(null)
  const [trends, setTrends] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [h, t, s] = await Promise.allSettled([
        healthService.detailed(),
        dashboardService.getTrends(),
        financeService.getStats(),
      ])
      if (h.value) setHealth(h.value)
      if (t.value) setTrends(t.value)
      if (s.value) setStats(s.value)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const exportCsv = async (type) => {
    const q = from || to ? `?from=${from || ''}&to=${to || ''}` : ''
    const paths = {
      rides: `admin/export/rides${q}`,
      revenue: `admin/export/revenue${q}`,
      drivers: exportService.drivers(),
    }
    await downloadCsv(paths[type], `koogwe-${type}-${Date.now()}.csv`)
  }

  const printPdf = () => {
    const rev = stats?.total ?? stats?.paymentAmount ?? stats?.revenue?.total ?? 0
    const html = `
      <table><tr><th>Indicateur</th><th>Valeur</th><th>Tendance mois</th></tr>
      <tr><td>Chauffeurs (nouveaux)</td><td>${trends?.drivers?.value ?? '—'}</td><td>${trends?.drivers?.trend ?? 0}%</td></tr>
      <tr><td>Passagers (nouveaux)</td><td>${trends?.passengers?.value ?? '—'}</td><td>${trends?.passengers?.trend ?? 0}%</td></tr>
      <tr><td>Courses</td><td>${trends?.rides?.value ?? '—'}</td><td>${trends?.rides?.trend ?? 0}%</td></tr>
      <tr><td>Revenus</td><td>€${Number(rev).toFixed(2)}</td><td>${trends?.revenue?.trend ?? 0}%</td></tr>
      </table>
      <p>Période export : ${from || 'début'} → ${to || 'aujourd\'hui'}</p>`
    printHtmlReport('Rapport KOOGWE', html)
  }

  return (
    <div className="fade-in">
      <TopBar title="Rapports & Système" />
      <div style={{ padding: '24px 28px' }}>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Rapports exportables</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Exports CSV, rapport PDF et monitoring API</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Période d'export</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label style={{ fontSize: 11, color: 'var(--text3)' }}>Du</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div><label style={{ fontSize: 11, color: 'var(--text3)' }}>Au</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => exportCsv('revenue')}>CSV Revenus</button>
              <button className="btn btn-primary" onClick={() => exportCsv('rides')}>CSV Courses</button>
              <button className="btn btn-primary" onClick={() => exportCsv('drivers')}>CSV Chauffeurs</button>
              <button className="btn" onClick={printPdf}>Imprimer PDF</button>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Tendances réelles (vs mois précédent)</div>
            {loading ? <Loading /> : trends ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Chauffeurs', trends.drivers],
                  ['Passagers', trends.passengers],
                  ['Courses', trends.rides],
                  ['Revenus', trends.revenue],
                ].map(([label, d]) => (
                  <div key={label} style={{ padding: 12, background: 'var(--surface2)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{d?.value ?? '—'}</div>
                    <div style={{ fontSize: 12, color: (d?.trend ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {(d?.trend ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(d?.trend ?? 0)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 13, color: 'var(--text3)' }}>Indisponible</p>}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700 }}>Monitoring santé API</div>
            <button className="btn btn-sm" onClick={load}>Actualiser</button>
          </div>
          {health ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <span className={`badge ${health.status === 'ok' ? 'badge-green' : 'badge-orange'}`}>
                  {health.status === 'ok' ? 'Opérationnel' : 'Dégradé'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{health.timestamp && new Date(health.timestamp).toLocaleString('fr-FR')}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {Object.entries(health.checks || {}).map(([name, c]) => (
                  <div key={name} style={{ padding: 12, borderRadius: 10, border: '1.5px solid var(--border)', background: c.ok ? 'var(--green-l)' : 'var(--red-l)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{name}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{c.ok ? 'OK' : 'KO'}</div>
                    {c.detail && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{c.detail}</div>}
                  </div>
                ))}
              </div>
            </>
          ) : loading ? <Loading /> : null}
        </div>
      </div>
    </div>
  )
}
