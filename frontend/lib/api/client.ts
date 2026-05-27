export const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || ''
const LOCAL_API_PORT = process.env.NEXT_PUBLIC_API_PORT || '3001'
const FORCE_SOURCE = (process.env.NEXT_PUBLIC_FORCE_SOURCE || '').trim()

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]'
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return API_BASE_URL
  }

  if (!API_BASE_URL) {
    const pageHost = window.location.hostname
    if (isLoopbackHost(pageHost)) {
      const host = pageHost === '::1' ? '[::1]' : pageHost
      return `${window.location.protocol}//${host}:${LOCAL_API_PORT}`
    }
    return ''
  }

  try {
    const endpoint = new URL(API_BASE_URL)
    const pageHost = window.location.hostname

    if (isLoopbackHost(endpoint.hostname) && pageHost && !isLoopbackHost(pageHost)) {
      endpoint.hostname = pageHost
      return endpoint.origin
    }
  } catch {
    return API_BASE_URL
  }

  return API_BASE_URL
}

function buildApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

export async function get(path: string, init?: RequestInit) {
  const url = buildApiUrl(path)
  return fetch(url, { ...init, cache: 'no-store' })
}

export async function post(path: string, body: unknown, init?: RequestInit) {
  const url = buildApiUrl(path)
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
    ...init,
  })
}

export type BrandDTO = { _id: string; name: string; image?: string; slug: string }
export type RankingItem = {
  rank: number
  score: number
  id: string
  productId?: string
  name: string
  type?: 'product' | 'brand' | 'designer'
  title?: string
  brand?: string
  retailer?: string
  image?: string
  images?: string[]
  price?: ProductPrice | null
  clicks?: number
  votes?: number
  count?: number
  weight?: number
  entityType?: string
}

export async function fetchBrands(): Promise<BrandDTO[]> {
  const res = await get('/api/brands')
  if (!res.ok) return []
  const json = await res.json()
  return json.items as BrandDTO[]
}

export async function fetchBrand(id: string): Promise<BrandDTO | null> {
  const res = await get(`/api/brands/${id}`)
  if (!res.ok) return null
  return (await res.json()) as BrandDTO
}

type RankingQuery = {
  gender?: string
  category?: string
  timeframe?: '24h' | '7d' | '30d' | 'all'
  limit?: number
}

function rankingParams(input?: string | RankingQuery) {
  const params = new URLSearchParams()
  if (typeof input === 'string') {
    if (input) params.set('gender', input)
    return params
  }
  if (input?.gender) params.set('gender', input.gender)
  if (input?.category) params.set('category', input.category)
  if (input?.timeframe) params.set('timeframe', input.timeframe)
  if (input?.limit) params.set('limit', String(input.limit))
  return params
}

function normalizeRankingItem(it: any, fallbackRank = 0): RankingItem {
  return {
    rank: Number(it.rank || fallbackRank),
    score: Number(it.score || it.count || it.weight || 0),
    id: String(it.id || it.productId || it._id || ''),
    productId: it.productId ? String(it.productId) : undefined,
    name: String(it.name || [it.brand, it.title].filter(Boolean).join(' ') || ''),
    type: it.type || 'product',
    title: it.title,
    brand: it.brand,
    retailer: it.retailer,
    image: it.image || it.images?.[0],
    images: Array.isArray(it.images) ? it.images : undefined,
    price: it.price || null,
    clicks: Number(it.clicks || 0),
    votes: Number(it.votes || 0),
    count: Number(it.count || 0),
    weight: Number(it.weight || 0),
    entityType: it.entityType,
  }
}

export async function fetchRankings(input?: string | RankingQuery): Promise<RankingItem[]> {
  const params = rankingParams(input)
  const res = await get(`/api/rankings?${params.toString()}`)
  if (!res.ok) return []
  const json = await res.json()
  const items = Array.isArray(json.items) ? json.items : []
  return items.map((it: any, idx: number) => normalizeRankingItem(it, idx + 1))
}

export async function fetchRankingsMostLiked(input?: RankingQuery): Promise<RankingItem[]> {
  const params = rankingParams(input)
  const res = await get(`/api/rankings/mostLiked?${params.toString()}`)
  if (!res.ok) return []
  const json = await res.json()
  const items = Array.isArray(json.items) ? json.items : []
  return items.map((it: any, idx: number) => normalizeRankingItem(it, idx + 1))
}

export async function fetchRankingsMostViewed(input?: RankingQuery): Promise<RankingItem[]> {
  const params = rankingParams(input)
  const res = await get(`/api/rankings/mostViewed?${params.toString()}`)
  if (!res.ok) return []
  const json = await res.json()
  const items = Array.isArray(json.items) ? json.items : []
  return items.map((it: any, idx: number) => normalizeRankingItem(it, idx + 1))
}

export async function fetchRankingsRecentVotes(input?: RankingQuery): Promise<RankingItem[]> {
  const params = rankingParams(input)
  const res = await get(`/api/rankings/recentVotes?${params.toString()}`)
  if (!res.ok) return []
  const json = await res.json()
  const items = Array.isArray(json.items) ? json.items : []
  return items.map((it: any, idx: number) => normalizeRankingItem(it, idx + 1))
}

// Additional helpers (non-breaking)
export type DesignerDTO = { _id: string; name: string; slug: string; image?: string; url?: string }
export async function fetchDesigners(): Promise<DesignerDTO[]> {
  const res = await get('/api/designers')
  if (!res.ok) return []
  const json = await res.json()
  return json.items as DesignerDTO[]
}

export async function fetchDesigner(id: string): Promise<DesignerDTO | null> {
  const res = await get(`/api/designers/${id}`)
  if (!res.ok) return null
  return (await res.json()) as DesignerDTO
}

export type ProductPrice = { value: number | undefined; currency?: string; originalValue?: number }
export type ProductDTO = {
  _id: string
  source?: string
  sourceId?: string
  retailer?: string
  retailerId?: string
  title: string
  brand?: string
  images?: string[]
  price?: ProductPrice
  canonicalUrl?: string
  affiliateUrl?: string
  description?: string
  details?: string[]
  sizes?: string[]
  availability?: string
  sku?: string
  color?: string
  category?: string[]
  breadcrumbs?: string[]
  shipping?: string
  returns?: string
  dataQuality?: { score?: number }
}
export type ProductFilters = { brandId?: string; designerId?: string; source?: string; q?: string; sort?: string; page?: number; limit?: number; gender?: string; category?: string }

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

export function getCheckoutRedirectUrlById(productId: string, source: 'featured' | 'popular' | 'grid' | 'product' | 'checkout' = 'grid', utm?: string) {
  const params = new URLSearchParams()
  params.set('productId', productId)
  if (source) params.set('source', source)
  if (utm) params.set('utm', utm)
  return buildApiUrl(`/api/affiliate/checkout?${params.toString()}`)
}
