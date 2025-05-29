import Hero from '@/components/Hero'
import FeaturedBrands from '@/components/FeaturedBrands'
import PopularBrands from '@/components/PopularBrands'

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
      </div>
    </>
  )
} 