import { useCallback, useEffect, useState } from 'react'
import { TopBar, Loading, EmptyState } from '../components/UI'
import { auditService } from '../services/api'

const RESOURCE_FILTERS = ['', 'driver', 'passenger', 'ride', 'document', 'dispute', 'promo', 'config']

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [resourceType, setResourceType] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await auditService.list({ limit: 200, resourceType: resourceType || undefined })
      setLogs(Array.isArray(res) ? res : [])
    } catch {
      setLogs([])
    }
    setLoading(false)
  }, [resourceType])

  useEffect(() => { load() }, [load])

  return (
    <div className="fade-in">
      <TopBar title="Journal d'activité" />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Audit log</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Historique des actions administrateur</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="input" value={resourceType} onChange={(e) => setResourceType(e.target.value)} style={{ minWidth: 160 }}>
              <option value="">Toutes ressources</option>
              {RESOURCE_FILTERS.filter(Boolean).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn btn-primary" onClick={load}>Actualiser</button>
          </div>
        </div>

        {loading ? <Loading /> : logs.length === 0 ? (
          <EmptyState title="Aucune entrée" subtitle="Les actions admin apparaîtront ici (suspendre, supprimer, approuver…)" />
        ) : (
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', textAlign: 'left' }}>
                  {['Date', 'Admin', 'Action', 'Ressource', 'ID', 'Détails'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleString('fr-FR')}</td>
                    <td style={{ padding: '12px 14px' }}>{l.adminEmail || l.admin?.email || '—'}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{l.action}</td>
                    <td style={{ padding: '12px 14px' }}><span className="badge badge-blue">{l.resourceType}</span></td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11 }}>{l.resourceId?.slice(0, 8) || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text3)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.metadata ? JSON.stringify(l.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
