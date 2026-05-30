import { useCallback, useEffect, useState } from 'react'
import { TopBar, Loading, EmptyState, StatusBadge } from '../components/UI'
import { disputesService } from '../services/api'
import { useAdminWrite } from '../hooks/useAdminWrite'

const STATUSES = ['', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'REFUNDED']

export default function Disputes() {
  const canWrite = useAdminWrite()
  const [list, setList] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [refund, setRefund] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await disputesService.list(status || undefined)
      setList(Array.isArray(res) ? res : [])
    } catch { setList([]) }
    setLoading(false)
  }, [status])

  useEffect(() => { load() }, [load])

  const update = async (id, patch) => {
    if (!canWrite) return
    await disputesService.update(id, patch)
    load()
    setSelected(null)
  }

  const scan = async () => {
    if (!canWrite) return
    const r = await disputesService.scanLowRatings()
    alert(`${r.created} litige(s) créé(s) sur ${r.scanned} avis scannés`)
    load()
  }

  return (
    <div className="fade-in">
      <TopBar title="Litiges" />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 800 }}>Gestion des litiges</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Remboursements, signalements et notes basses</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tous statuts</option>
              {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {canWrite && <button className="btn" onClick={scan}>Scanner notes ≤ 2</button>}
            <button className="btn btn-primary" onClick={load}>Actualiser</button>
          </div>
        </div>

        {loading ? <Loading /> : list.length === 0 ? (
          <EmptyState title="Aucun litige" subtitle="Les signalements et notes basses apparaîtront ici" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16 }}>
            <div className="card" style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                    {['Date', 'Statut', 'Motif', 'Course', 'Signaleur', ''].map((h) => (
                      <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 11, color: 'var(--text3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === d.id ? 'var(--blue-l)' : undefined }} onClick={() => { setSelected(d); setNotes(d.adminNotes || ''); setRefund(String(d.refundAmount ?? '')) }}>
                      <td style={{ padding: 12 }}>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: 12 }}><StatusBadge status={d.status} /></td>
                      <td style={{ padding: 12, maxWidth: 200 }}>{d.reason}</td>
                      <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 11 }}>{d.rideId?.slice(0, 8) || '—'}</td>
                      <td style={{ padding: 12 }}>{d.reporter?.email || '—'}</td>
                      <td style={{ padding: 12 }}><button className="btn btn-sm">Voir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Détail litige</div>
                <p style={{ fontSize: 13, marginBottom: 12 }}>{selected.reason}</p>
                {selected.rating != null && <p style={{ fontSize: 12, color: 'var(--text3)' }}>Note : {selected.rating}/5</p>}
                <textarea className="input" rows={3} placeholder="Notes admin" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ margin: '12px 0', width: '100%' }} disabled={!canWrite} />
                <input className="input" type="number" placeholder="Montant remboursement €" value={refund} onChange={(e) => setRefund(e.target.value)} style={{ marginBottom: 12, width: '100%' }} disabled={!canWrite} />
                {canWrite && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn" onClick={() => update(selected.id, { status: 'IN_REVIEW', adminNotes: notes })}>En revue</button>
                    <button className="btn btn-success" onClick={() => update(selected.id, { status: 'RESOLVED', adminNotes: notes })}>Résolu</button>
                    <button className="btn btn-danger" onClick={() => update(selected.id, { status: 'REFUNDED', adminNotes: notes, refundAmount: parseFloat(refund) || 0 })}>Rembourser</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
