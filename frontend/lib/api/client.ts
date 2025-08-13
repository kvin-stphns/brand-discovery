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

export type BrandDTO = { _id: string; name: string; image?: string; slug: string }
export type RankingItem = { rank: number; score: number; id: string; name: string }

const useMocks = !API_BASE_URL

export async function fetchBrands(): Promise<BrandDTO[]> {
  if (useMocks) {
    const { mockList } = await import('./mock')
    const items = await mockList('brand', 12)
    return items.map((i) => ({ _id: i.id, name: i.name, image: i.image, slug: i.id }))
  }
  const res = await get('/api/brands')
  const json = await res.json()
  return json.items as BrandDTO[]
}

export async function fetchRankings(): Promise<RankingItem[]> {
  if (useMocks) {
    return Array.from({ length: 10 }).map((_, i) => ({ rank: i + 1, score: 100 - i * 3, id: `brand-${i + 1}`, name: `Brand ${i + 1}` }))
  }
  const res = await get('/api/rankings')
  const json = await res.json()
  return json.items as RankingItem[]
}