import { useState, useEffect } from 'react'
import { PageHeader, TopBar } from '../components/UI'
import { adminConfigService, hotZonesService, faqService, adminsService } from '../services/api'
import { useAdminWrite } from '../hooks/useAdminWrite'
import { HotZoneMapPicker } from '../components/HotZoneMapPicker'

const TABS = [
  { id:'pricing',    label:'Tarification',  icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id:'financials', label:'Finances',       icon:'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M12 7h.01M9 7H7a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-2' },
  { id:'hotzones',   label:'Zones chaudes',  icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { id:'security',   label:'Sécurité',       icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id:'payments',   label:'Paiements',      icon:'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id:'emails',     label:'Emails',         icon:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id:'platform',   label:'Plateforme',     icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { id:'pricing-rules', label:'Horaires tarifs', icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id:'faq',        label:'FAQ / Messages', icon:'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id:'admins',     label:'Rôles admin',    icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
]

const EMAIL_KEYS = [
  'otp', 'welcome', 'ride_confirmation', 'driver_approved',
  'driver_rejected', 'payment_confirmation', 'card_registered',
]

const DEFAULT_EMAILS = {
  otp: { label:'Code de validation (OTP)', enabled:true, useEmojis:true, subjectFr:'', subjectEn:'', bodyFr:'', bodyEn:'', variables:['code','appName','supportEmail'] },
  welcome: { label:'Bienvenue', enabled:true, useEmojis:true, subjectFr:'', subjectEn:'', bodyFr:'', bodyEn:'', variables:['firstName','appName','supportEmail'] },
  ride_confirmation: { label:'Confirmation de course', enabled:true, useEmojis:true, subjectFr:'', subjectEn:'', bodyFr:'', bodyEn:'', variables:['firstName','rideId','driverName','amount','appName'] },
  driver_approved: { label:'Chauffeur approuvé', enabled:true, useEmojis:true, subjectFr:'', subjectEn:'', bodyFr:'', bodyEn:'', variables:['firstName','appName','supportEmail'] },
  driver_rejected: { label:'Chauffeur refusé', enabled:true, useEmojis:false, subjectFr:'', subjectEn:'', bodyFr:'', bodyEn:'', variables:['firstName','reason','appName','supportEmail'] },
  payment_confirmation: { label:'Confirmation paiement', enabled:true, useEmojis:true, subjectFr:'', subjectEn:'', bodyFr:'', bodyEn:'', variables:['firstName','amount','appName'] },
  card_registered: { label:'Carte enregistrée', enabled:true, useEmojis:true, subjectFr:'', subjectEn:'', bodyFr:'', bodyEn:'', variables:['firstName','brand','last4','appName','supportEmail'] },
}

function SectionTitle({ children }) {
  return <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text3)',marginBottom:16,marginTop:8,display:'flex',alignItems:'center',gap:8}}>
    <div style={{flex:1,height:1,background:'var(--border)'}}/>
    {children}
    <div style={{flex:1,height:1,background:'var(--border)'}}/>
  </div>
}

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{label}</div>
        {desc && <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{desc}</div>}
      </div>
      <button onClick={()=>onChange(!value)} style={{
        width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',
        background:value?'var(--blue)':'var(--surface3)',
        position:'relative',transition:'background 0.2s',flexShrink:0,
      }}>
        <div style={{
          position:'absolute',top:2,left:value?22:2,
          width:20,height:20,borderRadius:10,background:'#fff',
          transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.18)',
        }}/>
      </button>
    </div>
  )
}

function InputRow({ label, desc, value, onChange, type='number', unit, min, max, step }) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
        <label style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{label}</label>
        {desc && <span style={{fontSize:11,color:'var(--text3)'}}>{desc}</span>}
      </div>
      <div style={{position:'relative'}}>
        <input type={type} className="input" value={value} onChange={e=>onChange(type==='number'?Number(e.target.value):e.target.value)}
          min={min} max={max} step={step} style={{paddingRight:unit?42:14}}/>
        {unit && <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:12,color:'var(--text3)',fontWeight:600}}>{unit}</span>}
      </div>
    </div>
  )
}

export default function Settings() {
  const canWrite = useAdminWrite()
  const [tab, setTab] = useState('pricing')
  const [saved, setSaved] = useState(false)

  const [pricing, setPricing] = useState({
    baseFare:4.0, pricePerKmMoto:1.0, pricePerKmEco:1.2, pricePerKmConfort:1.5,
    pricePerMinute:0.30, minimumFare:7.0, maxSurge:3.0, pickupFee:2.0,
    city:'Cayenne', currency:'EUR',
  })
  const [financials, setFinancials] = useState({
    driverShare:80, platformShare:20,
    autoTransfer:true, escrowEnabled:true,
    minWithdrawal:20, withdrawalFee:0,
  })
  const [security, setSecurity] = useState({
    jwtTtlMinutes:60, refreshTtlDays:30,
    geofencingEnabled:true, sosEnabled:true,
    anomalyDetection:true, auditLogs:true,
    twoFactor:false, ipWhitelist:false,
  })
  const [payments, setPayments] = useState({
    stripeEnabled:true, cashEnabled:true,
    walletEnabled:true, paypalEnabled:false,
    mobileMoneyEnabled:false,
  })
  const [platform, setPlatform] = useState({
    appName:'KOOGWE', supportEmail:'support@koogwe.com',
    maintenanceMode:false, registrationOpen:true,
    driverAutoApproval:false, maxDriversOnline:500,
    driverSearchRadiusKm:30,
    minPassengerAppVersion:'2.2.0', minDriverAppVersion:'2.2.0',
    latestPassengerAppVersion:'2.2.0', latestDriverAppVersion:'2.2.0',
    forceUpdate:false, inAppMessage:'',
  })
  const [pricingRules, setPricingRules] = useState({
    nightStartHour: 22, nightEndHour: 6, nightMultiplier: 1.4,
    weekendMultiplier: 1.15,
    peakHours: [{ start: 7, end: 9, multiplier: 1.3 }, { start: 17, end: 20, multiplier: 1.3 }],
  })
  const [faqList, setFaqList] = useState([])
  const [faqForm, setFaqForm] = useState({ questionFr: '', answerFr: '', category: 'general' })
  const [adminUsers, setAdminUsers] = useState([])

  const [hotZones, setHotZones] = useState([])
  const [emailTemplates, setEmailTemplates] = useState(DEFAULT_EMAILS)
  const [emailKey, setEmailKey] = useState('otp')
  const [emailPreview, setEmailPreview] = useState(null)
  const [testEmailTo, setTestEmailTo] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [newZone, setNewZone] = useState({
    name:'Zone test', centerLat:4.93, centerLng:-52.33, radiusKm:2, surgeMultiplier:1.3,
  })

  const save = async () => {
    try {
      await Promise.allSettled([
        adminConfigService.updatePricing({
          baseFare: pricing.baseFare,
          pickupFee: pricing.pickupFee,
          pricePerKm: {
            MOTO: pricing.pricePerKmMoto,
            ECO: pricing.pricePerKmEco,
            CONFORT: pricing.pricePerKmConfort,
          },
          pricePerMinute: pricing.pricePerMinute,
          minimumFare: pricing.minimumFare,
          surgeMultiplier: pricing.maxSurge,
          currency: pricing.currency,
        }),
        adminConfigService.updateFinancials({
          driverShare: financials.driverShare,
          platformCommission: financials.platformShare,
          minWithdrawal: financials.minWithdrawal,
          withdrawalFee: financials.withdrawalFee,
          autoTransfer: financials.autoTransfer,
          escrowEnabled: financials.escrowEnabled,
        }),
        adminConfigService.updateSecurity(security),
        adminConfigService.updatePayments(payments),
        adminConfigService.updatePlatform(platform),
        adminConfigService.updateEmails(emailTemplates),
        adminConfigService.updatePricingRules(pricingRules),
      ])
      setSaved(true)
    } catch {
      setSaved(false)
      return
    }
    setTimeout(() => setSaved(false), 3000)
  }

  // Load config from API on mount
  useEffect(() => {
    (async () => {
      try {
        const [p, f, pay, sec, plat, zones, emails, rules, faq, admins] = await Promise.allSettled([
          adminConfigService.getPricing(),
          adminConfigService.getFinancials(),
          adminConfigService.getPayments(),
          adminConfigService.getSecurity(),
          adminConfigService.getPlatform(),
          hotZonesService.list(),
          adminConfigService.getEmails(),
          adminConfigService.getPricingRules(),
          faqService.list(),
          adminsService.list(),
        ])
        if (p.value) {
          setPricing(prev => ({
            ...prev,
            baseFare: p.value.baseFare ?? prev.baseFare,
            pricePerKmMoto: p.value.pricePerKm?.MOTO ?? prev.pricePerKmMoto,
            pricePerKmEco: p.value.pricePerKm?.ECO ?? prev.pricePerKmEco,
            pricePerKmConfort: p.value.pricePerKm?.CONFORT ?? prev.pricePerKmConfort,
            pricePerMinute: p.value.pricePerMinute ?? prev.pricePerMinute,
            minimumFare: p.value.minimumFare ?? prev.minimumFare,
            maxSurge: p.value.surgeMultiplier ?? prev.maxSurge,
            pickupFee: p.value.pickupFee ?? prev.pickupFee,
            currency: p.value.currency ?? prev.currency,
          }))
        }
        if (f.value) {
          setFinancials(prev => ({
            ...prev,
            driverShare: f.value.driverShare ?? prev.driverShare,
            platformShare: f.value.platformCommission ?? prev.platformShare,
            minWithdrawal: f.value.minWithdrawal ?? prev.minWithdrawal,
            withdrawalFee: f.value.withdrawalFee ?? prev.withdrawalFee,
            autoTransfer: f.value.autoTransfer ?? prev.autoTransfer,
            escrowEnabled: f.value.escrowEnabled ?? prev.escrowEnabled,
          }))
        }
        if (pay.value) setPayments(prev => ({ ...prev, ...pay.value }))
        if (sec.value) setSecurity(prev => ({ ...prev, ...sec.value }))
        if (plat.value) setPlatform(prev => ({ ...prev, ...plat.value }))
        if (zones.value) setHotZones(Array.isArray(zones.value) ? zones.value : [])
        if (emails.value) {
          setEmailTemplates(prev => {
            const next = { ...prev }
            for (const k of EMAIL_KEYS) {
              if (emails.value[k]) next[k] = { ...prev[k], ...emails.value[k] }
            }
            return next
          })
        }
        if (rules.value) setPricingRules(prev => ({ ...prev, ...rules.value }))
        if (faq.value) setFaqList(Array.isArray(faq.value) ? faq.value : [])
        if (admins.value) setAdminUsers(Array.isArray(admins.value) ? admins.value : [])
      } catch {}
    })()
  }, [])

  const currentEmail = emailTemplates[emailKey] ?? DEFAULT_EMAILS[emailKey]

  const patchEmail = (patch) => {
    setEmailTemplates(prev => ({
      ...prev,
      [emailKey]: { ...prev[emailKey], ...patch },
    }))
    setEmailPreview(null)
  }

  const loadPreview = async (lang = 'fr') => {
    try {
      const tpl = emailTemplates[emailKey]
      const res = await adminConfigService.previewEmail({
        key: emailKey,
        language: lang,
        patch: {
          subjectFr: tpl.subjectFr,
          subjectEn: tpl.subjectEn,
          bodyFr: tpl.bodyFr,
          bodyEn: tpl.bodyEn,
          useEmojis: tpl.useEmojis,
        },
      })
      setEmailPreview(res)
    } catch {
      setEmailMsg('Erreur aperçu')
    }
  }

  const sendTest = async () => {
    if (!testEmailTo) return
    try {
      await adminConfigService.testEmail({ key: emailKey, to: testEmailTo, language: 'fr' })
      setEmailMsg(`Test envoyé à ${testEmailTo}`)
      setTimeout(() => setEmailMsg(''), 4000)
    } catch {
      setEmailMsg('Échec envoi test')
    }
  }

  const Icon = ({path}) => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg>
  )

  return (
    <div className="fade-in">
      <TopBar title="Paramètres"/>
      <div style={{padding:'24px 28px'}}>
        <PageHeader title="Configuration de la plateforme" subtitle="Gérez tous les paramètres système de KOOGWE">
          <button className="btn btn-primary" onClick={save}>
            {saved
              ? <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Sauvegardé</>
              : <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Sauvegarder</>
            }
          </button>
        </PageHeader>

        <div style={{display:'flex',gap:20}}>
          {/* Tab sidebar */}
          <div style={{width:200,flexShrink:0}}>
            <div className="card" style={{padding:8}}>
              {TABS.map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',
                  borderRadius:9,border:'none',cursor:'pointer',textAlign:'left',transition:'all 0.15s',
                  fontSize:13,fontWeight:tab===t.id?600:500,
                  background:tab===t.id?'var(--blue-l)':'transparent',
                  color:tab===t.id?'var(--blue)':'var(--text2)',
                  marginBottom:2,
                }}>
                  <span style={{color:tab===t.id?'var(--blue)':'var(--text3)',display:'flex'}}>
                    <Icon path={t.icon}/>
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{flex:1}}>
            <div className="card" style={{padding:28}}>

              {tab==='pricing' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Tarification</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Configurez les tarifs de base et les coefficients de majoration.</p>
                  <SectionTitle>Tarifs de base</SectionTitle>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                    <InputRow label="Prise en charge" value={pricing.baseFare} onChange={v=>setPricing({...pricing,baseFare:v})} unit="€" step={0.5} min={0}/>
                    <InputRow label="Frais de déplacement" value={pricing.pickupFee} onChange={v=>setPricing({...pricing,pickupFee:v})} unit="€" step={0.5} min={0}/>
                    <InputRow label="Prix min. course" value={pricing.minimumFare} onChange={v=>setPricing({...pricing,minimumFare:v})} unit="€" step={0.5} min={0}/>
                    <InputRow label="Prix par minute" value={pricing.pricePerMinute} onChange={v=>setPricing({...pricing,pricePerMinute:v})} unit="€/min" step={0.05} min={0}/>
                  </div>
                  <SectionTitle>Tarifs par type de véhicule</SectionTitle>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
                    <InputRow label="MOTO (Standard)" value={pricing.pricePerKmMoto} onChange={v=>setPricing({...pricing,pricePerKmMoto:v})} unit="€/km" step={0.1} min={0}/>
                    <InputRow label="ECO" value={pricing.pricePerKmEco} onChange={v=>setPricing({...pricing,pricePerKmEco:v})} unit="€/km" step={0.1} min={0}/>
                    <InputRow label="CONFORT" value={pricing.pricePerKmConfort} onChange={v=>setPricing({...pricing,pricePerKmConfort:v})} unit="€/km" step={0.1} min={0}/>
                  </div>
                  <SectionTitle>Majoration</SectionTitle>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                    <InputRow label="Majoration maximale" value={pricing.maxSurge} onChange={v=>setPricing({...pricing,maxSurge:v})} unit="×" step={0.5} min={1} max={10}/>
                    <InputRow label="Devise" value={pricing.currency} onChange={v=>setPricing({...pricing,currency:v})} type="text"/>
                  </div>
                </div>
              )}

              {tab==='financials' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Paramètres Financiers</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Répartition des revenus entre chauffeurs et plateforme.</p>
                  <div style={{padding:20,background:'var(--blue-ll)',borderRadius:14,border:'1.5px solid var(--border2)',marginBottom:24}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Répartition des revenus</div>
                    <div style={{display:'flex',gap:16,marginBottom:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,color:'var(--text3)',fontWeight:600,marginBottom:4}}>Chauffeur</div>
                        <div style={{fontSize:28,fontWeight:800,color:'var(--blue)'}}>{financials.driverShare}%</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,color:'var(--text3)',fontWeight:600,marginBottom:4}}>Plateforme</div>
                        <div style={{fontSize:28,fontWeight:800,color:'var(--purple)'}}>{financials.platformShare}%</div>
                      </div>
                    </div>
                    <div style={{height:8,borderRadius:4,overflow:'hidden',background:'var(--surface3)'}}>
                      <div style={{height:'100%',width:`${financials.driverShare}%`,background:'linear-gradient(90deg,#2B5FF5,#10B981)',borderRadius:4,transition:'width 0.4s'}}/>
                    </div>
                    <input type="range" min={50} max={95} value={financials.driverShare}
                      onChange={e=>setFinancials({...financials,driverShare:Number(e.target.value),platformShare:100-Number(e.target.value)})}
                      style={{width:'100%',marginTop:10,accentColor:'var(--blue)'}}/>
                  </div>
                  <SectionTitle>Retraits</SectionTitle>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                    <InputRow label="Retrait minimum" value={financials.minWithdrawal} onChange={v=>setFinancials({...financials,minWithdrawal:v})} unit="€" min={0}/>
                    <InputRow label="Frais de retrait" value={financials.withdrawalFee} onChange={v=>setFinancials({...financials,withdrawalFee:v})} unit="%" min={0} max={20} step={0.5}/>
                  </div>
                  <SectionTitle>Options</SectionTitle>
                  <ToggleRow label="Transfert automatique" desc="Crédit automatique après course terminée" value={financials.autoTransfer} onChange={v=>setFinancials({...financials,autoTransfer:v})}/>
                  <ToggleRow label="Séquestre activé" desc="Fonds retenus jusqu'à validation" value={financials.escrowEnabled} onChange={v=>setFinancials({...financials,escrowEnabled:v})}/>
                </div>
              )}

              {tab==='security' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Sécurité</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Paramètres d'authentification et de sécurité.</p>
                  <SectionTitle>Authentification</SectionTitle>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:8}}>
                    <InputRow label="Durée session JWT" value={security.jwtTtlMinutes} onChange={v=>setSecurity({...security,jwtTtlMinutes:v})} unit="min" min={15} max={1440}/>
                    <InputRow label="Refresh token" value={security.refreshTtlDays} onChange={v=>setSecurity({...security,refreshTtlDays:v})} unit="jours" min={1} max={90}/>
                  </div>
                  <ToggleRow label="Authentification à deux facteurs" desc="2FA pour les admins" value={security.twoFactor} onChange={v=>setSecurity({...security,twoFactor:v})}/>
                  <ToggleRow label="Whitelist IP" desc="Restreindre l'accès admin par IP" value={security.ipWhitelist} onChange={v=>setSecurity({...security,ipWhitelist:v})}/>
                  <SectionTitle>Surveillance</SectionTitle>
                  <ToggleRow label="Géofencing" desc="Restriction géographique des courses" value={security.geofencingEnabled} onChange={v=>setSecurity({...security,geofencingEnabled:v})}/>
                  <ToggleRow label="Bouton SOS" desc="Alerte panique pour passagers et chauffeurs" value={security.sosEnabled} onChange={v=>setSecurity({...security,sosEnabled:v})}/>
                  <ToggleRow label="Détection d'anomalies" desc="IA de détection de comportements suspects" value={security.anomalyDetection} onChange={v=>setSecurity({...security,anomalyDetection:v})}/>
                  <ToggleRow label="Journaux d'audit" desc="Enregistrement de toutes les actions admin" value={security.auditLogs} onChange={v=>setSecurity({...security,auditLogs:v})}/>
                </div>
              )}

              {tab==='payments' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Méthodes de paiement</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Activez ou désactivez les méthodes de paiement disponibles.</p>
                  {[
                    {key:'stripeEnabled',       label:'Stripe',        desc:'Paiements par carte bancaire',     color:'#635BFF'},
                    {key:'cashEnabled',          label:'Espèces',       desc:'Paiement en cash au chauffeur',   color:'#10B981'},
                    {key:'walletEnabled',        label:'Portefeuille',  desc:'Wallet intégré KOOGWE',           color:'#2B5FF5'},
                    {key:'paypalEnabled',        label:'PayPal',        desc:'Paiements PayPal',                color:'#009CDE'},
                    {key:'mobileMoneyEnabled',   label:'Mobile Money',  desc:'Orange Money, MTN, etc.',        color:'#F59E0B'},
                  ].map(({key,label,desc,color}) => (
                    <div key={key} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:'1.5px solid var(--border)',marginBottom:10,background:'var(--surface2)'}}>
                      <div style={{width:40,height:40,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <svg width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{label}</div>
                        <div style={{fontSize:12,color:'var(--text3)'}}>{desc}</div>
                      </div>
                      <button onClick={()=>setPayments({...payments,[key]:!payments[key]})} style={{
                        width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',
                        background:payments[key]?color:'var(--surface3)',position:'relative',transition:'background 0.2s',
                      }}>
                        <div style={{position:'absolute',top:2,left:payments[key]?22:2,width:20,height:20,borderRadius:10,background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.18)'}}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {tab==='hotzones' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Zones chaudes</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Majoration automatique des courses dans ces zones (style Uber).</p>
                  <SectionTitle>Nouvelle zone</SectionTitle>
                  <div style={{marginBottom:16}}>
                    <HotZoneMapPicker
                      value={newZone}
                      radiusKm={newZone.radiusKm}
                      onChange={(next)=>setNewZone(prev=>({...prev,...next}))}
                    />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                    <InputRow label="Nom" value={newZone.name} onChange={v=>setNewZone({...newZone,name:v})} type="text"/>
                    <InputRow label="Rayon" value={newZone.radiusKm} onChange={v=>setNewZone({...newZone,radiusKm:v})} unit="km" min={0.5} step={0.5}/>
                    <InputRow label="Latitude centre" value={newZone.centerLat} onChange={v=>setNewZone({...newZone,centerLat:v})} step={0.0001}/>
                    <InputRow label="Longitude centre" value={newZone.centerLng} onChange={v=>setNewZone({...newZone,centerLng:v})} step={0.0001}/>
                    <InputRow label="Majoration" value={newZone.surgeMultiplier} onChange={v=>setNewZone({...newZone,surgeMultiplier:v})} unit="×" min={1} max={5} step={0.1}/>
                  </div>
                  <button className="btn btn-primary" style={{marginBottom:24}} onClick={async()=>{
                    const z = await hotZonesService.create(newZone)
                    setHotZones(prev=>[z,...prev])
                  }}>Ajouter la zone</button>
                  <SectionTitle>Zones actives</SectionTitle>
                  {hotZones.length===0 && <p style={{fontSize:13,color:'var(--text3)'}}>Aucune zone configurée.</p>}
                  {hotZones.map(z=>(
                    <div key={z.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,border:'1px solid var(--border)',borderRadius:10,marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{z.name}</div>
                        <div style={{fontSize:12,color:'var(--text3)'}}>{z.radiusKm} km · ×{z.surgeMultiplier} · {z.centerLat?.toFixed(4)}, {z.centerLng?.toFixed(4)}</div>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" onClick={()=>setNewZone({
                          name: z.name ?? 'Zone',
                          centerLat: Number(z.centerLat ?? 4.93),
                          centerLng: Number(z.centerLng ?? -52.33),
                          radiusKm: Number(z.radiusKm ?? 2),
                          surgeMultiplier: Number(z.surgeMultiplier ?? 1.3),
                        })}>Éditer</button>
                        <button className="btn" onClick={async()=>{
                          await hotZonesService.remove(z.id)
                          setHotZones(prev=>prev.filter(x=>x.id!==z.id))
                        }}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab==='emails' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Modèles d'emails</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>
                    Personnalisez les emails envoyés aux passagers et chauffeurs. Utilisez les variables entre doubles accolades, ex. {'{{firstName}}'}.
                  </p>
                  <div style={{display:'flex',gap:20}}>
                    <div style={{width:220,flexShrink:0}}>
                      {EMAIL_KEYS.map(k => (
                        <button key={k} onClick={()=>{ setEmailKey(k); setEmailPreview(null) }} style={{
                          display:'block',width:'100%',textAlign:'left',padding:'10px 12px',marginBottom:6,
                          borderRadius:9,border:'1.5px solid var(--border)',cursor:'pointer',fontSize:12,fontWeight:emailKey===k?700:500,
                          background:emailKey===k?'var(--blue-l)':'var(--surface2)',
                          color:emailKey===k?'var(--blue)':'var(--text2)',
                        }}>
                          {emailTemplates[k]?.label || k}
                          {!emailTemplates[k]?.enabled && <span style={{marginLeft:6,color:'var(--text4)'}}>(off)</span>}
                        </button>
                      ))}
                    </div>
                    <div style={{flex:1}}>
                      <SectionTitle>{currentEmail.label}</SectionTitle>
                      <ToggleRow label="Email activé" desc="Désactiver pour ne plus envoyer ce type d'email" value={currentEmail.enabled} onChange={v=>patchEmail({enabled:v})}/>
                      <ToggleRow label="Utiliser des emojis" desc="Désactivé = texte sobre sans emoji" value={currentEmail.useEmojis} onChange={v=>patchEmail({useEmojis:v})}/>
                      <SectionTitle>Sujet</SectionTitle>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:'var(--text3)',marginBottom:4}}>Français</div>
                          <input className="input" value={currentEmail.subjectFr} onChange={e=>patchEmail({subjectFr:e.target.value})}/>
                        </div>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:'var(--text3)',marginBottom:4}}>English</div>
                          <input className="input" value={currentEmail.subjectEn} onChange={e=>patchEmail({subjectEn:e.target.value})}/>
                        </div>
                      </div>
                      <SectionTitle>Corps HTML</SectionTitle>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:'var(--text3)',marginBottom:4}}>Français</div>
                          <textarea className="input" rows={10} value={currentEmail.bodyFr} onChange={e=>patchEmail({bodyFr:e.target.value})}
                            style={{fontFamily:'monospace',fontSize:12,lineHeight:1.5,resize:'vertical'}}/>
                        </div>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:'var(--text3)',marginBottom:4}}>English</div>
                          <textarea className="input" rows={10} value={currentEmail.bodyEn} onChange={e=>patchEmail({bodyEn:e.target.value})}
                            style={{fontFamily:'monospace',fontSize:12,lineHeight:1.5,resize:'vertical'}}/>
                        </div>
                      </div>
                      <div style={{padding:12,background:'var(--surface2)',borderRadius:10,marginBottom:16,fontSize:12,color:'var(--text3)'}}>
                        <strong style={{color:'var(--text2)'}}>Variables disponibles :</strong>{' '}
                        {(currentEmail.variables || []).map(v => (
                          <code key={v} style={{marginRight:8,background:'var(--surface3)',padding:'2px 6px',borderRadius:4}}>{'{{'+v+'}}'}</code>
                        ))}
                      </div>
                      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
                        <button className="btn btn-primary" onClick={()=>loadPreview('fr')}>Aperçu FR</button>
                        <button className="btn" onClick={()=>loadPreview('en')}>Aperçu EN</button>
                        <input className="input" placeholder="email@test.com" value={testEmailTo} onChange={e=>setTestEmailTo(e.target.value)} style={{maxWidth:220}}/>
                        <button className="btn" onClick={sendTest}>Envoyer test</button>
                        {emailMsg && <span style={{fontSize:12,color:'var(--green)'}}>{emailMsg}</span>}
                      </div>
                      {emailPreview && (
                        <div style={{border:'1.5px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
                          <div style={{padding:'10px 14px',background:'var(--surface2)',fontSize:12,fontWeight:600,borderBottom:'1px solid var(--border)'}}>
                            Sujet : {emailPreview.subject}
                          </div>
                          <iframe title="preview" srcDoc={emailPreview.html} style={{width:'100%',height:360,border:'none',background:'#fff'}}/>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab==='platform' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Paramètres plateforme</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Configuration générale de l'application.</p>
                  <SectionTitle>Chauffeurs & dispatch</SectionTitle>
                  <InputRow label="Rayon réception courses" desc="Chauffeurs à cette distance reçoivent la demande" value={platform.driverSearchRadiusKm} onChange={v=>setPlatform({...platform,driverSearchRadiusKm:v})} unit="km" min={1} max={100} step={1}/>
                  <SectionTitle>Informations</SectionTitle>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                    <InputRow label="Nom de l'application" value={platform.appName} onChange={v=>setPlatform({...platform,appName:v})} type="text"/>
                    <InputRow label="Email support" value={platform.supportEmail} onChange={v=>setPlatform({...platform,supportEmail:v})} type="text"/>
                    <InputRow label="Max chauffeurs en ligne" value={platform.maxDriversOnline} onChange={v=>setPlatform({...platform,maxDriversOnline:v})} min={10}/>
                  </div>
                  <SectionTitle>Contrôles</SectionTitle>
                  <ToggleRow label="Mode maintenance" desc="Suspend l'accès à l'application" value={platform.maintenanceMode} onChange={v=>setPlatform({...platform,maintenanceMode:v})}/>
                  <ToggleRow label="Inscriptions ouvertes" desc="Autoriser les nouvelles inscriptions" value={platform.registrationOpen} onChange={v=>setPlatform({...platform,registrationOpen:v})}/>
                  <ToggleRow label="Approbation automatique chauffeurs" desc="Active les comptes sans vérification admin" value={platform.driverAutoApproval} onChange={v=>setPlatform({...platform,driverAutoApproval:v})}/>
                  <SectionTitle>Versions apps mobile</SectionTitle>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                    <InputRow label="Min. passager" value={platform.minPassengerAppVersion} onChange={v=>setPlatform({...platform,minPassengerAppVersion:v})} type="text"/>
                    <InputRow label="Min. chauffeur" value={platform.minDriverAppVersion} onChange={v=>setPlatform({...platform,minDriverAppVersion:v})} type="text"/>
                    <InputRow label="Dernière passager" value={platform.latestPassengerAppVersion} onChange={v=>setPlatform({...platform,latestPassengerAppVersion:v})} type="text"/>
                    <InputRow label="Dernière chauffeur" value={platform.latestDriverAppVersion} onChange={v=>setPlatform({...platform,latestDriverAppVersion:v})} type="text"/>
                  </div>
                  <ToggleRow label="Forcer mise à jour" desc="Bloque les apps sous la version minimale" value={platform.forceUpdate} onChange={v=>setPlatform({...platform,forceUpdate:v})}/>
                  <SectionTitle>Message in-app</SectionTitle>
                  <textarea className="input" rows={3} value={platform.inAppMessage || ''} onChange={e=>setPlatform({...platform,inAppMessage:e.target.value})} placeholder="Annonce visible dans l'app sans rebuild…"/>
                  {platform.maintenanceMode && (
                    <div style={{marginTop:16,padding:'12px 16px',background:'rgba(239,68,68,0.07)',border:'1.5px solid rgba(239,68,68,0.2)',borderRadius:10}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--red)'}}>Mode maintenance actif</div>
                      <div style={{fontSize:12,color:'var(--text3)',marginTop:3}}>L'application est inaccessible aux utilisateurs.</div>
                    </div>
                  )}
                </div>
              )}

              {tab==='pricing-rules' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Horaires & tarifs dynamiques</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Majorations nuit, week-end et heures de pointe.</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
                    <InputRow label="Début nuit (h)" value={pricingRules.nightStartHour} onChange={v=>setPricingRules({...pricingRules,nightStartHour:v})} min={0} max={23}/>
                    <InputRow label="Fin nuit (h)" value={pricingRules.nightEndHour} onChange={v=>setPricingRules({...pricingRules,nightEndHour:v})} min={0} max={23}/>
                    <InputRow label="Coef. nuit" value={pricingRules.nightMultiplier} onChange={v=>setPricingRules({...pricingRules,nightMultiplier:v})} unit="×" step={0.05} min={1}/>
                    <InputRow label="Coef. week-end" value={pricingRules.weekendMultiplier} onChange={v=>setPricingRules({...pricingRules,weekendMultiplier:v})} unit="×" step={0.05} min={1}/>
                  </div>
                  <SectionTitle>Heures de pointe</SectionTitle>
                  {(pricingRules.peakHours || []).map((p, i) => (
                    <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:12,marginBottom:12,alignItems:'end'}}>
                      <InputRow label="Début" value={p.start} onChange={v=>{ const ph=[...pricingRules.peakHours]; ph[i]={...ph[i],start:v}; setPricingRules({...pricingRules,peakHours:ph})}} min={0} max={23}/>
                      <InputRow label="Fin" value={p.end} onChange={v=>{ const ph=[...pricingRules.peakHours]; ph[i]={...ph[i],end:v}; setPricingRules({...pricingRules,peakHours:ph})}} min={0} max={23}/>
                      <InputRow label="Coef." value={p.multiplier} onChange={v=>{ const ph=[...pricingRules.peakHours]; ph[i]={...ph[i],multiplier:v}; setPricingRules({...pricingRules,peakHours:ph})}} step={0.05} min={1}/>
                    </div>
                  ))}
                </div>
              )}

              {tab==='faq' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>FAQ & messages in-app</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>Contenu affiché dans les apps sans rebuild.</p>
                  {canWrite && (
                    <div className="card" style={{padding:16,marginBottom:20}}>
                      <InputRow label="Question FR" value={faqForm.questionFr} onChange={v=>setFaqForm({...faqForm,questionFr:v})} type="text"/>
                      <textarea className="input" rows={3} value={faqForm.answerFr} onChange={e=>setFaqForm({...faqForm,answerFr:e.target.value})} placeholder="Réponse FR" style={{width:'100%',marginBottom:12}}/>
                      <button className="btn btn-primary" onClick={async()=>{
                        await faqService.create(faqForm)
                        setFaqForm({ questionFr:'', answerFr:'', category:'general' })
                        const list = await faqService.list()
                        setFaqList(list)
                      }}>Ajouter</button>
                    </div>
                  )}
                  {faqList.map(f => (
                    <div key={f.id} className="card" style={{padding:16,marginBottom:10,display:'flex',justifyContent:'space-between',gap:12}}>
                      <div><div style={{fontWeight:600}}>{f.questionFr}</div><div style={{fontSize:13,color:'var(--text3)',marginTop:4}}>{f.answerFr}</div></div>
                      {canWrite && <button className="btn btn-sm btn-danger" onClick={async()=>{ await faqService.remove(f.id); setFaqList(await faqService.list()) }}>Suppr.</button>}
                    </div>
                  ))}
                </div>
              )}

              {tab==='admins' && (
                <div className="fade-in">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Rôles administrateur</div>
                  <p style={{fontSize:13,color:'var(--text3)',marginBottom:24}}>SUPER_ADMIN = tout · SUPPORT = écriture · READONLY = lecture seule</p>
                  {adminUsers.map(a => (
                    <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,padding:14,border:'1.5px solid var(--border)',borderRadius:10,marginBottom:10}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600}}>{a.email}</div>
                        <div style={{fontSize:12,color:'var(--text3)'}}>{[a.firstName,a.lastName].filter(Boolean).join(' ') || '—'}</div>
                      </div>
                      {canWrite ? (
                        <select className="input" value={a.adminRole || 'SUPER_ADMIN'} style={{maxWidth:160}}
                          onChange={async e=>{ await adminsService.setRole(a.id, e.target.value); setAdminUsers(await adminsService.list()) }}>
                          <option value="SUPER_ADMIN">Super admin</option>
                          <option value="SUPPORT">Support</option>
                          <option value="READONLY">Lecture seule</option>
                        </select>
                      ) : (
                        <span className="badge badge-blue">{a.adminRole || 'SUPER_ADMIN'}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
