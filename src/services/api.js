import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
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
    api.post('/auth/admin-login', { email, password }),
}

// Dashboard
export const dashboardService = {
  getStats:       () => api.get('/admin/dashboard/stats'),
  getRecentRides: () => api.get('/admin/dashboard/rides/recent'),
  getPendingDocs: () => api.get('/admin/dashboard/documents/pending'),
}

// Chauffeurs
export const driversService = {
  getAll:    ()          => api.get('/admin/drivers'),
  getOne:    (id)        => api.get(`/admin/drivers/${id}`),
  suspend:   (id)        => api.patch(`/admin/drivers/${id}/suspend`),
  activate:  (id)        => api.patch(`/admin/drivers/${id}/activate`),
  approve:   (id)        => api.patch(`/admin/drivers/${id}/approval`, { approved: true }),
  reject:    (id, note)  => api.patch(`/admin/drivers/${id}/approval`, { approved: false, adminNotes: note }),
}

// Documents
export const documentsService = {
  getAll:     (status) => api.get(`/admin/documents${status && status !== 'ALL' ? `?status=${status}` : ''}`),
  getPending: ()       => api.get('/admin/documents?status=PENDING'),
  approve:    (id)     => api.patch(`/admin/documents/${id}/approve`),
  reject:     (id, reason) => api.patch(`/admin/documents/${id}/reject`, { reason }),
}

// Passagers
export const passengersService = {
  getAll:   ()    => api.get('/admin/passengers'),
  suspend:  (id)  => api.patch(`/admin/passengers/${id}/suspend`),
  activate: (id)  => api.patch(`/admin/passengers/${id}/activate`),
}

// Courses
export const ridesService = {
  getAll:    (limit = 50) => api.get(`/admin/rides?limit=${limit}`),
  getActive: ()           => api.get('/admin/rides/active'),
}

// Finances
export const financeService = {
  getStats:        ()                 => api.get('/admin/finance/stats'),
  getChart:        (period = 'weekly') => api.get(`/admin/finance/chart?period=${period}`),
  getTransactions: (page = 1, limit = 20) => api.get(`/admin/finance/transactions?page=${page}&limit=${limit}`),
}

// Panics
export const panicsService = {
  getAll:    () => api.get('/admin/panics').catch(() => []),
  getActive: () => api.get('/admin/panics/active').catch(() => []),
}

// Estimation prix (si tu l'utilises)
export const pricingService = {
  estimate:     (params) => api.post('/admin/estimate-price', params),
  getConfig:    ()       => api.get('/admin/config/pricing').catch(() => null),
}

// Config
export const adminConfigService = {
  get:              () => api.get('/admin/config').catch(() => null),
  getPricing:       () => api.get('/admin/config/pricing').catch(() => null),
  getFinancials:    () => api.get('/admin/config/financials').catch(() => null),
  getSecurity:      () => api.get('/admin/config/security').catch(() => null),
  getPayments:      () => api.get('/admin/config/payments').catch(() => null),
}

export default api