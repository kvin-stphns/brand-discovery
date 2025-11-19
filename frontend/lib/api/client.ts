export const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || ''
const FORCE_SOURCE = (process.env.NEXT_PUBLIC_FORCE_SOURCE || '').trim()

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

export async function fetchBrands(): Promise<BrandDTO[]> {
  const res = await get('/api/brands')
  if (!res.ok) return []
  const json = await res.json()
  return json.items as BrandDTO[]
}

export async function fetchRankings(): Promise<RankingItem[]> {
  const res = await get('/api/rankings')
  if (!res.ok) return []
  const json = await res.json()
  return json.items as RankingItem[]
}

export async function fetchRankingsMostLiked(): Promise<Array<{ id: string; score: number }>> {
  const res = await get('/api/rankings/mostLiked')
  if (!res.ok) return []
  const json = await res.json()
  const items = Array.isArray(json.items) ? json.items : []
  return items.map((it: any) => ({ id: String(it._id), score: Number(it.score || 0) }))
}

export async function fetchRankingsMostViewed(): Promise<Array<{ id: string; count: number }>> {
  const res = await get('/api/rankings/mostViewed')
  if (!res.ok) return []
  const json = await res.json()
  const items = Array.isArray(json.items) ? json.items : []
  return items.map((it: any) => ({ id: String(it._id), count: Number(it.count || 0) }))
}

export async function fetchRankingsRecentVotes(): Promise<Array<{ id: string; entityType: string }>> {
  const res = await get('/api/rankings/recentVotes')
  if (!res.ok) return []
  const json = await res.json()
  const items = Array.isArray(json.items) ? json.items : []
  return items.map((it: any) => ({ id: String(it.entityId || it._id), entityType: String(it.entityType || '') }))
}

// Additional helpers (non-breaking)
export type DesignerDTO = { _id: string; name: string; slug: string; image?: string; url?: string }
export async function fetchDesigners(): Promise<DesignerDTO[]> {
  const res = await get('/api/designers')
  if (!res.ok) return []
  const json = await res.json()
  return json.items as DesignerDTO[]
}

export type ProductPrice = { value: number | undefined; currency?: string; originalValue?: number }
export type ProductDTO = {
  _id: string
  title: string
  brand?: string
  images?: string[]
  price?: ProductPrice
  canonicalUrl?: string
}
export type ProductFilters = { brandId?: string; designerId?: string; source?: string; q?: string; sort?: string; page?: number; limit?: number }

function applyForceSource(params: URLSearchParams) {
  if (FORCE_SOURCE) {
    if (!params.has('source')) {
      params.set('source', FORCE_SOURCE)
    }
  }
}
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductDTO[]> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v))
  })
  applyForceSource(params)
  const res = await get(`/api/products?${params.toString()}`)
  if (!res.ok) return []
  const json = await res.json()
  return json.items as ProductDTO[]
}

export async function fetchProduct(id: string): Promise<ProductDTO | null> {
  const res = await get(`/api/products/${id}`)
  if (!res.ok) return null
  return (await res.json()) as ProductDTO
}

export type VoteCreate = { entityType: 'brand' | 'designer' | 'product'; entityId: string; weight?: number }
export async function postVote(vote: VoteCreate) {
  const res = await post('/api/votes', vote)
  return res.json()
}

export async function fetchVoteSummary(entityType: 'brand' | 'designer' | 'product', entityId: string) {
  const params = new URLSearchParams({ entityType, entityId })
  const res = await get(`/api/votes/summary?${params.toString()}`)
  return res.json()
}

export function getCheckoutRedirectUrlById(productId: string, source: 'featured' | 'popular' | 'grid' | 'product' = 'grid', utm?: string) {
  const u = new URL(`${API_BASE_URL}/api/affiliate/checkout`)
  u.searchParams.set('productId', productId)
  if (source) u.searchParams.set('source', source)
  if (utm) u.searchParams.set('utm', utm)
  return u.toString()
}
