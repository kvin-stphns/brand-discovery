'use client'
import { useParams } from 'next/navigation'
import LeaderboardHub from '@/components/rankings/LeaderboardHub'

export default function RecentlyLikedPage() {
  const params = useParams() as { category?: string }
  const category = (params?.category || 'all').toString()
  return (
    <div className="pt-[155px] pb-16 px-8 max-w-[2000px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl tracking-[0.05em] font-bold mb-4">{category.toUpperCase()} • RECENTLY LIKED</h1>
        <p className="text-xs tracking-[0.15em] text-gray-500 mb-6">LIST VIEW</p>
        <div className="border-t border-black" />
      </div>
      <div className="mt-8">
        <LeaderboardHub initialMode="recently-liked" variant="category" showModeToggle={false} />
      </div>
    </div>
  )
}


