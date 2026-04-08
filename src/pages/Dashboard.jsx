import { useState, useEffect, useCallback } from 'react'
<<<<<<< HEAD
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
=======
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
import { StatCard, TopBar, StatusBadge, Avatar, EmptyState } from '../components/UI'
import { dashboardService, driversService, passengersService, ridesService, financeService, documentsService } from '../services/api'
import { useRealtimeSync } from '../hooks/useRealtimeSync'
import api from '../services/api'

const TT = { background:'rgba(255,255,255,0.97)', border:'1.5px solid rgba(43,95,245,0.15)', borderRadius:10, boxShadow:'0 8px 24px rgba(43,95,245,0.12)', fontSize:12, fontFamily:'Plus Jakarta Sans,sans-serif', color:'#0D1B4B' }

function DonutChart({ data, colors }) {
  return (
    <PieChart width={120} height={120}>
      <Pie data={data} cx={55} cy={55} innerRadius={35} outerRadius={52} paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
        {data.map((_,i) => <Cell key={i} fill={colors[i]} stroke="none"/>)}
      </Pie>
    </PieChart>
  )
}

// ── Calculateur de prix ─────────────────────────────────────────────────────
function PriceEstimator() {
  const [form, setForm] = useState({
    distanceKm: 10, durationMin: 20, vehicleType: 'ECO',
    zone: 'normal', timeOfDay: 'normal', trafficLevel: 'fluide',
    weatherCondition: 'normale', demandLevel: 'normale',
  })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const estimate = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.post('/admin/estimate-price', form)
      setResult(res)
    } catch(e) {
      setError('Erreur de calcul — vérifiez la connexion au backend.')
    } finally { setLoading(false) }
  }

  const Sel = ({ label, field, opts }) => (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <label style={{fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5}}>{label}</label>
      <select
        value={form[field]}
        onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
        style={{padding:'7px 10px',borderRadius:8,border:'1.5px solid var(--border)',background:'var(--surface2)',fontSize:13,color:'var(--text)',fontFamily:'inherit',cursor:'pointer'}}
      >
        {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )

  const Num = ({ label, field, min, max, step }) => (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <label style={{fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5}}>{label}</label>
      <input type="number" min={min} max={max} step={step||1}
        value={form[field]}
        onChange={e => setForm(f => ({...f, [field]: parseFloat(e.target.value)||0}))}
        style={{padding:'7px 10px',borderRadius:8,border:'1.5px solid var(--border)',background:'var(--surface2)',fontSize:13,color:'var(--text)',fontFamily:'inherit',width:'100%'}}
      />
    </div>
  )

  return (
    <div className="card fade-up" style={{padding:22,animationDelay:'420ms'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>Simulateur de Prix</div>
          <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>Calculez une estimation de course en temps réel</div>
        </div>
        <span className="badge badge-blue">Dynamique</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
        <Num label="Distance (km)" field="distanceKm" min={0.1} max={500} step={0.5}/>
        <Num label="Durée (min)" field="durationMin" min={1} max={240}/>
        <Sel label="Type véhicule" field="vehicleType" opts={[['MOTO','Moto'],['ECO','Éco'],['CONFORT','Confort'],['VAN','Van']]}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        <Sel label="Zone" field="zone" opts={[['normal','Normal'],['centre','Centre'],['aeroport','Aéroport'],['rural','Rural']]}/>
        <Sel label="Horaire" field="timeOfDay" opts={[['normal','Normal'],['pointe','Pointe'],['nuit','Nuit'],['creuse','Creuse']]}/>
        <Sel label="Trafic" field="trafficLevel" opts={[['fluide','Fluide'],['modere','Modéré'],['dense','Dense'],['bloque','Bloqué']]}/>
        <Sel label="Météo" field="weatherCondition" opts={[['normale','Normale'],['pluie','Pluie'],['forte_pluie','Forte pluie'],['tempete','Tempête']]}/>
        <Sel label="Demande" field="demandLevel" opts={[['normale','Normale'],['forte','Forte'],['tres_forte','Très forte'],['critique','Critique']]}/>
      </div>

      <button
        className="btn btn-primary"
        onClick={estimate}
        disabled={loading}
        style={{width:'100%',justifyContent:'center',gap:8,fontSize:14,fontWeight:700,padding:'11px 0'}}
      >
        {loading ? (
          <>
            <div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}/>
            Calcul en cours...
          </>
        ) : (
          <>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            Calculer l'estimation
          </>
        )}
      </button>

      {error && <div style={{marginTop:12,padding:'10px 14px',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',borderRadius:10,fontSize:12,color:'#EF4444'}}>{error}</div>}

      {result && !error && (
        <div style={{marginTop:16,padding:'16px 18px',background:'linear-gradient(135deg,rgba(43,95,245,.06),rgba(16,185,129,.04))',borderRadius:12,border:'1.5px solid rgba(43,95,245,.15)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontSize:13,fontWeight:600,color:'var(--text2)'}}>Prix estimé</span>
            <span style={{fontSize:28,fontWeight:900,color:'var(--blue)',letterSpacing:-1}}>
              {result.estimate?.toFixed(2)} <span style={{fontSize:14,fontWeight:600,color:'var(--text3)'}}>{result.currency||'XOF'}</span>
            </span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {[
              ['Base fixe',    `${result.breakdown?.priseEnCharge?.toFixed(2)} ${result.currency||'XOF'}`],
              ['Distance',     `${result.breakdown?.prixDistance?.toFixed(2)} ${result.currency||'XOF'}`],
              ['Temps',        `${result.breakdown?.prixTemps?.toFixed(2)} ${result.currency||'XOF'}`],
              ['Base totale',  `${result.breakdown?.prixBase?.toFixed(2)} ${result.currency||'XOF'}`],
            ].map(([l,v]) => (
              <div key={l} style={{padding:'8px 10px',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div style={{fontSize:10,color:'var(--text4)',marginBottom:2,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>{l}</div>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{v}</div>
              </div>
            ))}
          </div>
          {result.breakdown?.coefficients && (
            <div style={{marginBottom:12,padding:'8px 12px',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
              <div style={{fontSize:11,fontWeight:600,color:'var(--text3)',marginBottom:6}}>Coefficients appliqués</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {Object.entries(result.breakdown.coefficients)
                  .filter(([k]) => k !== 'total')
                  .map(([k,v]) => (
                    <span key={k} style={{
                      padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:700,
                      background: v > 1 ? 'rgba(245,158,11,.12)' : 'rgba(16,185,129,.10)',
                      color: v > 1 ? '#D97706' : '#059669',
                      border: `1px solid ${v > 1 ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.2)'}`,
                    }}>{k}: ×{v}</span>
                  ))
                }
                <span style={{padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(43,95,245,.10)',color:'var(--blue)',border:'1px solid rgba(43,95,245,.2)'}}>
                  total: ×{result.breakdown.coefficients.total}
                </span>
              </div>
            </div>
          )}
          {result.split && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{padding:'10px',background:'rgba(16,185,129,.08)',borderRadius:8,border:'1px solid rgba(16,185,129,.2)',textAlign:'center'}}>
                <div style={{fontSize:10,color:'#059669',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Chauffeur</div>
                <div style={{fontSize:16,fontWeight:800,color:'#059669'}}>{result.split.chauffeur?.toFixed(2)} {result.currency}</div>
              </div>
              <div style={{padding:'10px',background:'rgba(43,95,245,.08)',borderRadius:8,border:'1px solid rgba(43,95,245,.2)',textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--blue)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Plateforme</div>
                <div style={{fontSize:16,fontWeight:800,color:'var(--blue)'}}>{result.split.plateforme?.toFixed(2)} {result.currency}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const TT = { background:'rgba(255,255,255,0.97)', border:'1.5px solid rgba(43,95,245,0.15)', borderRadius:10, boxShadow:'0 8px 24px rgba(43,95,245,0.12)', fontSize:12, fontFamily:'Plus Jakarta Sans,sans-serif', color:'#0D1B4B' }

function DonutChart({ data, colors }) {
  return (
    <PieChart width={120} height={120}>
      <Pie data={data} cx={55} cy={55} innerRadius={35} outerRadius={52} paddingAngle={3} dataKey="value" startAngle={90} endAngle={450}>
        {data.map((_,i) => <Cell key={i} fill={colors[i]} stroke="none"/>)}
      </Pie>
    </PieChart>
  )
}

export default function Dashboard() {
<<<<<<< HEAD
  const [stats,      setStats]      = useState({})
  const [docs,       setDocs]       = useState([])
  const [rides,      setRides]      = useState([])
  const [drivers,    setDrivers]    = useState([])
  const [passengers, setPassengers] = useState([])
  const [revenue,    setRevenue]    = useState({})
  const [chart,      setChart]      = useState([])
  const [activeRides,setActiveRides]= useState([])
=======
  const [stats,     setStats]     = useState({})
  const [docs,      setDocs]      = useState([])
  const [rides,     setRides]     = useState([])
  const [drivers,   setDrivers]   = useState([])
  const [passengers,setPassengers]= useState([])
  const [revenue,   setRevenue]   = useState({})
  const [chart,     setChart]     = useState([])
  const [activeRides,setActiveRides]=useState([])
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522

  const load = useCallback(async () => {
    try {
      const [s, r, d, drv, pax, rev, chartData, active] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getRecentRides(),
        dashboardService.getPendingDocs(),
        driversService.getAll(),
        passengersService.getAll(),
        financeService.getStats(),
        financeService.getChart('weekly'),
        ridesService.getActive(),
      ])
      if (s.value)   setStats(s.value)
      if (r.value && Array.isArray(r.value)) setRides(r.value)
      if (d.value && Array.isArray(d.value)) setDocs(d.value)
      if (drv.value) { const list = Array.isArray(drv.value)?drv.value:(drv.value?.items??[]); setDrivers(list) }
      if (pax.value) { const list = Array.isArray(pax.value)?pax.value:(pax.value?.items??[]); setPassengers(list) }
      if (rev.value) setRevenue(rev.value)
      if (chartData.value?.points) {
        const pts = chartData.value.points.slice(-14)
        const grouped = {}
        pts.forEach(p => {
          const d = new Date(p.at).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})
          if (!grouped[d]) grouped[d] = {date:d, revenue:0, rides:0}
          if (p.type==='PAYMENT') grouped[d].revenue += Math.abs(p.amount||0)
          grouped[d].rides++
        })
        setChart(Object.values(grouped).slice(-7))
      }
      if (active.value && Array.isArray(active.value)) setActiveRides(active.value)
    } catch {}
  }, [])

  useRealtimeSync(load, { interval: 20000, topics: ['dashboard','ride','document','panic'] })

<<<<<<< HEAD
  const pendingDocs    = docs.filter(d=>d.status==='PENDING')
  const activeDrivers  = drivers.filter(d=>d.accountStatus==='ACTIVE').length
  const inactiveDrivers= drivers.length - activeDrivers
  const totalPassengers= passengers.length
  const activePassengers= passengers.filter(p=>p.accountStatus==='ACTIVE').length
=======
  const pendingDocs   = docs.filter(d=>d.status==='PENDING')
  const activeDrivers = drivers.filter(d=>d.accountStatus==='ACTIVE').length
  const inactiveDrivers = drivers.length - activeDrivers
  const totalPassengers = passengers.length
  const activePassengers = passengers.filter(p=>p.accountStatus==='ACTIVE').length
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522

  const dailyRevenue = revenue.paymentAmount != null ? (revenue.paymentAmount/30).toFixed(0) : stats.revenue ? (stats.revenue/30).toFixed(0) : '—'
  const totalRevenue = revenue.paymentAmount != null ? revenue.paymentAmount.toLocaleString('fr-FR',{minimumFractionDigits:0}) : '—'

  const driverDonut = [
<<<<<<< HEAD
    {name:'Actifs',     value: activeDrivers||1},
    {name:'Inactifs',   value: inactiveDrivers||0},
    {name:'En attente', value: (stats.pendingDrivers||0)},
  ]
  const driverColors = ['#10B981','#B0C4E8','#F59E0B']

  // Helpers pour afficher les noms complets
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
=======
    {name:'Actifs',    value: activeDrivers||1},
    {name:'Inactifs',  value: inactiveDrivers||0},
    {name:'En attente',value: (stats.pendingDrivers||0)},
  ]
  const driverColors = ['#10B981','#B0C4E8','#F59E0B']
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522

  return (
    <div className="fade-in">
      <TopBar title="Vue d'ensemble"/>
      <div style={{padding:'24px 28px'}}>

        {/* KPI Row */}
        <div className="stagger" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          <StatCard label="Chauffeurs actifs"  value={activeDrivers||stats.activeDrivers} sub={`${drivers.length||stats.totalDrivers||0} inscrits au total`} trend="+12%" color="#2B5FF5"
            iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" delay={0}/>
          <StatCard label="Passagers inscrits" value={(totalPassengers||stats.totalPassengers||'—')} sub={`${activePassengers} actifs ce mois`} trend="+8%" color="#10B981"
            iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" delay={60}/>
          <StatCard label="Courses actives"    value={activeRides.length||stats.activeRides||0} sub={`${stats.totalRides||0} au total`} trend="+5.4%" color="#F59E0B"
            iconPath="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4" delay={120}/>
          <StatCard label="Revenu total"        value={`€${totalRevenue}`} sub={`€${dailyRevenue}/jour en moy.`} trend="+18%" color="#8B5CF6"
            iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" delay={180}/>
        </div>

        {/* Row 2: Charts */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:24}}>

          {/* Revenue chart */}
          <div className="card fade-up" style={{padding:'22px',animationDelay:'200ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>Revenus & Courses</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>7 derniers jours</div>
              </div>
              <span className="badge badge-blue">Cette semaine</span>
            </div>
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chart} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2B5FF5" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#2B5FF5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradRid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:'#7A9CC9'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:'#7A9CC9'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT} formatter={(v,n)=>[n==='revenue'?`€${v.toFixed(2)}`:v, n==='revenue'?'Revenus':'Courses']}/>
                  <Area type="monotone" dataKey="revenue" stroke="#2B5FF5" strokeWidth={2.5} fill="url(#gradRev)" dot={false}/>
                  <Area type="monotone" dataKey="rides"   stroke="#10B981" strokeWidth={2}   fill="url(#gradRid)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{height:180,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{textAlign:'center',color:'var(--text4)',fontSize:13}}>Données insuffisantes</div>
              </div>
            )}
<<<<<<< HEAD
          </div>

          {/* Drivers donut */}
          <div className="card fade-up" style={{padding:'22px',animationDelay:'260ms'}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Répartition Chauffeurs</div>
            <div style={{fontSize:12,color:'var(--text3)',marginBottom:16}}>{drivers.length||stats.totalDrivers||0} inscrits</div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <DonutChart data={driverDonut} colors={driverColors}/>
              <div style={{flex:1}}>
                {[
                  {label:'Actifs',     value:activeDrivers,          color:'#10B981'},
                  {label:'Inactifs',   value:inactiveDrivers,        color:'#B0C4E8'},
                  {label:'En attente', value:stats.pendingDrivers||0, color:'#F59E0B'},
                ].map(({label,value,color})=>(
                  <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <div style={{width:8,height:8,borderRadius:2,background:color,flexShrink:0}}/>
                      <span style={{fontSize:12,color:'var(--text2)'}}>{label}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{value}</span>
                  </div>
                ))}
=======
            {chart.length === 0 && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginTop:12}}>
                {Array.from({length:7}).map((_,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div className="skeleton" style={{width:'100%',height:Math.random()*60+20,borderRadius:6}}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drivers donut */}
          <div className="card fade-up" style={{padding:'22px',animationDelay:'260ms'}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Répartition Chauffeurs</div>
            <div style={{fontSize:12,color:'var(--text3)',marginBottom:16}}>{drivers.length||stats.totalDrivers||0} inscrits</div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <DonutChart data={driverDonut} colors={driverColors}/>
              <div style={{flex:1}}>
                {[
                  {label:'Actifs',     value:activeDrivers,           color:'#10B981'},
                  {label:'Inactifs',   value:inactiveDrivers,         color:'#B0C4E8'},
                  {label:'En attente', value:stats.pendingDrivers||0,  color:'#F59E0B'},
                ].map(({label,value,color})=>(
                  <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <div style={{width:8,height:8,borderRadius:2,background:color,flexShrink:0}}/>
                      <span style={{fontSize:12,color:'var(--text2)'}}>{label}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{value}</span>
                  </div>
                ))}
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
                <div style={{marginTop:12,padding:'8px 10px',background:'var(--blue-ll)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,color:'var(--text3)'}}>Taux d'activation</div>
                  <div style={{fontSize:16,fontWeight:800,color:'var(--blue)'}}>
                    {drivers.length ? Math.round((activeDrivers/drivers.length)*100) : 0}%
<<<<<<< HEAD
                  </div>
                </div>
              </div>
=======
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Courses actives + Documents */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>

          {/* Courses en cours */}
          <div className="card fade-up" style={{padding:22,animationDelay:'300ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>Courses en direct</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{activeRides.length} course{activeRides.length!==1?'s':''} active{activeRides.length!==1?'s':''}</div>
              </div>
              {activeRides.length > 0 && <span className="badge badge-pulse">LIVE</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {activeRides.slice(0,4).map(ride=>(
                <div key={ride.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'var(--blue-l)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="16" height="16" fill="none" stroke="#2B5FF5" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4"/></svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600}}>{ride.driver?.name||'Chauffeur'} → {ride.passenger?.name||'Passager'}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{ride.vehicleType} • {ride.originAddress?.split(',')[0]||'—'}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <StatusBadge status={ride.status}/>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--blue)',marginTop:3}}>€{(ride.price||0).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {activeRides.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text4)',padding:'24px 0',fontSize:13}}>
                  Aucune course en cours actuellement
                </div>
              )}
            </div>
          </div>

          {/* Documents en attente */}
          <div className="card fade-up" style={{padding:22,animationDelay:'360ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>Documents en attente</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{pendingDocs.length} à examiner</div>
              </div>
              {pendingDocs.length > 0 && (
                <span className="badge badge-orange">{pendingDocs.length} en attente</span>
              )}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {pendingDocs.slice(0,4).map(doc=>(
                <div key={doc.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'rgba(245,158,11,0.10)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="16" height="16" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.type?.replace(/_/g,' ')||'Document'}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>{doc.driverName||doc.uploaderName||'—'}</div>
                  </div>
                  <StatusBadge status={doc.status}/>
                </div>
              ))}
              {pendingDocs.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text4)',padding:'24px 0',fontSize:13}}>
                  Aucun document en attente
                </div>
              )}
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Row 3: Courses actives + Documents */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>

          {/* Courses en cours */}
          <div className="card fade-up" style={{padding:22,animationDelay:'300ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>Courses en direct</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{activeRides.length} course{activeRides.length!==1?'s':''} active{activeRides.length!==1?'s':''}</div>
              </div>
              {activeRides.length > 0 && <span className="badge badge-pulse">LIVE</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {activeRides.slice(0,5).map(ride=>{
                const dName = driverName(ride)
                const pName = passengerName(ride)
                return (
                  <div key={ride.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'var(--blue-l)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="16" height="16" fill="none" stroke="#2B5FF5" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4"/></svg>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        <span style={{color:'var(--blue)'}}>{dName||<em style={{color:'var(--text4)'}}>Recherche...</em>}</span>
                        <span style={{color:'var(--text3)',margin:'0 4px'}}>→</span>
                        <span>{pName}</span>
                      </div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{ride.vehicleType||'—'} • {ride.originAddress?.split(',')[0]||ride.pickupAddress||'—'}</div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <StatusBadge status={ride.status}/>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--blue)',marginTop:3}}>€{(ride.price||0).toFixed(2)}</div>
                    </div>
                  </div>
                )
              })}
              {activeRides.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text4)',padding:'24px 0',fontSize:13}}>
                  Aucune course en cours actuellement
                </div>
              )}
            </div>
          </div>

          {/* Documents en attente */}
          <div className="card fade-up" style={{padding:22,animationDelay:'360ms'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>Documents en attente</div>
                <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{pendingDocs.length} à examiner</div>
              </div>
              {pendingDocs.length > 0 && <span className="badge badge-orange">{pendingDocs.length} en attente</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {pendingDocs.slice(0,5).map(doc=>{
                const submitterName = doc.driverName || doc.uploaderName ||
                  [doc.user?.firstName, doc.user?.lastName].filter(Boolean).join(' ') || '—'
                return (
                  <div key={doc.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                    <div style={{width:36,height:36,borderRadius:10,background:'rgba(245,158,11,0.10)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="16" height="16" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.type?.replace(/_/g,' ')||'Document'}</div>
                      <div style={{fontSize:11,color:'var(--text3)'}}>{submitterName}</div>
                    </div>
                    <StatusBadge status={doc.status}/>
                  </div>
                )
              })}
              {pendingDocs.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text4)',padding:'24px 0',fontSize:13}}>
                  Aucun document en attente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Simulateur de prix */}
        <div style={{marginBottom:24}}>
          <PriceEstimator/>
        </div>

        {/* Row 5: Recent rides table */}
        <div className="card fade-up" style={{animationDelay:'460ms'}}>
=======
        {/* Row 4: Recent rides table */}
        <div className="card fade-up" style={{animationDelay:'400ms'}}>
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
          <div style={{padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1.5px solid var(--border)'}}>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>Courses récentes</div>
              <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{rides.length} courses chargées</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-ghost btn-sm">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filtrer
              </button>
              <button className="btn btn-ghost btn-sm">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Exporter
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>ID</th><th>Date</th><th>Chauffeur</th><th>Passager</th><th>Type</th><th>Statut</th><th>Montant</th></tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {rides.slice(0,10).map(r => (
                <tr key={r.id}>
                  <td style={{color:'var(--blue)',fontWeight:700,fontSize:12,fontFamily:'monospace'}}>#{r.id?.slice(-6)?.toUpperCase()}</td>
                  <td style={{color:'var(--text2)',fontSize:12}}>
                    {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : r.date||'—'}
                  </td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <Avatar name={driverName(r)||'?'} size={28}/>
                      <span style={{fontSize:13,fontWeight:500}}>
                        {driverName(r) || <span style={{color:'var(--text4)',fontStyle:'italic'}}>Recherche...</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{fontSize:13}}>{passengerName(r)}</td>
=======
              {rides.slice(0,8).map(r => (
                <tr key={r.id}>
                  <td style={{color:'var(--blue)',fontWeight:700,fontSize:12,fontFamily:'monospace'}}>#{r.id?.slice(-6)?.toUpperCase()}</td>
                  <td style={{color:'var(--text2)',fontSize:12}}>{r.requestedAt ? new Date(r.requestedAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : r.date||'—'}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <Avatar name={r.driver?.name||r.driverName||'?'} size={28}/>
                      <span style={{fontSize:13,fontWeight:500}}>{r.driver?.name||r.driverName||<span style={{color:'var(--text4)',fontStyle:'italic'}}>Recherche...</span>}</span>
                    </div>
                  </td>
                  <td style={{fontSize:13}}>{r.passenger?.name||r.passengerName||'—'}</td>
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
                  <td><span style={{fontSize:11,fontWeight:600,color:'var(--text2)',background:'var(--surface2)',padding:'2px 8px',borderRadius:20,border:'1px solid var(--border)'}}>{r.vehicleType||'MOTO'}</span></td>
                  <td><StatusBadge status={r.status}/></td>
                  <td style={{fontWeight:700,color:r.price>0?'var(--text)':'var(--text4)'}}>{r.price>0?`€${r.price.toFixed(2)}`:'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rides.length === 0 && <EmptyState message="Aucune course trouvée"/>}
        </div>

      </div>
    </div>
  )
}
