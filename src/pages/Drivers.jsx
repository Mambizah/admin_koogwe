<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { driversService, documentsService } from '../services/api'
import { TopBar, StatusBadge, Avatar, EmptyState, SearchBar } from '../components/UI'
=======
import { useState, useCallback } from 'react'
import { SearchBar, Avatar, EmptyState, StatusBadge } from '../components/UI'
import { driversService } from '../services/api'
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
import { useRealtimeSync } from '../hooks/useRealtimeSync'

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverDocuments, setDriverDocuments] = useState([])

<<<<<<< HEAD
  const loadDrivers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await driversService.getAll()
      const list = Array.isArray(response) ? response : response?.items || []
      setDrivers(list)
    } catch (err) {
      setError('Impossible de charger les chauffeurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDrivers() }, [])
  useRealtimeSync(loadDrivers, { interval: 20000, topics: ['driver','drivers'], enabled: true })

  const visibleDrivers = drivers.filter(driver => {
    const text = `${driver.firstName||driver.name||''} ${driver.lastName||''} ${driver.email||''} ${driver.phone||''}`.toLowerCase()
    return text.includes(filter.toLowerCase())
  })

  const viewDriverDetails = async (driver) => {
    setSelectedDriver(driver)
    try {
      // Load documents for this driver
      const docs = await documentsService.getAll('ALL')
      const driverDocs = Array.isArray(docs) ? docs.filter(d => d.userId === driver.id || d.driverId === driver.id) : []
      setDriverDocuments(driverDocs)
    } catch (err) {
      console.error('Erreur chargement documents:', err)
      setDriverDocuments([])
    }
  }

  const approveDriver = async (id) => {
    try {
      await driversService.approve(id)
      setDrivers(drivers => drivers.map(d => d.id === id ? {...d, accountStatus:'ACTIVE', approvalStatus:'APPROVED'} : d))
      if (selectedDriver?.id === id) setSelectedDriver({...selectedDriver, accountStatus:'ACTIVE', approvalStatus:'APPROVED'})
    } catch (err) {
      console.error('Erreur approbation:', err)
    }
  }

  const rejectDriver = async (id) => {
    const reason = prompt('Raison du rejet:')
    if (!reason) return
    try {
      await driversService.reject(id, reason)
      setDrivers(drivers => drivers.map(d => d.id === id ? {...d, accountStatus:'REJECTED', approvalStatus:'REJECTED', rejectionReason: reason} : d))
      if (selectedDriver?.id === id) setSelectedDriver({...selectedDriver, accountStatus:'REJECTED', approvalStatus:'REJECTED', rejectionReason: reason})
    } catch (err) {
      console.error('Erreur rejet:', err)
    }
  }

  const suspendDriver = async (id) => {
    try {
      await driversService.suspend(id)
      setDrivers(drivers => drivers.map(d => d.id === id ? {...d, accountStatus:'SUSPENDED'} : d))
      if (selectedDriver?.id === id) setSelectedDriver({...selectedDriver, accountStatus:'SUSPENDED'})
    } catch (err) {
      console.error('Erreur suspension:', err)
    }
  }

  const activateDriver = async (id) => {
    try {
      await driversService.activate(id)
      setDrivers(drivers => drivers.map(d => d.id === id ? {...d, accountStatus:'ACTIVE'} : d))
      if (selectedDriver?.id === id) setSelectedDriver({...selectedDriver, accountStatus:'ACTIVE'})
    } catch (err) {
      console.error('Erreur activation:', err)
    }
  }

  if (selectedDriver) {
    return (
      <div className="fade-in" style={{padding:'24px 28px'}}>
        <TopBar title={`Détails - ${selectedDriver.firstName || selectedDriver.name}`} />
        <button
          className="btn btn-ghost"
          onClick={() => setSelectedDriver(null)}
          style={{marginBottom:16,display:'flex',alignItems:'center',gap:8}}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
          Retour à la liste
        </button>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
          <div className="card" style={{padding:22}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
              <Avatar name={selectedDriver.firstName || selectedDriver.name || 'Ch'} size={64} />
              <div>
                <div style={{fontSize:18,fontWeight:700,color:'var(--text)'}}>
                  {[selectedDriver.firstName, selectedDriver.lastName].filter(Boolean).join(' ') || selectedDriver.name || '—'}
                </div>
                <div style={{fontSize:14,color:'var(--text3)',marginTop:2}}>{selectedDriver.email || '—'}</div>
                <div style={{fontSize:14,color:'var(--text3)'}}>{selectedDriver.phone || '—'}</div>
              </div>
              <div style={{marginLeft:'auto'}}>
                <StatusBadge status={selectedDriver.accountStatus || selectedDriver.status || 'PENDING'} />
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
              <div style={{padding:'16px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                <div style={{fontSize:12,color:'var(--text3)',marginBottom:4}}>Véhicule</div>
                <div style={{fontSize:14,fontWeight:600}}>{selectedDriver.vehicle?.model || selectedDriver.vehicleType || '—'}</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>{selectedDriver.vehicle?.plate || '—'}</div>
              </div>
              <div style={{padding:'16px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
                <div style={{fontSize:12,color:'var(--text3)',marginBottom:4}}>Courses</div>
                <div style={{fontSize:14,fontWeight:600}}>{selectedDriver.rideCount || 0} courses</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>Note: {selectedDriver.rating || '—'}/5</div>
              </div>
            </div>

            <div style={{padding:'16px',background:'var(--surface2)',borderRadius:10,border:'1px solid var(--border)'}}>
              <div style={{fontSize:12,color:'var(--text3)',marginBottom:8}}>Adresse</div>
              <div style={{fontSize:14}}>{selectedDriver.address || '—'}</div>
            </div>

            {selectedDriver.rejectionReason && (
              <div style={{marginTop:16,padding:'12px 14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10}}>
                <div style={{fontSize:12,color:'#EF4444',fontWeight:600}}>Raison du rejet</div>
                <div style={{fontSize:13,color:'#EF4444',marginTop:4}}>{selectedDriver.rejectionReason}</div>
              </div>
            )}
          </div>

          <div className="card" style={{padding:22}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Actions</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {selectedDriver.accountStatus === 'PENDING' && (
                <>
                  <button className="btn btn-green" onClick={() => approveDriver(selectedDriver.id)}>
                    Approuver le chauffeur
                  </button>
                  <button className="btn btn-red" onClick={() => rejectDriver(selectedDriver.id)}>
                    Rejeter le chauffeur
                  </button>
                </>
              )}
              {selectedDriver.accountStatus === 'ACTIVE' && (
                <button className="btn btn-orange" onClick={() => suspendDriver(selectedDriver.id)}>
                  Suspendre le chauffeur
                </button>
              )}
              {selectedDriver.accountStatus === 'SUSPENDED' && (
                <button className="btn btn-green" onClick={() => activateDriver(selectedDriver.id)}>
                  Réactiver le chauffeur
                </button>
              )}
            </div>

            <div style={{fontWeight:700,fontSize:15,marginTop:24,marginBottom:16}}>Documents ({driverDocuments.length})</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {driverDocuments.map(doc => (
                <div key={doc.id} style={{padding:'10px 12px',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:12,fontWeight:600}}>{doc.type?.replace(/_/g,' ')}</div>
                  <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>
                    {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <StatusBadge status={doc.status} style={{marginTop:4}} />
                </div>
              ))}
              {driverDocuments.length === 0 && (
                <div style={{textAlign:'center',color:'var(--text4)',padding:'16px',fontSize:12}}>
                  Aucun document
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{padding:'24px 28px'}}>
      <TopBar title="Chauffeurs" onSearch={setFilter} />
      <div className="card" style={{padding:22,marginTop:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Liste des chauffeurs inscrits</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:4}}>{drivers.length} chauffeur{drivers.length>1?'s':''} trouvés</div>
=======
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await driversService.getAll()
      const list = Array.isArray(res) ? res : (res?.items ?? [])
      setDrivers(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Erreur de connexion'
      const status = e?.response?.status
      if (status === 401 || status === 403) {
        setError('Session expirée. Veuillez vous reconnecter.')
      } else {
        setError(`Impossible de charger les chauffeurs : ${msg}`)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useRealtimeSync(load, { interval: 20000, topics: ['driver', 'drivers', 'account'] })

  const filtered = drivers.filter(d =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalDrivers   = drivers.length
  const activeDrivers  = drivers.filter(d => d.accountStatus === 'ACTIVE').length
  const pendingDrivers = drivers.filter(d => d.accountStatus === 'ADMIN_REVIEW_PENDING').length
  const avgRating = drivers.length
    ? (drivers.reduce((s, d) => s + (d.rating || 0), 0) / drivers.length).toFixed(1)
    : '0.0'

  const handleSuspendToggle = async (driver) => {
    setSaving(true)
    try {
      if (driver.accountStatus === 'SUSPENDED') {
        await driversService.activate(driver.id)
        updateDriver(driver.id, 'ACTIVE')
      } else {
        await driversService.suspend(driver.id)
        updateDriver(driver.id, 'SUSPENDED')
      }
    } catch (e) { alert('Erreur: ' + (e?.response?.data?.message || e.message)) }
    setSaving(false)
  }

  // ✅ FIX: approuver manuellement un chauffeur
  const handleApprove = async (driver) => {
    setSaving(true)
    try {
      await driversService.approve(driver.id)
      updateDriver(driver.id, 'ACTIVE')
      alert('✅ Chauffeur activé avec succès !')
    } catch (e) { alert('Erreur: ' + (e?.response?.data?.message || e.message)) }
    setSaving(false)
  }

  const updateDriver = (id, newStatus) => {
    setDrivers(p => p.map(d => d.id === id ? { ...d, accountStatus: newStatus } : d))
    setSelected(prev => prev?.id === id ? { ...prev, accountStatus: newStatus } : prev)
  }

  const statusDot = s => {
    if (s === 'ACTIVE')    return <span className="dot dot-green"/>
    if (s === 'SUSPENDED') return <span className="dot dot-red"/>
    return <span className="dot dot-orange"/>
  }
  const statusLabel = s =>
    s === 'ACTIVE' ? 'Actif' :
    s === 'SUSPENDED' ? 'Suspendu' :
    s === 'ADMIN_REVIEW_PENDING' ? 'En attente approbation' :
    s === 'DOCUMENTS_PENDING' ? 'Documents en attente' : (s || '—')

  return (
    <div style={{ display:'flex', height:'100vh', flexDirection:'column' }}>
      <div style={{ padding:'22px 28px 18px' }}>
        <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Gestion des Chauffeurs</h1>
        <p style={{ fontSize:13, color:'var(--text2)' }}>Gérez et suivez les chauffeurs en temps réel.</p>
      </div>

      {/* Stats */}
      <div style={{ padding:'0 28px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'TOTAL', value:totalDrivers, color:'var(--blue)' },
            { label:'ACTIFS', value:activeDrivers, color:'var(--green)' },
            { label:'EN ATTENTE', value:pendingDrivers, color:'var(--orange)' },
            { label:'NOTE MOY.', value:`${avgRating}/5`, color:'var(--purple)' },
          ].map((s,i) => (
            <div key={i} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'var(--text3)', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden', padding:'0 28px 24px', gap:16 }}>
        {/* Liste chauffeurs */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ marginBottom:16 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom ou email..."/>
          </div>
          <div className="table-wrap" style={{ overflow:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Chauffeur</th>
                  <th>Véhicule</th>
                  <th>Documents</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} onClick={() => setSelected(d)}
                    style={{ cursor:'pointer', background: selected?.id === d.id ? 'var(--blue-ll)' : '' }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={d.name} size={36}/>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13 }}>{d.name || 'Sans nom'}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text2)' }}>
                      {d.vehicleMake ? `${d.vehicleMake} ${d.vehicleModel||''} ${d.vehicleYear||''}`.trim() : '—'}
                    </td>
                    <td>
                      {d.documentsSummary && (
                        <span style={{ fontSize:11, color:'var(--text3)' }}>
                          ✅{d.documentsSummary.approved} ⏳{d.documentsSummary.pending} ❌{d.documentsSummary.rejected}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {statusDot(d.accountStatus)}
                        <span style={{ fontSize:12 }}>{statusLabel(d.accountStatus)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && (
              <div style={{textAlign:'center',padding:'40px 24px',color:'var(--text3)'}}>
                <div className="spinner" style={{margin:'0 auto 12px'}}/>
                <div style={{fontSize:13}}>Chargement des chauffeurs...</div>
              </div>
            )}
            {!loading && error && (
              <div style={{margin:16,padding:'14px 16px',background:'rgba(239,68,68,0.07)',border:'1.5px solid rgba(239,68,68,0.2)',borderRadius:10}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--red)',marginBottom:4}}>Erreur de chargement</div>
                <div style={{fontSize:12,color:'var(--text3)',marginBottom:10}}>{error}</div>
                <button className="btn btn-ghost btn-sm" onClick={load}>Réessayer</button>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && <EmptyState message="Aucun chauffeur trouvé"/>}
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
          </div>
          <SearchBar value={filter} onChange={setFilter} placeholder="Rechercher un chauffeur..." />
        </div>

<<<<<<< HEAD
        {error && <div style={{padding:'12px 14px',background:'rgba(248,113,113,0.12)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:12,color:'#B91C1C',marginBottom:16}}>{error}</div>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email / Téléphone</th>
                <th>Véhicule</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDrivers.map(driver => (
                <tr key={driver.id || driver._id || driver.email}>
                  <td style={{display:'flex',alignItems:'center',gap:10}}>
                    <Avatar name={driver.firstName || driver.name || 'Ch'} size={36} />
                    <div>
                      <div style={{fontSize:13,fontWeight:700}}>{[driver.firstName, driver.lastName].filter(Boolean).join(' ') || driver.name || '—'}</div>
                      <div style={{fontSize:12,color:'var(--text3)'}}>{driver.company || driver.vehicle?.model || 'Aucun véhicule'}</div>
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text2)'}}>
                    {driver.email || '—'}<br />{driver.phone || '—'}
                  </td>
                  <td style={{fontSize:12,color:'var(--text2)'}}>{driver.vehicle?.plate || driver.vehicleType || '—'}</td>
                  <td><StatusBadge status={driver.accountStatus || driver.status || driver.approvalStatus || 'PENDING'} /></td>
                  <td style={{fontSize:12,color:'var(--text3)'}}>{driver.createdAt ? new Date(driver.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => viewDriverDetails(driver)}
                      style={{fontSize:11}}
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
              {visibleDrivers.length === 0 && (
                <tr><td colSpan={6}><EmptyState message={loading ? 'Chargement des chauffeurs...' : 'Aucun chauffeur trouvé.'} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
=======
        {/* Panneau détail */}
        {selected && (
          <div className="card" style={{ width:340, flexShrink:0, overflow:'auto', display:'flex', flexDirection:'column' }}>
            <div style={{ textAlign:'center', padding:'18px 18px 12px' }}>
              <Avatar name={selected.name} size={70}/>
              <div style={{ fontWeight:800, fontSize:17, marginTop:10 }}>{selected.name || 'Sans nom'}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>{selected.email}</div>
              <div style={{ marginTop:8 }}><StatusBadge status={selected.accountStatus}/></div>
            </div>

            {selected.vehicleMake && (
              <div style={{ padding:'0 16px 12px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', marginBottom:8 }}>VÉHICULE</div>
                <div style={{ background:'var(--surface2)', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:13 }}>
                  <div>{selected.vehicleMake} {selected.vehicleModel} ({selected.vehicleYear})</div>
                  <div style={{ color:'var(--text3)', fontSize:12 }}>
                    Plaque: {selected.licensePlate||'—'} • {selected.vehicleColor}
                  </div>
                </div>
              </div>
            )}

            {selected.documentsSummary && (
              <div style={{ padding:'0 16px 12px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', marginBottom:8 }}>DOCUMENTS</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[
                    { label:'Approuvés', value:selected.documentsSummary.approved, color:'var(--green)' },
                    { label:'En attente', value:selected.documentsSummary.pending, color:'var(--orange)' },
                    { label:'Rejetés', value:selected.documentsSummary.rejected, color:'var(--red)' },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'var(--surface2)', padding:'8px', borderRadius:8, textAlign:'center', border:'1px solid var(--border)' }}>
                      <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ padding:'12px 16px', marginTop:'auto', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:8 }}>
              {/* ✅ Bouton approuver si le chauffeur attend validation */}
              {(selected.accountStatus === 'ADMIN_REVIEW_PENDING') && (
                <button
                  className="btn btn-success btn-full"
                  onClick={() => handleApprove(selected)}
                  disabled={saving}
                  style={{ fontSize:13 }}
                >
                  ✅ Approuver & Activer le compte
                </button>
              )}
              <button
                className="btn btn-danger btn-full"
                onClick={() => handleSuspendToggle(selected)}
                disabled={saving}
                style={{ fontSize:13 }}
              >
                {selected.accountStatus === 'SUSPENDED' ? '✅ Réactiver le compte' : '🚫 Suspendre le compte'}
              </button>
            </div>
          </div>
        )}
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
      </div>
    </div>
  )
}
