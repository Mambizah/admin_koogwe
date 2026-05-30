import { useState, useEffect } from 'react'
import { TopBar } from '../components/UI'
import { notificationsAdminService } from '../services/api'
import { useAdminWrite } from '../hooks/useAdminWrite'

function userLabel(u) {
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ')
  return name ? `${name} · ${u.email}` : u.email
}

export default function Notifications() {
  const canWrite = useAdminWrite()
  const [mode, setMode] = useState('broadcast')
  const [form, setForm] = useState({ title: '', body: '', target: 'ALL' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [individual, setIndividual] = useState({ title: '', body: '' })

  useEffect(() => {
    if (mode !== 'individual' || search.trim().length < 2) {
      setUsers([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await notificationsAdminService.searchUsers(search.trim(), roleFilter || undefined)
        setUsers(Array.isArray(res) ? res : [])
      } catch {
        setUsers([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [search, roleFilter, mode])

  const sendBroadcast = async () => {
    if (!form.title.trim() || !form.body.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await notificationsAdminService.broadcast(form)
      setResult({ ...res, kind: 'broadcast' })
    } catch (e) {
      setResult({ error: e?.response?.data?.message || 'Échec envoi' })
    }
    setLoading(false)
  }

  const sendIndividual = async () => {
    if (!selected || !individual.title.trim() || !individual.body.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await notificationsAdminService.sendToUser({
        userId: selected.id,
        title: individual.title,
        body: individual.body,
      })
      setResult({ ...res, kind: 'individual' })
    } catch (e) {
      setResult({ error: e?.response?.data?.message || 'Échec envoi' })
    }
    setLoading(false)
  }

  return (
    <div className="fade-in">
      <TopBar title="Notifications push" />
      <div style={{ padding: '24px 28px', maxWidth: 720 }}>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Centre de notifications</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
          Push FCM vers passagers et chauffeurs — en masse ou utilisateur par utilisateur.
        </p>

        {!canWrite && (
          <div style={{ padding: 12, background: 'var(--orange-l)', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            Mode lecture seule — envoi désactivé pour votre rôle.
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            ['broadcast', 'Diffusion groupée'],
            ['individual', 'Utilisateur individuel'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => { setMode(id); setResult(null) }} style={{
              padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: mode === id ? 'var(--blue-l)' : 'var(--surface2)',
              color: mode === id ? 'var(--blue)' : 'var(--text2)',
            }}>{label}</button>
          ))}
        </div>

        {mode === 'broadcast' && (
          <div className="card" style={{ padding: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Cible</label>
            <select className="input" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} style={{ marginBottom: 16 }}>
              <option value="ALL">Tous (passagers + chauffeurs)</option>
              <option value="PASSENGER">Passagers uniquement</option>
              <option value="DRIVER">Chauffeurs uniquement</option>
            </select>

            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Titre</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Maintenance ce soir" style={{ marginBottom: 16 }} />

            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Message</label>
            <textarea className="input" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Contenu de la notification…" style={{ marginBottom: 20, resize: 'vertical' }} />

            <button className="btn btn-primary btn-full" disabled={!canWrite || loading} onClick={sendBroadcast}>
              {loading ? 'Envoi…' : 'Envoyer à tous les utilisateurs ciblés'}
            </button>
          </div>
        )}

        {mode === 'individual' && (
          <div className="card" style={{ padding: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Rechercher un utilisateur</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Email, nom ou téléphone (min. 2 car.)" style={{ flex: 1 }} />
              <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ maxWidth: 140 }}>
                <option value="">Tous</option>
                <option value="PASSENGER">Passagers</option>
                <option value="DRIVER">Chauffeurs</option>
              </select>
            </div>

            {users.length > 0 && (
              <div style={{ marginBottom: 16, maxHeight: 180, overflow: 'auto', border: '1.5px solid var(--border)', borderRadius: 10 }}>
                {users.map((u) => (
                  <button key={u.id} type="button" onClick={() => setSelected(u)} style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', cursor: 'pointer',
                    background: selected?.id === u.id ? 'var(--blue-l)' : 'transparent',
                    borderBottom: '1px solid var(--border)', fontSize: 13,
                  }}>
                    <div style={{ fontWeight: 600 }}>{userLabel(u)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {u.role === 'DRIVER' ? 'Chauffeur' : 'Passager'}
                      {u.fcmToken ? ' · Push actif' : ' · Pas de token FCM'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <div style={{ padding: 12, background: 'var(--surface2)', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
                Destinataire : <strong>{userLabel(selected)}</strong>
                {!selected.fcmToken && (
                  <div style={{ color: 'var(--orange)', marginTop: 6, fontSize: 12 }}>
                    Avertissement : cet utilisateur n'a pas de token FCM — notification en base uniquement.
                  </div>
                )}
              </div>
            )}

            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Titre</label>
            <input className="input" value={individual.title} onChange={(e) => setIndividual({ ...individual, title: e.target.value })} style={{ marginBottom: 16 }} />

            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Message</label>
            <textarea className="input" rows={4} value={individual.body} onChange={(e) => setIndividual({ ...individual, body: e.target.value })} style={{ marginBottom: 20, resize: 'vertical' }} />

            <button className="btn btn-primary btn-full" disabled={!canWrite || loading || !selected} onClick={sendIndividual}>
              {loading ? 'Envoi…' : 'Envoyer à cet utilisateur'}
            </button>
          </div>
        )}

        {result && !result.error && result.kind === 'broadcast' && (
          <div style={{ marginTop: 16, padding: 12, background: 'var(--green-l)', borderRadius: 10, fontSize: 13 }}>
            Diffusion envoyée à <strong>{result.sent}</strong> utilisateur(s) ({result.target})
          </div>
        )}
        {result && !result.error && result.kind === 'individual' && (
          <div style={{ marginTop: 16, padding: 12, background: 'var(--green-l)', borderRadius: 10, fontSize: 13 }}>
            Notification envoyée à <strong>{result.email}</strong>
            {result.pushAvailable ? ' (push FCM)' : ' (enregistrée en base, push indisponible)'}
          </div>
        )}
        {result?.error && (
          <div style={{ marginTop: 16, padding: 12, background: 'var(--red-l)', borderRadius: 10, fontSize: 13, color: 'var(--red)' }}>{result.error}</div>
        )}
      </div>
    </div>
  )
}
