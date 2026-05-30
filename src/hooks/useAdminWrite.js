export function useAdminWrite() {
  try {
    const raw = localStorage.getItem('koogwe_admin_user')
    const user = raw ? JSON.parse(raw) : null
    const role = user?.adminRole
    return role !== 'READONLY'
  } catch {
    return true
  }
}
