import { useState, useEffect } from 'react'
import { driversService, documentsService } from '../services/api'
import { TopBar, StatusBadge, Avatar, EmptyState, SearchBar } from '../components/UI'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverDocuments, setDriverDocuments] = useState([])

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
          </div>
          <SearchBar value={filter} onChange={setFilter} placeholder="Rechercher un chauffeur..." />
        </div>


      </div>
    </div>
  )
}
