import { useState } from 'react'
import { TopBar } from '../components/UI'
import { notificationsAdminService } from '../services/api'
import { useAdminWrite } from '../hooks/useAdminWrite'

export default function Notifications() {
  const canWrite = useAdminWrite()
  const [form, setForm] = useState({ title: '', body: '', target: 'ALL' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!form.title.trim() || !form.body.trim()) return
    setLoading(true)
    try {
      const res = await notificationsAdminService.broadcast(form)
      setResult(res)
    } catch (e) {
      setResult({ error: e?.response?.data?.message || 'Échec envoi' })
    }
    setLoading(false)
  }

  return (
    <div className="fade-in">
      <TopBar title="Notifications push" />
      <div style={{ padding: '24px 28px', maxWidth: 640 }}>
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Centre de notifications</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Envoyer un message push à tous les passagers, chauffeurs ou les deux.</p>

        {!canWrite && (
          <div style={{ padding: 12, background: 'var(--orange-l)', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            Mode lecture seule — envoi désactivé pour votre rôle.
          </div>
        )}

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

          <button className="btn btn-primary btn-full" disabled={!canWrite || loading} onClick={send}>
            {loading ? 'Envoi…' : 'Envoyer la notification'}
          </button>

          {result && !result.error && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--green-l)', borderRadius: 10, fontSize: 13 }}>
              Envoyé à <strong>{result.sent}</strong> utilisateur(s) ({result.target})
            </div>
          )}
          {result?.error && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--red-l)', borderRadius: 10, fontSize: 13, color: 'var(--red)' }}>{result.error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
