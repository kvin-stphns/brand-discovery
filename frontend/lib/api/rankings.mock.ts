import { getPlaceholderImage } from '@/types/placeholders'

export type RankingFilters = {
  t: '24h' | '7d' | '30d' | 'all'
  type: 'mixed' | 'brands' | 'designers' | 'products'
  scope: 'all' | 'women' | 'men' | 'gifts' | 'explore'
}

function seedRandom(seed: number) {
  let x = Math.sin(seed) * 10000
  return () => {
    x = Math.sin(x) * 10000
    return x - Math.floor(x)
  }
}

export type RankingRow = {
  id: string
  rank: number
  name: string
  label: string
  score: number
  delta: number
  type: 'brand' | 'designer' | 'product'
  image: string
  spark: number[]
}

export async function getRankings(filters: RankingFilters, n = 12): Promise<RankingRow[]> {
  const seed = (filters.t + filters.type + filters.scope).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rnd = seedRandom(seed)
  const pickType = (i: number): RankingRow['type'] => {
    if (filters.type === 'brands') return 'brand'
    if (filters.type === 'designers') return 'designer'
    if (filters.type === 'products') return 'product'
    return (['product', 'brand', 'designer'] as const)[i % 3]
  }
  const items: RankingRow[] = Array.from({ length: n }).map((_, i) => {
    const type = pickType(i)
    const score = Math.floor(80 + rnd() * 20)
    const delta = Math.floor((rnd() - 0.5) * 10)
    const spark = Array.from({ length: 8 }).map(() => Math.floor(2 + rnd() * 8))
    return {
      id: `${type}-${i + 1}`,
      rank: i + 1,
      name: `${type[0].toUpperCase() + type.slice(1)} ${i + 1}`,
      label: `${filters.scope.toUpperCase()} • ${filters.t.toUpperCase()}`,
      score,
      delta,
      type,
      image: getPlaceholderImage(type, i % 4),
      spark,
    }
  })
  return Promise.resolve(items)
}


