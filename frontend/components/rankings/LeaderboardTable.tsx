'use client'
import Image from 'next/image'
import Link from 'next/link'
import { LeaderboardRow } from '@/lib/rankings/types'
import { RowSparkline } from './Charts'
import { sanitizeText } from '@/lib/format'

function hrefForEntity(row: LeaderboardRow) {
  if (row.type === 'brand') return `/brand/${row.id}`
  if (row.type === 'designer') return `/designer/${row.id}`
  return `/product/${row.id}`
}

export default function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="overflow-x-auto border border-black">
      <table className="w-full text-left">
        <thead className="border-b border-black/20">
          <tr className="text-xs">
            <th className="px-3 py-2 w-10">#</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Δ</th>
            <th className="px-3 py-2">Trend</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-black/10">
              <td className="px-3 py-3 text-sm">{r.rank}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 border border-black/10">
                    <Image src={r.image || '/placeholders/brand-1.jpg'} alt={sanitizeText(r.name)} fill className="object-cover" />
                  </div>
                  <div className="text-sm tracking-[0.15em] font-semibold">{sanitizeText(r.name)}</div>
                </div>
              </td>
              <td className="px-3 py-3 text-xs">{r.type.toUpperCase()}</td>
              <td className="px-3 py-3 text-xs">{r.score}</td>
              <td className={`px-3 py-3 text-xs ${r.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.delta >= 0 ? '▲' : '▼'} {Math.abs(r.delta)}</td>
              <td className="px-3 py-3"><RowSparkline data={r.trend} /></td>
              <td className="px-3 py-3 text-xs"><Link className="underline" href={hrefForEntity(r)}>View details</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


