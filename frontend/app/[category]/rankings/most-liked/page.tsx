'use client'
import { useParams } from 'next/navigation'
import LeaderboardHub from '@/components/rankings/LeaderboardHub'

export default function MostLikedPage() {
  const params = useParams() as { category?: string }
  const category = (params?.category || 'all').toString()
  return (
    <div className="pt-[155px] px-8 max-w-[2000px] mx-auto">
      <h1 className="text-2xl tracking-[0.05em] font-bold mb-4">{category.toUpperCase()} • MOST LIKED</h1>
      <LeaderboardHub initialMode="list" />
    </div>
  )
}


