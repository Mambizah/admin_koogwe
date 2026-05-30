import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_URL || ''
const BASE_URL = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptor pour ajouter le token automatiquement
api.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('koogwe_admin_token')
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`
      // Pour debug (tu peux le supprimer plus tard)
      // console.log('🔑 Token envoyé avec la requête')
    }
    return cfg
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor pour gérer les erreurs (surtout 401)
api.interceptors.response.use(
  (res) => res.data,                    // Retourne directement les données
  (err) => {
    const status = err.response?.status

    if (status === 401 || status === 403) {
      console.warn('🚫 Accès non autorisé (401/403)')

      // Si on n'est pas déjà sur la page login, on redirige
      if (!window.location.pathname.includes('login') && 
          window.location.pathname !== '/' && 
          window.location.pathname !== '/login') {
        
        localStorage.removeItem('koogwe_admin_token')
        window.location.href = '/login'   // ← Changé en /login pour plus de précision
      }
    }

    return Promise.reject(err)
  }
)

// ==================== SERVICES ====================

// Auth
export const authService = {
  adminLogin: (email, password) => 
    api.post('auth/admin-login', { email, password }),
}

// Dashboard
export const dashboardService = {
  getStats:       () => api.get('admin/dashboard/stats'),
  getTrends:      () => api.get('admin/dashboard/trends'),
  getRecentRides: () => api.get('admin/dashboard/rides/recent'),
  getPendingDocs: () => api.get('admin/dashboard/documents/pending'),
}

// Chauffeurs
export const driversService = {
  getAll:    ()          => api.get('admin/drivers'),
  getOne:    (id)        => api.get(`admin/drivers/${id}`),
  suspend:   (id)        => api.patch(`admin/drivers/${id}/suspend`),
  activate:  (id)        => api.patch(`admin/drivers/${id}/activate`),
  approve:   (id)        => api.patch(`admin/drivers/${id}/approval`, { approved: true }),
  reject:    (id, note)  => api.patch(`admin/drivers/${id}/approval`, { approved: false, adminNotes: note }),
  remove:    (id)        => api.delete(`admin/drivers/${id}`),
}

// Documents
export const documentsService = {
  getAll:       (status) => api.get(`admin/documents${status && status !== 'ALL' ? `?status=${status}` : ''}`),
  getPending:   ()       => api.get('admin/documents?status=PENDING'),
  queueStats:   ()       => api.get('admin/documents/queue-stats').catch(() => null),
  approve:      (id)     => api.patch(`admin/documents/${id}/approve`),
  reject:       (id, reason) => api.patch(`admin/documents/${id}/reject`, { reason }),
  remove:       (id)     => api.delete(`admin/documents/${id}`),
}

// Passagers
export const passengersService = {
  getAll:   ()    => api.get('admin/passengers'),
  suspend:  (id)  => api.patch(`admin/passengers/${id}/suspend`),
  activate: (id)  => api.patch(`admin/passengers/${id}/activate`),
  remove:   (id)  => api.delete(`admin/passengers/${id}`),
}

// Courses
export const ridesService = {
  getAll:    (limit = 50) => api.get(`admin/rides?limit=${limit}`),
  getActive: ()           => api.get('admin/rides/active'),
  remove:    (id)         => api.delete(`admin/rides/${id}`),
  removeBulk:(status)     => api.delete(`admin/rides/bulk?status=${status}`),
}

// Finances
export const financeService = {
  getStats:        ()                 => api.get('admin/finance/stats'),
  getChart:        (period = 'weekly') => api.get(`admin/finance/chart?period=${period}`),
  getTransactions: (page = 1, limit = 20) => api.get(`admin/finance/transactions?page=${page}&limit=${limit}`),
}

// Panics
export const panicsService = {
  getAll:    () => api.get('admin/panics').catch(() => []),
  getActive: () => api.get('admin/panics/active').catch(() => []),
  resolve:   (id) => api.patch(`admin/panics/${id}/resolve`).catch(() => null),
}

// Estimation prix (si tu l'utilises)
export const pricingService = {
  estimate:     (params) => api.post('admin/estimate-price', params),
  getConfig:    ()       => api.get('admin/config/pricing').catch(() => null),
}

// Config plateforme (persistée API)
export const adminConfigService = {
  get:              () => api.get('admin/config').catch(() => null),
  getPricing:       () => api.get('admin/config/pricing').catch(() => null),
  updatePricing:    (body) => api.patch('admin/config/pricing', body),
  getFinancials:    () => api.get('admin/config/financials').catch(() => null),
  updateFinancials: (body) => api.patch('admin/config/financials', body),
  getSecurity:      () => api.get('admin/config/security').catch(() => null),
  updateSecurity:   (body) => api.patch('admin/config/security', body),
  getPayments:      () => api.get('admin/config/payments').catch(() => null),
  updatePayments:   (body) => api.patch('admin/config/payments', body),
  getPlatform:      () => api.get('admin/config/platform').catch(() => null),
  updatePlatform:   (body) => api.patch('admin/config/platform', body),
  getEmails:        () => api.get('admin/config/emails').catch(() => null),
  updateEmails:     (body) => api.patch('admin/config/emails', body),
  previewEmail:     (body) => api.post('admin/config/emails/preview', body),
  testEmail:        (body) => api.post('admin/config/emails/test', body),
  getPricingRules:  () => api.get('admin/config/pricing-rules').catch(() => null),
  updatePricingRules:(body) => api.patch('admin/config/pricing-rules', body),
}

export const liveService = {
  getMap: () => api.get('admin/live/map'),
}

export const auditService = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.limit) q.set('limit', params.limit)
    if (params.offset) q.set('offset', params.offset)
    if (params.resourceType) q.set('resourceType', params.resourceType)
    return api.get(`admin/audit-logs?${q}`)
  },
}

export const notificationsAdminService = {
  broadcast: (body) => api.post('admin/notifications/broadcast', body),
  searchUsers: (q, role) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (role) params.set('role', role)
    return api.get(`admin/notifications/users?${params}`)
  },
  sendToUser: (body) => api.post('admin/notifications/send', body),
}

export const disputesService = {
  list: (status) => api.get(`admin/disputes${status ? `?status=${status}` : ''}`),
  create: (body) => api.post('admin/disputes', body),
  update: (id, body) => api.patch(`admin/disputes/${id}`, body),
  scanLowRatings: () => api.post('admin/disputes/scan-low-ratings'),
}

export const promosService = {
  list: () => api.get('admin/promos'),
  create: (body) => api.post('admin/promos', body),
  update: (id, body) => api.patch(`admin/promos/${id}`, body),
  remove: (id) => api.delete(`admin/promos/${id}`),
}

export const faqService = {
  list: () => api.get('admin/faq'),
  create: (body) => api.post('admin/faq', body),
  update: (id, body) => api.patch(`admin/faq/${id}`, body),
  remove: (id) => api.delete(`admin/faq/${id}`),
}

export const exportService = {
  rides: (from, to) => `admin/export/rides${from || to ? `?from=${from || ''}&to=${to || ''}` : ''}`,
  drivers: () => 'admin/export/drivers',
  revenue: (from, to) => `admin/export/revenue${from || to ? `?from=${from || ''}&to=${to || ''}` : ''}`,
}

export const healthService = {
  detailed: () => api.get('admin/health/detailed'),
}

export const adminsService = {
  list: () => api.get('admin/admins'),
  setRole: (id, adminRole) => api.patch(`admin/admins/${id}/role`, { adminRole }),
}

export const hotZonesService = {
  list:   () => api.get('admin/hot-zones'),
  create: (body) => api.post('admin/hot-zones', body),
  update: (id, body) => api.patch(`admin/hot-zones/${id}`, body),
  remove: (id) => api.delete(`admin/hot-zones/${id}`),
}

export default api