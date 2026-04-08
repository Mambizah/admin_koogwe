import axios from 'axios'

// En dev, on passe par le proxy Vite (/api) pour éviter les erreurs CORS
// En production, on utilise la variable d'environnement VITE_API_URL
export const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: API_BASE, timeout: 15000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('koogwe_admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      if (!window.location.pathname.includes('login') && window.location.pathname !== '/') {
        localStorage.removeItem('koogwe_admin_token')
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

// Auth
export const authService = {
<<<<<<< HEAD
  adminLogin: (email, password) => api.post('/api/auth/admin-login', { email, password }),
=======
  adminLogin: (email, password) => api.post('/auth/admin-login', { email, password }),
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
}

// Dashboard
export const dashboardService = {
  getStats:       () => api.get('/api/admin/dashboard/stats'),
  getRecentRides: () => api.get('/api/admin/dashboard/rides/recent'),
  getPendingDocs: () => api.get('/api/admin/dashboard/documents/pending'),
}

// Chauffeurs
export const driversService = {
<<<<<<< HEAD
  getAll:    ()          => api.get('/api/admin/drivers'),
  getOne:    (id)        => api.get(`/api/admin/drivers/${id}`),
  suspend:   (id)        => api.patch(`/api/admin/drivers/${id}/suspend`),
  activate:  (id)        => api.patch(`/api/admin/drivers/${id}/activate`),
  approve:   (id)        => api.patch(`/api/admin/drivers/${id}/approval`, { approved: true }),
  reject:    (id, note)  => api.patch(`/api/admin/drivers/${id}/approval`, { approved: false, adminNotes: note }),
=======
  getAll:    ()          => api.get('/admin/drivers'),
  getOne:    (id)        => api.get(`/admin/drivers/${id}`),
  suspend:   (id)        => api.patch(`/admin/drivers/${id}/suspend`),
  activate:  (id)        => api.patch(`/admin/drivers/${id}/activate`),
  // ✅ AJOUTÉ: approuver/refuser manuellement
  approve:   (id)        => api.patch(`/admin/drivers/${id}/approval`, { approved: true }),
  reject:    (id, note)  => api.patch(`/admin/drivers/${id}/approval`, { approved: false, adminNotes: note }),
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
}

// Documents
export const documentsService = {
<<<<<<< HEAD
  getAll:     (status) => api.get(`/api/admin/documents${status && status !== 'ALL' ? `?status=${status}` : ''}`),
  getPending: ()       => api.get('/api/admin/documents?status=PENDING'),
  approve:    (id)          => api.patch(`/api/admin/documents/${id}/approve`),
  reject:     (id, reason)  => api.patch(`/api/admin/documents/${id}/reject`, { reason }),
=======
  getAll:     (status) => api.get(`/admin/documents${status && status !== 'ALL' ? `?status=${status}` : ''}`),
  getPending: ()       => api.get('/admin/documents?status=PENDING'),
  approve:    (id)          => api.patch(`/admin/documents/${id}/approve`),
  reject:     (id, reason)  => api.patch(`/admin/documents/${id}/reject`, { reason }),
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
}

// Passagers
export const passengersService = {
  getAll:   ()    => api.get('/api/admin/passengers'),
  suspend:  (id)  => api.patch(`/api/admin/passengers/${id}/suspend`),
  activate: (id)  => api.patch(`/api/admin/passengers/${id}/activate`),
}

// Courses
export const ridesService = {
  getAll:    (limit=50) => api.get(`/api/admin/rides?limit=${limit}`),
  getActive: ()         => api.get('/api/admin/rides/active'),
}

// Finances
export const financeService = {
<<<<<<< HEAD
  getStats:        ()                 => api.get('/api/admin/finance/stats'),
  getChart:        (period='weekly')  => api.get(`/api/admin/finance/chart?period=${period}`),
  getTransactions: (page=1, limit=20) => api.get(`/api/admin/finance/transactions?page=${page}&limit=${limit}`),
=======
  getStats:        ()                 => api.get('/admin/finance/stats'),
  getChart:        (period='weekly')  => api.get(`/admin/finance/chart?period=${period}`),
  getTransactions: (page=1, limit=20) => api.get(`/admin/finance/transactions?page=${page}&limit=${limit}`),
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
}

// Panics
export const panicsService = {
  getAll:    () => api.get('/api/admin/panics').catch(() => []),
  getActive: () => api.get('/api/admin/panics/active').catch(() => []),
  resolve:   (id) => api.patch(`/api/admin/panics/${id}/resolve`).catch(() => null),
}

// Wallets
export const walletService = {
<<<<<<< HEAD
  getBalance:      (userId) => api.get(`/api/wallet/balance/${userId}`).catch(() => ({ balance: 0 })),
  getTransactions: (userId) => api.get(`/api/wallet/transactions/${userId}`).catch(() => []),
}

// Estimation prix
export const pricingService = {
  estimate:     (params) => api.post('/api/admin/estimate-price', params),
  getConfig:    ()       => api.get('/api/admin/config/pricing').catch(() => null),
  updateConfig: (p)      => api.patch('/api/admin/config/pricing', p),
=======
  getBalance: (userId) => api.get(`/wallet/balance/${userId}`).catch(() => ({ balance: 0 })),
  getTransactions: (userId) => api.get(`/wallet/transactions/${userId}`).catch(() => []),
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
}

// Config
export const adminConfigService = {
<<<<<<< HEAD
  get:              () => api.get('/api/admin/config').catch(() => null),
  update:           (p) => api.patch('/api/admin/config', p),
  getPricing:       () => api.get('/api/admin/config/pricing').catch(() => null),
  getFinancials:    () => api.get('/api/admin/config/financials').catch(() => null),
  getSecurity:      () => api.get('/api/admin/config/security').catch(() => null),
  getPayments:      () => api.get('/api/admin/config/payments').catch(() => null),
  updatePricing:    (p) => api.patch('/api/admin/config/pricing', p),
  updateFinancials: (p) => api.patch('/api/admin/config/financials', p),
  updateSecurity:   (p) => api.patch('/api/admin/config/security', p),
  updatePayments:   (p) => api.patch('/api/admin/config/payments', p),
=======
  get:              () => api.get('/admin/config').catch(() => null),
  update:           (p) => api.patch('/admin/config', p),
  getPricing:       () => api.get('/admin/config/pricing').catch(() => null),
  getFinancials:    () => api.get('/admin/config/financials').catch(() => null),
  getSecurity:      () => api.get('/admin/config/security').catch(() => null),
  getPayments:      () => api.get('/admin/config/payments').catch(() => null),
  updatePricing:    (p) => api.patch('/admin/config/pricing', p),
  updateFinancials: (p) => api.patch('/admin/config/financials', p),
  updateSecurity:   (p) => api.patch('/admin/config/security', p),
  updatePayments:   (p) => api.patch('/admin/config/payments', p),
>>>>>>> 69edae08ee50f45c471de3ca2de2b8cc4b30e522
}

export default api