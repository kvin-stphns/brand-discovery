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

// Additional helpers (non-breaking)
export type DesignerDTO = { _id: string; name: string; slug: string; image?: string; url?: string }
export async function fetchDesigners(): Promise<DesignerDTO[]> {
  if (useMocks) {
    const { mockList } = await import('./mock')
    const items = await mockList('designer', 12)
    return items.map((i) => ({ _id: i.id, name: i.name, slug: i.id, image: i.image }))
  }
  const res = await get('/api/designers')
  const json = await res.json()
  return json.items as DesignerDTO[]
}

export type ProductDTO = { _id: string; name: string; slug: string; images?: string[]; price?: number; currency?: string; url?: string; brandId: string; designerId?: string }
export type ProductFilters = { brandId?: string; designerId?: string; q?: string; sort?: string; page?: number; limit?: number }
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductDTO[]> {
  if (useMocks) {
    const { mockList } = await import('./mock')
    const items = await mockList('product', 12)
    return items.map((i) => ({ _id: i.id, name: i.name, slug: i.id, images: [i.image], price: i.price, currency: 'USD', url: undefined, brandId: 'brand-1' }))
  }
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, String(v))
  })
  const res = await get(`/api/products?${params.toString()}`)
  const json = await res.json()
  return json.items as ProductDTO[]
}

export type VoteCreate = { entityType: 'brand' | 'designer' | 'product'; entityId: string; weight?: number }
export async function postVote(vote: VoteCreate) {
  if (useMocks) return { ok: true }
  const res = await post('/api/votes', vote)
  return res.json()
}

export function getCheckoutRedirectUrl(url: string, source: 'featured' | 'popular' | 'grid' | 'product' = 'grid', utm?: string) {
  const u = new URL(`${API_BASE_URL}/api/affiliate/checkout`)
  u.searchParams.set('url', url)
  if (source) u.searchParams.set('source', source)
  if (utm) u.searchParams.set('utm', utm)
  return u.toString()
}