// In dev leeg (relatieve paden, via Vite's proxy naar localhost:5269).
// In productie gezet via de build-time env var VITE_API_BASE_URL,
// zodra de frontend op een ander domein staat dan de API.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const ADMIN_KEY_OPSLAG = 'easy2move_admin_key'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY_OPSLAG)
}

export function setAdminKey(key: string) {
  sessionStorage.setItem(ADMIN_KEY_OPSLAG, key)
}

export function wisAdminKey() {
  sessionStorage.removeItem(ADMIN_KEY_OPSLAG)
}

export async function http<T>(url: string, init?: RequestInit, metAdminKey = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (metAdminKey) {
    const key = getAdminKey()
    if (key) headers['X-Admin-Key'] = key
  }

  const res = await fetch(url, { headers, ...init })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const bericht =
      body?.message ??
      (res.status === 401
        ? 'Niet geautoriseerd.'
        : `Aanvraag mislukt (${res.status} ${res.statusText})`)
    throw new ApiError(res.status, bericht)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

// Test of een sleutel geldig is door er gewoon een admin-call mee te doen.
export async function controleerAdminKey(key: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/bookings`, { headers: { 'X-Admin-Key': key } })
  if (res.ok) {
    setAdminKey(key)
    return true
  }
  return false
}
