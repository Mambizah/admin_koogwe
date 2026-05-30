import { useState } from 'react'
import { authService } from '../services/api'
import logoPng from '../assets/logo.png'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState(localStorage.getItem('koogwe_admin_email') || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) { 
      setError('Veuillez remplir tous les champs.'); 
      return 
    }

    setLoading(true)
    setError('')

    try {
      const data = await authService.adminLogin(email, password)

      // Vérification du rôle
      if (data.user?.role !== 'ADMIN') {
        setError('Accès refusé. Réservé aux administrateurs.')
        setLoading(false)
        return
      }

      // === CORRECTION PRINCIPALE ===
      // On récupère le token correctement (le backend renvoie "token" ou "accessToken")
      const tokenToStore = data.token || data.accessToken || data.access_token

      if (!tokenToStore) {
        setError('Erreur serveur : aucun token reçu.')
        setLoading(false)
        return
      }

      // Stockage du token
      localStorage.setItem('koogwe_admin_token', tokenToStore)

      if (remember) {
        localStorage.setItem('koogwe_admin_email', email)
      } else {
        localStorage.removeItem('koogwe_admin_email')
      }

      // Appel du callback pour passer à l'interface admin
      onLogin({
        id: data.user.id,
        name: data.user.name || [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || 'Administrateur',
        email: data.user.email,
        role: data.user.role,
        adminRole: data.user.adminRole || 'SUPER_ADMIN',
      })

    } catch (err) {
      console.error('Login error:', err) // Pour debug

      const status = err?.response?.status
      const msg = err?.response?.data?.message || ''

      if (status === 401 || msg.toLowerCase().includes('invalides') || msg.toLowerCase().includes('mot de passe')) {
        setError('Email ou mot de passe incorrect.')
      } 
      else if (msg.includes('réservé') || msg.includes('administrateurs')) {
        setError('Accès refusé. Réservé aux administrateurs KOOGWE.')
      } 
      else {
        setError('Impossible de se connecter. Vérifiez votre connexion.')
      }
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F0F4FF 0%, #E8EEFF 50%, #EEF2FF 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Decorative elements */}
      <div style={{position:'absolute',top:-100,right:-100,width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(43,95,245,0.12) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:-150,left:-100,width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(91,139,255,0.10) 0%,transparent 70%)',pointerEvents:'none'}}/>
      
      <div className="fade-up" style={{width:'100%', maxWidth: 440, position:'relative', zIndex:1}}>
        
        {/* Logo */}
        <div style={{textAlign:'center', marginBottom: 32}}>
          <div style={{
            width:80, height:80, borderRadius:22,
            background:'#FFFFFF',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            marginBottom:18, 
            boxShadow:'0 12px 30px rgba(43,95,245,0.15)',
            border:'1px solid rgba(43,95,245,0.1)',
            animation:'floatUp 3s ease-in-out infinite',
            overflow:'hidden'
          }}>
            <img 
              src={logoPng} 
              alt="Koogwe Logo" 
              style={{ width: '75%', height: '75%', objectFit: 'contain' }} 
            />
          </div>
          <div style={{fontFamily:'Sora,sans-serif',fontSize:28,fontWeight:800,color:'#0D1B4B',letterSpacing:'-0.02em'}}>KOOGWE</div>
          <div style={{fontSize:12,color:'#7A9CC9',letterSpacing:'0.15em',textTransform:'uppercase',marginTop:6,fontWeight:600}}>
            Portail Administrateur
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(43,95,245,0.12)',
          borderRadius: 24,
          padding: '36px 36px 28px',
          boxShadow: '0 24px 80px rgba(43,95,245,0.14), 0 4px 16px rgba(43,95,245,0.08)',
        }}>
          <div style={{marginBottom:28}}>
            <h2 style={{fontSize:20,fontWeight:800,color:'#0D1B4B',marginBottom:6}}>Bienvenue</h2>
            <p style={{fontSize:13,color:'#7A9CC9'}}>Connectez-vous pour accéder au tableau de bord</p>
          </div>

          {error && (
            <div style={{
              background:'rgba(239,68,68,0.07)',
              border:'1.5px solid rgba(239,68,68,0.2)',
              borderRadius:12,
              padding:'12px 16px',
              marginBottom:22,
              display:'flex',
              alignItems:'flex-start',
              gap:10,
            }}>
              <span style={{color:'#B91C1C',fontSize:13,lineHeight:1.5}}>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>
            <div className="field">
              <label className="label">Adresse Email</label>
              <div style={{position:'relative'}}>
                <input 
                  className="input" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@koogwe.com" 
                  style={{paddingLeft:40}} 
                  required 
                  autoFocus
                />
              </div>
            </div>

            <div className="field" style={{marginBottom:16}}>
              <label className="label">Mot de passe</label>
              <div style={{position:'relative'}}>
                <input 
                  className="input" 
                  type={showPwd ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{paddingLeft:40, paddingRight:42}} 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(!showPwd)} 
                  style={{
                    position:'absolute',
                    right:12,
                    top:'50%',
                    transform:'translateY(-50%)',
                    background:'none',
                    border:'none',
                    cursor:'pointer',
                    color:'#7A9CC9'
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:24}}>
              <input 
                type="checkbox" 
                id="rem" 
                checked={remember} 
                onChange={e => setRemember(e.target.checked)} 
                style={{width:16, height:16, accentColor:'var(--blue)', cursor:'pointer'}} 
              />
              <label htmlFor="rem" style={{fontSize:13, color:'#3D5A99', cursor:'pointer', fontWeight:500}}>
                Se souvenir de moi
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full btn-lg" 
              disabled={loading}
              style={{letterSpacing:'0.01em'}}
            >
              {loading ? (
                <div className="spinner" style={{margin:'0 auto', borderTopColor:'#fff'}} />
              ) : (
                <>Se connecter</>
              )}
            </button>
          </form>

          <div style={{
            marginTop:22,
            padding:'12px 14px',
            background:'rgba(43,95,245,0.05)',
            border:'1.5px solid rgba(43,95,245,0.10)',
            borderRadius:10,
            display:'flex',
            gap:9,
            alignItems:'flex-start'
          }}>
            <span style={{fontSize:12, color:'#3D5A99', lineHeight:1.6}}>
              Accès restreint aux comptes administrateurs. Toute tentative non autorisée est enregistrée.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}