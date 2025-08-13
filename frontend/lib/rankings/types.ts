export type Timeframe = '24h' | '7d' | '30d' | 'all'
export type CategoryScope = 'all' | 'women' | 'men' | 'gifts' | 'explore'
export type RankingEntityType = 'brand' | 'designer' | 'product'

export type LeaderboardRow = {
  id: string
  rank: number
  name: string
  type: RankingEntityType
  image: string
  score: number
  delta: number
  trend: number[]
}

export type RankingListItem = {
  id: string
  name: string
  type: RankingEntityType
  image: string
  metric: number
  rank: number
}

export type MapRankingPoint = {
  name: string
  lat: number
  lng: number
  score: number
  rank: number
  externalUrl: string
}

export type RankingsFilters = {
  timeframe: Timeframe
  category: CategoryScope
  sort: 'brand' | 'designer' | 'product' | 'mixed'
}

export type LeaderboardDataResponse = {
  rows: LeaderboardRow[]
  kpis: { totalVotes: number; topCategory: string; fastestRiser: string }
}


