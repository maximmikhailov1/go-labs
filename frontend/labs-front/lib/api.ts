const API_BASE = "/api"

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE}${p}`
}
