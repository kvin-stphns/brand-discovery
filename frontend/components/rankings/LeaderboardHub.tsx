'use client'
import { useEffect, useState } from 'react'
import LeaderboardTable from './LeaderboardTable'
import { CategoryShareChart, MomentumChart, BarChart, CombinedInsightsChart } from './Charts'
import RankingsList from './RankingsList'
import MapLeaderboard from './MapLeaderboard'
import { CategoryScope, LeaderboardRow, MapRankingPoint, RankingListItem, RankingsFilters, Timeframe } from '@/lib/rankings/types'
import { toast } from '@/lib/toast'
import { fetchRankings, fetchRankingsMostLiked, fetchRankingsMostViewed, fetchRankingsRecentVotes } from '@/lib/api/client'

const USE_LIVE = String(process.env.NEXT_PUBLIC_USE_LIVE_API || '').toLowerCase() === 'true'

type Mode = 'leaderboard' | 'most-liked' | 'most-viewed' | 'recently-liked' | 'map'

function Controls({ value, onChange, showCategory }: { value: RankingsFilters; onChange: (v: RankingsFilters) => void; showCategory: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* placeholder controls retained for layout; options can be made dynamic when API supports */}
      <select className="border border-black/20 px-2 py-1 text-xs" value={value.timeframe} onChange={(e) => onChange({ ...value, timeframe: e.target.value as Timeframe })}>
        {(['24h','7d','30d','all'] as Timeframe[]).map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
      </select>
      {showCategory && (
        <select className="border border-black/20 px-2 py-1 text-xs" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value as CategoryScope })}>
          {(['women','men','gifts','explore'] as CategoryScope[]).map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {(['mixed','brand','designer','product'] as const).map((s) => (
          <button key={s} className={`text-xs px-2 py-1 border ${value.sort === s ? 'bg-black text-white' : 'border-black/20'}`} onClick={() => onChange({ ...value, sort: s as any })}>
            {s.toString().toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function LeaderboardHub({ initialMode = 'leaderboard' as Mode, variant = 'global' as 'global' | 'category', showModeToggle = true }: { initialMode?: Mode; variant?: 'global' | 'category'; showModeToggle?: boolean }) {
  const [mode] = useState<Mode>(initialMode)
  const [filters] = useState<RankingsFilters>({ timeframe: '7d', category: 'women', sort: 'mixed' as any })
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [kpis, setKpis] = useState<{ totalVotes: number; topCategory: string; fastestRiser: string } | null>(null)
  const [listItems, setListItems] = useState<RankingListItem[]>([])
  const [mapPoints, setMapPoints] = useState<MapRankingPoint[]>([])

  useEffect(() => {
    // Leaderboard base table
    fetchRankings()
      .then((items) => {
        const safeItems = Array.isArray(items) ? items : []
        const mapped: LeaderboardRow[] = safeItems.map((i, idx) => ({ id: String(i.id), name: String(i.name || ''), type: 'brand', rank: idx + 1, score: Number((i as any).score ?? 100 - idx), delta: 0, image: '', trend: Array.from({ length: 16 }).map((_, j) => 5 + Math.sin((idx + j) / 3)) }))
        setRows(mapped)
        setKpis(safeItems.length ? { totalVotes: safeItems.length * 100, topCategory: '—', fastestRiser: String(safeItems[0]?.name || '—') } : null)
      })
      .catch(() => {
        if (USE_LIVE) toast('Failed to load rankings', 'error')
        setRows([]); setKpis(null)
      })

    // Secondary lists
    Promise.allSettled([
      fetchRankingsMostLiked(),
      fetchRankingsMostViewed(),
      fetchRankingsRecentVotes(),
    ]).then((results) => {
      const liked = results[0].status === 'fulfilled' ? results[0].value : []
      const mappedLiked: RankingListItem[] = liked.map((it: any, idx: number) => ({ id: String(it.id), rank: idx + 1, name: String(it.id), type: 'brand', image: '', metric: Number(it.score || 0) }))
      setListItems(mappedLiked)
      setMapPoints([])
    }).catch(() => {
      setListItems([])
      setMapPoints([])
    })
  }, [])

  return (
    <div className="grid grid-cols-1 desktop:grid-cols-4 gap-8">
      <div className="desktop:col-span-3">
        <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between mb-4">
          <Controls value={filters} onChange={() => {}} showCategory={variant === 'global'} />
          {showModeToggle && (
            <div className="inline-flex border border-black/40 text-xs rounded-sm overflow-x-auto max-w-full whitespace-nowrap">
              {(['leaderboard','most-liked','most-viewed','recently-liked','map'] as Mode[]).map((m) => (
                <button key={m} className={`px-3 py-1 whitespace-nowrap ${m === mode ? 'bg-black text-white' : ''}`}>
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
                <CategoryShareChart />
              </div>
              <div className="border border-black p-4">
                <div className="text-xs mb-2 tracking-[0.15em]">MOMENTUM</div>
                <MomentumChart />
              </div>
              <div className="border border-black p-4 tablet:col-span-2">
                <div className="text-xs mb-2 tracking-[0.15em]">TOP 5 BAR</div>
                <BarChart />
              </div>
              <div className="border border-black p-4 tablet:col-span-2">
                <div className="text-xs mb-2 tracking-[0.15em]">INSIGHTS</div>
                <CombinedInsightsChart series={rows.slice(0,3).map((r) => ({ name: r.name, data: r.trend }))} />
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
            <div className="text-2xl">{kpis?.totalVotes ?? '—'}</div>
          </div>
          <div className="border border-black p-4">
            <div className="text-xs tracking-[0.15em] mb-2">TOP CATEGORY</div>
            <div className="text-sm">{kpis?.topCategory ?? '—'}</div>
          </div>
          <div className="border border-black p-4">
            <div className="text-xs tracking-[0.15em] mb-2">FASTEST RISER</div>
            <div className="text-sm">{kpis?.fastestRiser ?? '—'}</div>
          </div>
        </div>
      </aside>
    </div>
  )
}


