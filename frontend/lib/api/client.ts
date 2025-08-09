export const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || ''

export async function get(path: string, init?: RequestInit) {
  const url = `${API_BASE_URL}${path}`
  return fetch(url, { ...init, cache: 'no-store' })
}

export async function post(path: string, body: unknown, init?: RequestInit) {
  const url = `${API_BASE_URL}${path}`
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
    ...init,
  })
}