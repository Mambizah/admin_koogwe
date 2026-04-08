import { useState, useEffect } from 'react'
import { documentsService } from '../services/api'
import { TopBar, StatusBadge, EmptyState, SearchBar } from '../components/UI'
import { useRealtimeSync } from '../hooks/useRealtimeSync'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await documentsService.getAll(statusFilter)
      const list = Array.isArray(response) ? response : response?.items || []
      setDocuments(list)
    } catch (err) {
      setError('Impossible de charger les documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocuments() }, [statusFilter])
  useRealtimeSync(loadDocuments, { interval: 20000, topics: ['document','documents'], enabled: true })

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
    <div className="fade-in" style={{padding:'24px 28px'}}>
      <TopBar title="Documents" onSearch={setFilter} />
      <div className="card" style={{padding:22,marginTop:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>Validation des documents</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:4}}>{documents.length} document{documents.length>1?'s':''} trouvés</div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}