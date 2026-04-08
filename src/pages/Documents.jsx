<<<<<<< HEAD
import { useState, useEffect } from 'react'
=======
import { useState, useCallback } from 'react'
import { Check, X, Eye, RefreshCw } from 'lucide-react'
import { Modal, StatusBadge, PageHeader, SearchBar, EmptyState, Loading } from '../components/UI'
import { DOC_LABELS } from '../constants/documentTypes'
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
import { documentsService } from '../services/api'
import { TopBar, StatusBadge, EmptyState, SearchBar } from '../components/UI'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

export default function Documents() {
<<<<<<< HEAD
  const [documents, setDocuments] = useState([])
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDocuments = async () => {
=======
  const [docs,          setDocs]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState('PENDING')
  const [search,        setSearch]        = useState('')
  const [selected,      setSelected]      = useState(null)
  const [reason,        setReason]        = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
    setLoading(true)
    setError(null)
    try {
<<<<<<< HEAD
      const response = await documentsService.getAll(statusFilter)
      const list = Array.isArray(response) ? response : response?.items || []
      setDocuments(list)
    } catch (err) {
      setError('Impossible de charger les documents.')
    } finally {
      setLoading(false)
    }
  }
=======
      const data = await documentsService.getAll()
      setDocs(Array.isArray(data) ? data : [])
    } catch { setDocs([]) }
    setLoading(false)
  }, [])
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522

  useEffect(() => { loadDocuments() }, [statusFilter])
  useRealtimeSync(loadDocuments, { interval: 20000, topics: ['document','documents'], enabled: true })

<<<<<<< HEAD
  const visibleDocuments = documents.filter(doc => {
    const text = `${doc.type||''} ${doc.userName||doc.uploaderName||''} ${doc.status||''}`.toLowerCase()
    return text.includes(filter.toLowerCase())
  })

  const approveDocument = async (id) => {
    try {
      await documentsService.approve(id)
      setDocuments(docs => docs.map(doc => doc.id === id ? {...doc, status:'APPROVED'} : doc))
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err)
    }
  }

  const rejectDocument = async (id) => {
    const reason = prompt('Raison du rejet:')
    if (!reason) return
    try {
      await documentsService.reject(id, reason)
      setDocuments(docs => docs.map(doc => doc.id === id ? {...doc, status:'REJECTED', rejectionReason: reason} : doc))
    } catch (err) {
      console.error('Erreur lors du rejet:', err)
    }
=======
  // ✅ FIX: chercher sur driverName OU uploaderName
  const getDriverName = doc => doc.driverName || doc.uploaderName || doc.user?.name || 'Inconnu'
  const getFileUrl    = doc => doc.fileUrl || doc.url || null
  const formatDate    = d  => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

  const filtered = docs.filter(d => {
    const matchFilter = filter === 'ALL' || d.status === filter
    const matchSearch = !search || getDriverName(d).toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const approve = async (id) => {
    setActionLoading(true)
    try {
      await documentsService.approve(id)
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'APPROVED' } : d))
      setSelected(null)
    } catch (e) { alert('Erreur: ' + (e?.response?.data?.message || e.message)) }
    setActionLoading(false)
  }

  const reject = async (id) => {
    if (!reason.trim()) { alert('Entrez une raison de rejet'); return }
    setActionLoading(true)
    try {
      await documentsService.reject(id, reason)
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'REJECTED' } : d))
      setSelected(null)
      setReason('')
    } catch (e) { alert('Erreur: ' + (e?.response?.data?.message || e.message)) }
    setActionLoading(false)
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
  }

  const getDocumentIcon = (type) => {
    const icons = {
      'PERMIS': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'ASSURANCE': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'CARTE_VTC': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z',
      'IDENTITE': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    }
    return icons[type] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  }

  return (
<<<<<<< HEAD
    <div className="fade-in" style={{padding:'24px 28px'}}>
      <TopBar title="Documents" onSearch={setFilter} />
      <div className="card" style={{padding:22,marginTop:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Validation des documents</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:4}}>{documents.length} document{documents.length>1?'s':''} trouvés</div>
=======
    <div className="fade-in">
      <PageHeader title="Documents" subtitle={`${pendingCount} en attente de vérification`}>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14}/> Rafraîchir</button>
      </PageHeader>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un chauffeur..."/>
        <div style={{ display:'flex', gap:6 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
              {f === 'ALL' ? 'Tous' : f === 'PENDING' ? `⏳ En attente (${pendingCount})` : f === 'APPROVED' ? '✅ Approuvés' : '❌ Rejetés'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loading/> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Chauffeur</th>
                <th>Type de document</th>
                <th>Statut</th>
                <th>Date upload</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  {/* ✅ FIX: utilise getDriverName() */}
                  <td style={{ fontWeight:500 }}>{getDriverName(doc)}</td>
                  <td>
                    <span style={{ padding:'3px 10px', borderRadius:5, fontSize:11, background:'var(--surface2)', color:'var(--text2)', border:'1px solid var(--border)' }}>
                      {DOC_LABELS[doc.type] || doc.type}
                    </span>
                  </td>
                  <td><StatusBadge status={doc.status}/></td>
                  <td style={{ color:'var(--text2)', fontSize:12 }}>{formatDate(doc.uploadedAt)}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(doc); setReason('') }}>
                        <Eye size={13}/> Voir
                      </button>
                      {doc.status === 'PENDING' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => approve(doc.id)} disabled={actionLoading}>
                            <Check size={13}/>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setSelected(doc); setReason('') }} disabled={actionLoading}>
                            <X size={13}/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState message="Aucun document trouvé"/>}
        </div>
      )}

      {selected && (
        <Modal
          title={DOC_LABELS[selected.type] || selected.type}
          subtitle={`Chauffeur : ${getDriverName(selected)} • ${formatDate(selected.uploadedAt)}`}
          onClose={() => setSelected(null)}
          footer={selected.status === 'PENDING' ? (
            <>
              <button className="btn btn-success" style={{ flex:1 }} onClick={() => approve(selected.id)} disabled={actionLoading}>
                <Check size={15}/> Approuver
              </button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => reject(selected.id)} disabled={actionLoading}>
                <X size={15}/> Rejeter
              </button>
            </>
          ) : null}
        >
          {/* ✅ FIX: utilise getFileUrl() qui teste fileUrl ET url */}
          {getFileUrl(selected) ? (
            <img
              src={getFileUrl(selected)}
              alt="document"
              style={{ width:'100%', borderRadius:10, border:'1px solid var(--border)', maxHeight:300, objectFit:'contain', marginBottom:16, background:'var(--surface2)' }}
              onError={e => { e.target.replaceWith(Object.assign(document.createElement('div'), { textContent:'Aperçu non disponible', style:'height:120px;display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:13px;background:var(--surface2);border-radius:10px;margin-bottom:16px' })) }}
            />
          ) : (
            <div style={{ height:120, background:'var(--surface2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'var(--text3)', fontSize:13 }}>
              Aperçu non disponible
            </div>
          )}

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            <StatusBadge status={selected.status}/>
            <span style={{ padding:'2px 10px', borderRadius:5, fontSize:11, background:'var(--surface2)', color:'var(--text2)' }}>
              {DOC_LABELS[selected.type]}
            </span>
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
          </div>
          <div style={{display:'flex',gap:8}}>
            <SearchBar value={filter} onChange={setFilter} placeholder="Rechercher..." />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{padding:'8px 12px',borderRadius:8,border:'1.5px solid var(--border)',background:'var(--surface2)',fontSize:13,color:'var(--text)',fontFamily:'inherit',cursor:'pointer'}}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvés</option>
              <option value="REJECTED">Rejetés</option>
            </select>
          </div>
        </div>

<<<<<<< HEAD
        {error && <div style={{padding:'12px 14px',background:'rgba(248,113,113,0.12)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:12,color:'#B91C1C',marginBottom:16}}>{error}</div>}

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {visibleDocuments.map(doc => (
            <div key={doc.id} style={{display:'flex',alignItems:'center',gap:16,padding:'16px 18px',background:'var(--surface2)',borderRadius:12,border:'1px solid var(--border)'}}>
              <div style={{width:48,height:48,borderRadius:12,background:'rgba(43,95,245,0.10)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="20" height="20" fill="none" stroke="#2B5FF5" strokeWidth="2" viewBox="0 0 24 24">
                  <path d={getDocumentIcon(doc.type)}/>
                </svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:4}}>{doc.type?.replace(/_/g,' ') || 'Document'}</div>
                <div style={{fontSize:12,color:'var(--text3)',marginBottom:2}}>{doc.userName || doc.uploaderName || 'Utilisateur inconnu'}</div>
                <div style={{fontSize:11,color:'var(--text4)'}}>{doc.createdAt ? new Date(doc.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}</div>
                {doc.rejectionReason && <div style={{fontSize:11,color:'#EF4444',marginTop:2}}>❌ {doc.rejectionReason}</div>}
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <StatusBadge status={doc.status}/>
                {doc.status === 'PENDING' && (
                  <div style={{display:'flex',gap:6,marginTop:8}}>
                    <button
                      className="btn btn-sm btn-green"
                      onClick={() => approveDocument(doc.id)}
                      style={{fontSize:11}}
                    >
                      Approuver
                    </button>
                    <button
                      className="btn btn-sm btn-red"
                      onClick={() => rejectDocument(doc.id)}
                      style={{fontSize:11}}
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {visibleDocuments.length === 0 && (
            <div style={{textAlign:'center',color:'var(--text4)',padding:'48px 0',fontSize:13}}>
              {loading ? 'Chargement des documents...' : 'Aucun document trouvé.'}
=======
          {selected.rejectionReason && (
            <div style={{ padding:'10px 12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, marginBottom:12, fontSize:12, color:'var(--red)' }}>
              ❌ Raison du rejet: {selected.rejectionReason}
            </div>
          )}

          {selected.status === 'PENDING' && (
            <div className="field">
              <label className="label">Raison de rejet (si rejet)</label>
              <textarea
                className="textarea" rows={2} value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Document illisible, expiré, mauvaise qualité..."
              />
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
            </div>
          )}
        </div>
      </div>
    </div>
  )
}