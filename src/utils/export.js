import { API_BASE } from '../services/api'

export async function downloadCsv(path, filename) {
  const base = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`
  const token = localStorage.getItem('koogwe_admin_token')
  const res = await fetch(`${base}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Export échoué')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function printHtmlReport(title, html) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
    <style>body{font-family:Segoe UI,sans-serif;padding:32px;color:#0f172a}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:12px}
    th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#f1f5f9}</style></head><body>
    <h1>${title}</h1><p>Généré le ${new Date().toLocaleString('fr-FR')}</p>${html}</body></html>`)
  w.document.close()
  w.focus()
  w.print()
}
