import { useState } from 'react'
import { authService } from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authService.adminLogin(email, password)
      if (!data) throw new Error('Aucune réponse du serveur')
      if (data.token) {
        localStorage.setItem('koogwe_admin_token', data.token)
      }
      const user = data.user || { name: data.name || 'Administrateur', email }
      localStorage.setItem('koogwe_admin_user', JSON.stringify(user))
      onLogin(user)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Échec de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24,background:'linear-gradient(180deg,#F7F9FF 0%,#EFF4FF 100%)'}}>
      <div style={{width:'100%',maxWidth:420,background:'#fff',borderRadius:24,boxShadow:'0 28px 80px rgba(43,95,245,0.14)',padding:'32px 28px'}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:28,fontWeight:800,color:'#0D1B4B',marginBottom:8}}>Connexion Admin</h1>
          <p style={{fontSize:14,color:'#7A9CC9'}}>Accédez au tableau de bord des chauffeurs, passagers, documents et courses.</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:'grid',gap:18}}>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@koogwe.com" required />

          <label className="label">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

          {error && <div style={{padding:'12px 14px',background:'rgba(248,113,113,0.12)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:12,color:'#B91C1C'}}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Connexion ...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
