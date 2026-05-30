import { useCallback, useEffect, useState } from 'react'
import { TopBar, Loading, EmptyState } from '../components/UI'
import { promosService } from '../services/api'
import { useAdminWrite } from '../hooks/useAdminWrite'

const empty = () => ({
  code: '', label: '', discountType: 'PERCENT', discountValue: 10,
  maxUses: '', targetRole: '', isActive: true,
})

export default function Promos() {
  const canWrite = useAdminWrite()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty())
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await promosService.list()
      setList(Array.isArray(res) ? res : [])
    } catch { setList([]) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!canWrite || !form.code) return
    await promosService.create({
      ...form,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      targetRole: form.targetRole || undefined,
    })
    setForm(empty())
    setShowForm(false)
    load()
  }

  const toggle = async (p) => {
    if (!canWrite) return
    await promosService.update(p.id, { isActive: !p.isActive })
    load()
  }

  const remove = async (id) => {
    if (!canWrite || !confirm('Supprimer ce code ?')) return
    await promosService.remove(id)
    load()
  }

  return (
    <div className="fade-in">
      <TopBar title="Codes promo" />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 800 }}>Promotions</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Codes de réduction ciblés passagers ou chauffeurs</p>
          </div>
          {canWrite && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Nouveau code'}</button>}
        </div>

        {showForm && canWrite && (
          <div className="card" style={{ padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <input className="input" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <input className="input" placeholder="Libellé" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <select className="input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="PERCENT">Pourcentage</option>
              <option value="FIXED">Montant fixe €</option>
            </select>
            <input className="input" type="number" placeholder="Valeur" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
            <input className="input" type="number" placeholder="Max utilisations" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
            <select className="input" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
              <option value="">Tous</option>
              <option value="PASSENGER">Passagers</option>
              <option value="DRIVER">Chauffeurs</option>
            </select>
            <button className="btn btn-primary" style={{ gridColumn: 'span 3' }} onClick={create}>Créer le code</button>
          </div>
        )}

        {loading ? <Loading /> : list.length === 0 ? (
          <EmptyState title="Aucun code promo" subtitle="Créez votre premier code de réduction" />
        ) : (
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                  {['Code', 'Réduction', 'Utilisations', 'Cible', 'Actif', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 11, color: 'var(--text3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontWeight: 700, fontFamily: 'monospace' }}>{p.code}</td>
                    <td style={{ padding: 12 }}>{p.discountType === 'PERCENT' ? `${p.discountValue}%` : `${p.discountValue} €`}</td>
                    <td style={{ padding: 12 }}>{p.usedCount}{p.maxUses ? ` / ${p.maxUses}` : ''}</td>
                    <td style={{ padding: 12 }}>{p.targetRole || 'Tous'}</td>
                    <td style={{ padding: 12 }}><span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>{p.isActive ? 'Oui' : 'Non'}</span></td>
                    <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                      {canWrite && <button className="btn btn-sm" onClick={() => toggle(p)}>{p.isActive ? 'Désactiver' : 'Activer'}</button>}
                      {canWrite && <button className="btn btn-sm btn-danger" onClick={() => remove(p.id)}>Suppr.</button>}
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
