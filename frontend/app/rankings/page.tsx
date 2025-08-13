'use client'
import LeaderboardHub from '@/components/rankings/LeaderboardHub'

export default function RankingsPage() {
  return (
    <div className="pt-[155px] px-8 max-w-[2000px] mx-auto">
      <h1 className="text-2xl tracking-[0.05em] font-bold mb-4">RANKINGS</h1>
      <LeaderboardHub initialMode="leaderboard" variant="global" />
    </div>
  )
}