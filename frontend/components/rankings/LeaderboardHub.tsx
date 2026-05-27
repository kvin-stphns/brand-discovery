'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import LeaderboardTable from './LeaderboardTable'
import { CategoryShareChart, MomentumChart, BarChart, CombinedInsightsChart } from './Charts'
import RankingsList from './RankingsList'
import MapLeaderboard from './MapLeaderboard'
import { CategoryScope, LeaderboardRow, MapRankingPoint, RankingListItem, RankingsFilters, Timeframe } from '@/lib/rankings/types'
import { fetchRankings, fetchRankingsMostLiked, fetchRankingsMostViewed, fetchRankingsRecentVotes } from '@/lib/api/client'

type Mode = 'leaderboard' | 'most-liked' | 'most-viewed' | 'recently-liked' | 'map'

function Controls({ value, onChange, showCategory }: { value: RankingsFilters; onChange: (v: RankingsFilters) => void; showCategory: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* placeholder controls retained for layout; options can be made dynamic when API supports */}
      <select className="border border-black/20 px-2 py-1 text-xs" value={value.timeframe} onChange={(e) => onChange({ ...value, timeframe: e.target.value as Timeframe })}>
        {(['24h', '7d', '30d', 'all'] as Timeframe[]).map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
      </select>
      {showCategory && (
        <select className="border border-black/20 px-2 py-1 text-xs" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value as CategoryScope })}>
          {(['women', 'men', 'gifts', 'explore'] as CategoryScope[]).map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {(['mixed', 'brand', 'designer', 'product'] as const).map((s) => (
          <button key={s} className={`text-xs px-2 py-1 border ${value.sort === s ? 'bg-black text-white' : 'border-black/20'}`} onClick={() => onChange({ ...value, sort: s as any })}>
            {s.toString().toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

function displayName(item: { name?: string; brand?: string; title?: string; id?: string }) {
  return String(item.name || [item.brand, item.title].filter(Boolean).join(' ') || item.id || '').replace(/\{[^}]*\}|var\([^)]*\)/g, '').trim()
}

function trendFromMetrics(score: number, clicks = 0, votes = 0, idx = 0) {
  const base = Math.max(1, score || clicks || votes || 1)
  return Array.from({ length: 16 }).map((_, j) => Number(Math.max(1, base + (j - 8) * 0.35 + clicks * 0.15 + votes * 0.1 + idx * 0.05).toFixed(2)))
}

export default function LeaderboardHub({ initialMode = 'leaderboard' as Mode, variant = 'global' as 'global' | 'category', showModeToggle = true, activeCategory }: { initialMode?: Mode; variant?: 'global' | 'category'; showModeToggle?: boolean; activeCategory?: string }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [filters, setFilters] = useState<RankingsFilters>({ timeframe: '7d', category: 'women', sort: 'mixed' as any })
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [kpis, setKpis] = useState<{ totalVotes: number; topCategory: string; fastestRiser: string } | null>(null)
  const [listItems, setListItems] = useState<RankingListItem[]>([])
  const [mapPoints, setMapPoints] = useState<MapRankingPoint[]>([])

  const scopedCategory = (activeCategory || filters.category || '').toLowerCase()
  const genderFilter = scopedCategory === 'men' ? 'Men' : scopedCategory === 'women' ? 'Women' : undefined
  const rankingQuery = useMemo(() => ({ gender: genderFilter, timeframe: filters.timeframe, limit: 24 }), [genderFilter, filters.timeframe])

  const applyTypeFilter = useCallback(<T extends { type?: string },>(items: T[]) => {
    if (filters.sort === 'mixed') return items
    return items.filter((item) => item.type === filters.sort)
  }, [filters.sort])

  useEffect(() => {
    fetchRankings(rankingQuery)
      .then((items) => {
        const safeItems = applyTypeFilter(Array.isArray(items) ? items : [])
        const mapped: LeaderboardRow[] = safeItems.map((i, idx) => ({
          id: String(i.productId || i.id),
          name: displayName(i),
          type: i.type || 'product',
          rank: Number(i.rank || idx + 1),
          score: Number(i.score || 0),
          delta: 0,
          image: i.image || i.images?.[0] || '',
          trend: trendFromMetrics(Number(i.score || 0), Number(i.clicks || 0), Number(i.votes || 0), idx),
        }))
        setRows(mapped)
        setKpis(mapped.length ? { totalVotes: safeItems.reduce((sum, item) => sum + Number(item.votes || item.count || 0), 0), topCategory: mapped[0]?.type.toUpperCase() || '-', fastestRiser: mapped[0]?.name || '-' } : null)
      })
      .catch(() => { setRows([]); setKpis(null) })
  }, [applyTypeFilter, rankingQuery])

  useEffect(() => {
    const loader = mode === 'most-liked'
      ? fetchRankingsMostLiked
      : mode === 'most-viewed'
        ? fetchRankingsMostViewed
        : mode === 'recently-liked'
          ? fetchRankingsRecentVotes
          : null

    if (!loader) {
      setListItems([])
      setMapPoints([])
      return
    }

    loader(rankingQuery)
      .then((items) => {
        const safeItems = applyTypeFilter(Array.isArray(items) ? items : [])
        const mapped: RankingListItem[] = safeItems.map((it: any, idx: number) => ({
          id: String(it.productId || it.id),
          rank: Number(it.rank || idx + 1),
          name: displayName(it),
          type: it.type || 'product',
          image: it.image || it.images?.[0] || '',
          metric: Number(it.score || it.count || it.weight || 0),
        }))
        setListItems(mapped)
        setMapPoints([])
      })
      .catch(() => {
        setListItems([])
        setMapPoints([])
      })
  }, [applyTypeFilter, mode, rankingQuery])

  const scoreValues = rows.slice(0, 5).map((r) => r.score)
  const scoreLabels = rows.slice(0, 5).map((r) => `#${r.rank}`)
  const categoryValues = rows.slice(0, 4).map((r) => r.score)
  const momentumSeries = rows[0]?.trend || []

  return (
    <div className="grid grid-cols-1 desktop:grid-cols-4 gap-8">
      <div className="desktop:col-span-3">
        <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between mb-4">
          <Controls value={filters} onChange={setFilters} showCategory={variant === 'global'} />
          {showModeToggle && (
            <div className="inline-flex border border-black/40 text-xs rounded-sm overflow-x-auto max-w-full whitespace-nowrap">
              {(['leaderboard', 'most-liked', 'most-viewed', 'recently-liked', 'map'] as Mode[]).map((m) => (
                <button key={m} className={`px-3 py-1 whitespace-nowrap ${m === mode ? 'bg-black text-white' : ''}`} onClick={() => setMode(m)}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === 'leaderboard' && (
          <>
            <LeaderboardTable rows={rows} />
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mt-6">
              <div className="border border-black p-4">
                <div className="text-xs mb-2 tracking-[0.15em]">CATEGORY SHARE</div>
                <CategoryShareChart values={categoryValues} />
              </div>
              <div className="border border-black p-4">
                <div className="text-xs mb-2 tracking-[0.15em]">MOMENTUM</div>
                <MomentumChart series={momentumSeries} />
              </div>
              <div className="border border-black p-4 tablet:col-span-2">
                <div className="text-xs mb-2 tracking-[0.15em]">TOP 5 BAR</div>
                <BarChart values={scoreValues} labels={scoreLabels} />
              </div>
              <div className="border border-black p-4 tablet:col-span-2">
                <div className="text-xs mb-2 tracking-[0.15em]">INSIGHTS</div>
                <CombinedInsightsChart series={rows.slice(0, 3).map((r) => ({ name: r.name, data: r.trend }))} />
              </div>
            </div>
          </>
        )}

        {(mode === 'most-liked' || mode === 'most-viewed' || mode === 'recently-liked') && (
          <div className="mt-2">
            <RankingsList items={listItems} />
          </div>
        )}

        {mode === 'map' && (
          <div className="mt-2">
            <MapLeaderboard points={mapPoints} />
          </div>
        )}
      </div>
      <aside className="desktop:col-span-1">
        <div className="sticky top-[140px] space-y-4">
          <div className="border border-black p-4">
            <div className="text-xs tracking-[0.15em] mb-2">TOTAL VOTES</div>
            <div className="text-2xl">{kpis?.totalVotes ?? '-'}</div>
          </div>
          <div className="border border-black p-4">
            <div className="text-xs tracking-[0.15em] mb-2">TOP CATEGORY</div>
            <div className="text-sm">{kpis?.topCategory ?? '-'}</div>
          </div>
          <div className="border border-black p-4">
            <div className="text-xs tracking-[0.15em] mb-2">FASTEST RISER</div>
            <div className="text-sm">{kpis?.fastestRiser ?? '-'}</div>
          </div>
        </div>
      </aside>
    </div>
  )
}
