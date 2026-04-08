import { PageHeader } from '../components/UI'

export default function Settings() {
  return (
    <div className="fade-in" style={{padding:'24px 28px'}}>
      <PageHeader title="Paramètres" subtitle="Configuration, tarification et options administratives." />
      <div className="card" style={{padding:24}}>
        <p style={{fontSize:13,color:'#475569',lineHeight:1.8}}>
          Voici l’espace de configuration pour les paramètres de la plateforme. Vous pouvez y ajouter les écrans de paramétrage des tarifs, des commissions, des notifications et des règles de validation de comptes.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginTop:24}}>
          <div style={{padding:18,background:'var(--surface2)',borderRadius:14,border:'1px solid var(--border)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Tarification</div>
            <p style={{fontSize:12,color:'var(--text3)',marginTop:6}}>Ajustez les coefficients de zone, d'heure et de demande.</p>
          </div>
          <div style={{padding:18,background:'var(--surface2)',borderRadius:14,border:'1px solid var(--border)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Commission</div>
            <p style={{fontSize:12,color:'var(--text3)',marginTop:6}}>Définissez les parts plateforme / chauffeur / entreprise.</p>
          </div>
          <div style={{padding:18,background:'var(--surface2)',borderRadius:14,border:'1px solid var(--border)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Sécurité</div>
            <p style={{fontSize:12,color:'var(--text3)',marginTop:6}}>Activez la vérification documentaire et le support anti-fraude.</p>
          </div>
          <div style={{padding:18,background:'var(--surface2)',borderRadius:14,border:'1px solid var(--border)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Notifications</div>
            <p style={{fontSize:12,color:'var(--text3)',marginTop:6}}>Gérez les alertes email, push et messages administratifs.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
