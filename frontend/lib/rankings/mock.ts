import { CategoryScope, LeaderboardDataResponse, LeaderboardRow, MapRankingPoint, RankingEntityType, RankingListItem, RankingsFilters, Timeframe } from './types'
import { getPlaceholderImage } from '@/types/placeholders'

function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000
  return () => {
    x = Math.sin(x) * 10000
    return x - Math.floor(x)
  }
}

function seedFromFilters(filters: RankingsFilters) {
  const str = `${filters.timeframe}|${filters.category}|${filters.sort}`
  return str.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

export function generateTrend(rnd: () => number, len = 12): number[] {
  const base = 5 + rnd() * 3
  const trend: number[] = []
  let prev = base
  for (let i = 0; i < len; i++) {
    const delta = (rnd() - 0.5) * 2
    prev = Math.max(1, prev + delta)
    trend.push(Number(prev.toFixed(2)))
  }
  return trend
}

function pickType(index: number, sort: RankingsFilters['sort']): RankingEntityType {
  if (sort === 'brand') return 'brand'
  if (sort === 'designer') return 'designer'
  if (sort === 'product') return 'product'
  return (['brand', 'designer', 'product'] as const)[index % 3]
}

export async function getLeaderboardData(filters: RankingsFilters, count = 24): Promise<LeaderboardDataResponse> {
  const rnd = seededRandom(seedFromFilters(filters))
  const rows: LeaderboardRow[] = Array.from({ length: count }).map((_, i) => {
    const type = pickType(i, filters.sort)
    const score = Math.floor(70 + rnd() * 30)
    const delta = Math.floor((rnd() - 0.5) * 10)
    return {
      id: `${type}-${i + 1}`,
      rank: i + 1,
      name: `${type[0].toUpperCase() + type.slice(1)} ${i + 1}`,
      type,
      image: getPlaceholderImage(type, i % 4),
      score,
      delta,
      trend: generateTrend(rnd, 16),
    }
  })

  // Choose a sensible Top Category label depending on current scope
  const pickTopCategory = () => {
    if (filters.category === 'men' || filters.category === 'women') {
      const subcats = ['Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear']
      return subcats[Math.floor(rnd() * subcats.length)]
    }
    // Global (explore) – show segment leader across Men/Women/Explore
    const globals = ['Women', 'Men', 'Explore']
    return globals[Math.floor(rnd() * globals.length)]
  }

  const kpis = {
    totalVotes: Math.floor(10000 + rnd() * 5000),
    topCategory: pickTopCategory(),
    fastestRiser: rows[Math.floor(rnd() * Math.min(10, rows.length))]?.name || 'N/A',
  }

  return Promise.resolve({ rows, kpis })
}

export async function getListData(filters: RankingsFilters, count = 30): Promise<RankingListItem[]> {
  const rnd = seededRandom(seedFromFilters(filters) + 7)
  return Array.from({ length: count }).map((_, i) => {
    const type = pickType(i, filters.sort)
    const metric = Math.floor(100 + rnd() * 900)
    return {
      id: `${type}-list-${i + 1}`,
      rank: i + 1,
      name: `${type[0].toUpperCase() + type.slice(1)} ${i + 1}`,
      type,
      image: getPlaceholderImage(type, i % 4),
      metric,
    }
  })
}

export async function getMapData(filters: RankingsFilters): Promise<{ points: MapRankingPoint[] }> {
  const rnd = seededRandom(seedFromFilters(filters) + 13)
  const cities = [
    { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Milan, Italy', lat: 45.4642, lng: 9.19 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Seoul, Korea', lat: 37.5665, lng: 126.978 },
  ]
  const points: MapRankingPoint[] = cities.map((c, i) => {
    const score = Math.floor(70 + rnd() * 30)
    const rank = i + 1
    return {
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      score,
      rank,
      externalUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name)}`,
    }
  })
  return Promise.resolve({ points })
}

export const TIMEFRAMES: Timeframe[] = ['24h', '7d', '30d', 'all']
export const CATEGORIES: CategoryScope[] = ['women', 'men', 'explore']
export const SORTS = ['mixed', 'brand', 'designer', 'product'] as const

export function formatScore(score: number) {
  return `${score}`
}

export function formatDelta(delta: number) {
  const sign = delta >= 0 ? '▲' : '▼'
  return `${sign} ${Math.abs(delta)}`
}


