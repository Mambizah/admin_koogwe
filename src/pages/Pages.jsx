import { useState, useEffect } from 'react'
import { passengersService, ridesService, financeService, panicsService } from '../services/api'
import { TopBar, StatusBadge, Avatar, EmptyState, SearchBar } from '../components/UI'
import { useRealtimeSync } from '../hooks/useRealtimeSync'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function Passengers() {
  const [passengers, setPassengers] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPassengers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await passengersService.getAll()
      const list = Array.isArray(response) ? response : response?.items || []
      setPassengers(list)
    } catch (err) {
      setError('Impossible de charger les passagers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPassengers() }, [])
  useRealtimeSync(loadPassengers, { interval: 20000, topics: ['passenger','passengers'], enabled: true })

  const visiblePassengers = passengers.filter(passenger => {
    const text = `${passenger.firstName||passenger.name||''} ${passenger.lastName||''} ${passenger.email||''} ${passenger.phone||''}`.toLowerCase()
    return text.includes(filter.toLowerCase())
  })

  return (
    <div className="fade-in" style={{padding:'24px 28px'}}>
      <TopBar title="Passagers" onSearch={setFilter} />
      <div className="card" style={{padding:22,marginTop:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Liste des passagers inscrits</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:4}}>{passengers.length} passager{passengers.length>1?'s':''} trouvés</div>
          </div>
          <SearchBar value={filter} onChange={setFilter} placeholder="Rechercher un passager..." />
        </div>

        {error && <div style={{padding:'12px 14px',background:'rgba(248,113,113,0.12)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:12,color:'#B91C1C',marginBottom:16}}>{error}</div>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email / Téléphone</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Courses</th>
              </tr>
            </thead>
            <tbody>
              {visiblePassengers.map(passenger => (
                <tr key={passenger.id || passenger._id || passenger.email}>
                  <td style={{display:'flex',alignItems:'center',gap:10}}>
                    <Avatar name={passenger.firstName || passenger.name || 'Pa'} size={36} />
                    <div>
                      <div style={{fontSize:13,fontWeight:700}}>{[passenger.firstName, passenger.lastName].filter(Boolean).join(' ') || passenger.name || '—'}</div>
                      <div style={{fontSize:12,color:'var(--text3)'}}>{passenger.company || 'Particulier'}</div>
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text2)'}}>
                    {passenger.email || '—'}<br />{passenger.phone || '—'}
                  </td>
                  <td><StatusBadge status={passenger.accountStatus || passenger.status || 'ACTIVE'} /></td>
                  <td style={{fontSize:12,color:'var(--text3)'}}>{passenger.createdAt ? new Date(passenger.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={{fontSize:12,color:'var(--text2)'}}>{passenger.rideCount || 0} courses</td>
                </tr>
              ))}
              {visiblePassengers.length === 0 && (
                <tr><td colSpan={5}><EmptyState message={loading ? 'Chargement des passagers...' : 'Aucun passager trouvé.'} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function Rides() {
  const [rides, setRides] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadRides = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await ridesService.getAll()
      const list = Array.isArray(response) ? response : response?.items || []
      setRides(list)
    } catch (err) {
      setError('Impossible de charger les courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRides() }, [])
  useRealtimeSync(loadRides, { interval: 15000, topics: ['ride','rides'], enabled: true })

  const visibleRides = rides.filter(ride => {
    const driverName = ride.driver?.firstName || ride.driver?.lastName ? [ride.driver.firstName, ride.driver.lastName].filter(Boolean).join(' ') : ride.driverName || ''
    const passengerName = ride.passenger?.firstName || ride.passenger?.lastName ? [ride.passenger.firstName, ride.passenger.lastName].filter(Boolean).join(' ') : ride.passengerName || ''
    const text = `${ride.id} ${driverName} ${passengerName} ${ride.status} ${ride.vehicleType}`.toLowerCase()
    return text.includes(filter.toLowerCase())
  })

  const driverName = (ride) => {
    if (ride.driver?.firstName || ride.driver?.lastName)
      return [ride.driver.firstName, ride.driver.lastName].filter(Boolean).join(' ')
    return ride.driver?.name || ride.driverName || null
  }
  const passengerName = (ride) => {
    if (ride.passenger?.firstName || ride.passenger?.lastName)
      return [ride.passenger.firstName, ride.passenger.lastName].filter(Boolean).join(' ')
    return ride.passenger?.name || ride.passengerName || '—'
  }

  return (
    <div className="fade-in" style={{padding:'24px 28px'}}>
      <TopBar title="Courses" onSearch={setFilter} />
      <div className="card" style={{padding:22,marginTop:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Historique des courses</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:4}}>{rides.length} course{rides.length>1?'s':''} trouvée{rides.length>1?'s':''}</div>
          </div>
          <SearchBar value={filter} onChange={setFilter} placeholder="Rechercher une course..." />
        </div>

        {error && <div style={{padding:'12px 14px',background:'rgba(248,113,113,0.12)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:12,color:'#B91C1C',marginBottom:16}}>{error}</div>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Chauffeur</th>
                <th>Passager</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              {visibleRides.map(ride => (
                <tr key={ride.id}>
                  <td style={{color:'var(--blue)',fontWeight:700,fontSize:12,fontFamily:'monospace'}}>#{ride.id?.slice(-6)?.toUpperCase()}</td>
                  <td style={{color:'var(--text2)',fontSize:12}}>
                    {ride.requestedAt ? new Date(ride.requestedAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : ride.date||'—'}
                  </td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <Avatar name={driverName(ride)||'?'} size={28}/>
                      <span style={{fontSize:13,fontWeight:500}}>
                        {driverName(ride) || <span style={{color:'var(--text4)',fontStyle:'italic'}}>Recherche...</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{fontSize:13}}>{passengerName(ride)}</td>
                  <td><span style={{fontSize:11,fontWeight:600,color:'var(--text2)',background:'var(--surface2)',padding:'2px 8px',borderRadius:20,border:'1px solid var(--border)'}}>{ride.vehicleType||'MOTO'}</span></td>
                  <td><StatusBadge status={ride.status}/></td>
                  <td style={{fontWeight:700,color:ride.price>0?'var(--text)':'var(--text4)'}}>{ride.price>0?`€${ride.price.toFixed(2)}`:'—'}</td>
                </tr>
              ))}
              {visibleRides.length === 0 && (
                <tr><td colSpan={7}><EmptyState message={loading ? 'Chargement des courses...' : 'Aucune course trouvée.'} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}export function Revenue() {
  const [stats, setStats] = useState({})
  const [chart, setChart] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, c, t] = await Promise.all([
        financeService.getStats(),
        financeService.getChart("monthly"),
        financeService.getTransactions(),
      ])
      setStats(s || {})
      if (c?.points) {
        const pts = c.points.slice(-12)
        const grouped = {}
        pts.forEach(p => {
          const d = new Date(p.at).toLocaleDateString("fr-FR",{month:"short",year:"2-digit"})
          if (!grouped[d]) grouped[d] = {date:d, revenue:0, rides:0}
          if (p.type==="PAYMENT") grouped[d].revenue += Math.abs(p.amount||0)
          grouped[d].rides++
        })
        setChart(Object.values(grouped).slice(-6))
      }
      setTransactions(Array.isArray(t) ? t : t?.items || [])
    } catch (err) {
      setError("Impossible de charger les données financières.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="fade-in" style={{padding:"24px 28px"}}>
      <TopBar title="Revenus" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
        <div className="card" style={{padding:22}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Statistiques financières</div>
          {error && <div style={{padding:"12px 14px",background:"rgba(248,113,113,0.12)",border:"1px solid rgba(239,68,68,0.18)",borderRadius:12,color:"#B91C1C",marginBottom:16}}>{error}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={{padding:"16px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:4}}>Revenus totaux</div>
              <div style={{fontSize:20,fontWeight:800,color:"var(--blue)"}}>€{(stats.paymentAmount||0).toLocaleString("fr-FR")}</div>
            </div>
            <div style={{padding:"16px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:4}}>Courses payées</div>
              <div style={{fontSize:20,fontWeight:800,color:"var(--green)"}}>{stats.totalRides||0}</div>
            </div>
            <div style={{padding:"16px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:4}}>Commission plateforme</div>
              <div style={{fontSize:20,fontWeight:800,color:"var(--purple)"}}>€{(stats.platformCommission||0).toFixed(2)}</div>
            </div>
            <div style={{padding:"16px",background:"var(--surface2)",borderRadius:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:4}}>Paiements chauffeurs</div>
              <div style={{fontSize:20,fontWeight:800,color:"var(--orange)"}}>€{(stats.driverPayments||0).toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{padding:22}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Évolution mensuelle</div>
          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chart} margin={{top:4,right:4,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2B5FF5" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#2B5FF5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize:10,fill:"#7A9CC9"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#7A9CC9"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"rgba(255,255,255,0.97)",border:"1.5px solid rgba(43,95,245,0.15)",borderRadius:10,boxShadow:"0 8px 24px rgba(43,95,245,0.12)",fontSize:12,fontFamily:"Plus Jakarta Sans,sans-serif",color:"#0D1B4B"}}
                  formatter={(v)=>[`€${v.toFixed(2)}`, "Revenus"]}/>
                <Area type="monotone" dataKey="revenue" stroke="#2B5FF5" strokeWidth={2.5} fill="url(#gradRev)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{textAlign:"center",color:"var(--text4)",fontSize:13}}>Données insuffisantes</div>
            </div>
          )}
        </div>
      </div>
      <div className="card" style={{padding:22,marginTop:16}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Transactions récentes</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Date</th><th>Type</th><th>Montant</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {transactions.slice(0,10).map(t => (
                <tr key={t.id}>
                  <td style={{color:"var(--blue)",fontWeight:700,fontSize:12,fontFamily:"monospace"}}>#{t.id?.slice(-6)?.toUpperCase()}</td>
                  <td style={{color:"var(--text2)",fontSize:12}}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—"}</td>
                  <td style={{fontSize:12,color:"var(--text2)"}}>{t.type?.replace(/_/g," ")||"—"}</td>
                  <td style={{fontWeight:700,color:t.amount>0?"var(--green)":"var(--text)"}}>{t.amount>0?`+€${t.amount.toFixed(2)}`:`€${t.amount.toFixed(2)}`}</td>
                  <td><StatusBadge status={t.status}/></td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5}><EmptyState message={loading ? "Chargement..." : "Aucune transaction trouvée."} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function Panics() {
  const [panics, setPanics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPanics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await panicsService.getAll()
      const list = Array.isArray(response) ? response : []
      setPanics(list)
    } catch (err) {
      setError("Impossible de charger les alertes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPanics() }, [])
  useRealtimeSync(loadPanics, { interval: 10000, topics: ["panic","sos","alert"], enabled: true })

  const resolvePanic = async (id) => {
    try {
      await panicsService.resolve(id)
      setPanics(p => p.map(panic => panic.id === id ? {...panic, status:"RESOLVED"} : panic))
    } catch (err) {
      console.error("Erreur lors de la résolution:", err)
    }
  }

  return (
    <div className="fade-in" style={{padding:"24px 28px"}}>
      <TopBar title="Alertes SOS" />
      <div className="card" style={{padding:22,marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>Alertes de sécurité</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{panics.filter(p=>p.status!=="RESOLVED").length} alerte{panics.filter(p=>p.status!=="RESOLVED").length>1?"s":""} active{panics.filter(p=>p.status!=="RESOLVED").length>1?"s":""}</div>
          </div>
        </div>

        {error && <div style={{padding:"12px 14px",background:"rgba(248,113,113,0.12)",border:"1px solid rgba(239,68,68,0.18)",borderRadius:12,color:"#B91C1C",marginBottom:16}}>{error}</div>}

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {panics.map(panic => (
            <div key={panic.id} style={{display:"flex",alignItems:"center",gap:16,padding:"16px 18px",background:"var(--surface2)",borderRadius:12,border:"1px solid var(--border)"}}>
              <div style={{width:48,height:48,borderRadius:12,background:"rgba(239,68,68,0.10)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="20" height="20" fill="none" stroke="#EF4444" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:4}}>{panic.type || "Alerte SOS"}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:2}}>{panic.userName || panic.user?.name || "Utilisateur inconnu"}</div>
                <div style={{fontSize:11,color:"var(--text4)"}}>{panic.createdAt ? new Date(panic.createdAt).toLocaleString("fr-FR") : "Date inconnue"}</div>
                {panic.location && <div style={{fontSize:11,color:"var(--text4)",marginTop:2}}>📍 {panic.location}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <StatusBadge status={panic.status}/>
                {panic.status !== "RESOLVED" && (
                  <button
                    className="btn btn-sm btn-green"
                    onClick={() => resolvePanic(panic.id)}
                    style={{marginTop:8,width:"100%",fontSize:11}}
                  >
                    Résoudre
                  </button>
                )}
              </div>
            </div>
          ))}
          {panics.length === 0 && (
            <div style={{textAlign:"center",color:"var(--text4)",padding:"48px 0",fontSize:13}}>
              {loading ? "Chargement des alertes..." : "Aucune alerte SOS active"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
