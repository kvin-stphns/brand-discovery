'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const timeRanges = ['24h', '7d', '30d', 'all'] as const
const types = ['mixed', 'brands', 'designers', 'products'] as const
const scopes = ['all', 'women', 'men', 'gifts', 'explore'] as const

type Filters = {
  t: typeof timeRanges[number]
  type: typeof types[number]
  scope: typeof scopes[number]
}

export default function FiltersBar() {
  const router = useRouter()
  const params = useSearchParams()

  const current: Filters = {
    t: (params.get('t') as Filters['t']) || '7d',
    type: (params.get('type') as Filters['type']) || 'mixed',
    scope: (params.get('scope') as Filters['scope']) || 'all',
  }

  const update = (patch: Partial<Filters>) => {
    const next = { ...current, ...patch }
    const q = new URLSearchParams({ t: next.t, type: next.type, scope: next.scope })
    router.replace(`/rankings?${q.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <select className="border border-black/20 px-2 py-1 text-xs" value={current.t} onChange={(e) => update({ t: e.target.value as Filters['t'] })}>
        {timeRanges.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
      </select>
      <select className="border border-black/20 px-2 py-1 text-xs" value={current.type} onChange={(e) => update({ type: e.target.value as Filters['type'] })}>
        {types.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
      </select>
      <select className="border border-black/20 px-2 py-1 text-xs" value={current.scope} onChange={(e) => update({ scope: e.target.value as Filters['scope'] })}>
        {scopes.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
      </select>
    </div>
  )
}


