import Hero from '@/components/Hero'
import FeaturedBrands from '@/components/FeaturedBrands'
import PopularBrands from '@/components/PopularBrands'
import Link from 'next/link'
import LeaderboardHub from '@/components/rankings/LeaderboardHub'

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Hero />
        <div className="divider"></div> 
        <div className="w-full" id="featured-section">
          <FeaturedBrands />
        </div>
        <div className="divider"></div>
        <PopularBrands />
        <div className="divider"></div>
        <div className="max-w-[2000px] mx-auto w-full py-20">
          <div className="px-8">
            <Link href="/rankings">
              <h2 className="text-black text-2xl tracking-[0.05em] font-bold mb-6 hover:text-black/60 transition-colors">
                RANKINGS
              </h2>
            </Link>
            <p className="text-xs tracking-[0.15em] text-gray-500 mb-3">GLOBAL LEADERBOARD</p>
            <p className="text-xs tracking-[0.05em] text-gray-500 mb-8">Live momentum, category share, and KPIs</p>
          </div>
          <div className="max-w-[2000px] mx-auto border-t border-black" />
          <div className="px-8 mt-8">
            <LeaderboardHub initialMode="leaderboard" variant="global" />
          </div>
        </div>
      </div>
    </>
  )
} 