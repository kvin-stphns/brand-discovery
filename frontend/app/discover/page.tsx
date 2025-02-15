'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/Footer'

const exploreCategories = {
  discover: ['View All', 'Spotlight', 'Trending', 'Lookbooks', 'Location', 'Random'],
  brands: ['View All', 'Alphabetical', 'Newest', 'Featured', 'Popular', 'Random'],
  categories: ['View All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear'],
  designers: ['View All', 'Trending', 'Spotlight', 'Lookbooks', 'Locations', 'Random'],
  rankings: ['View All', 'Top Rated', 'Recently Liked', 'Most Liked', 'Leaderboard', 'Locations']
}

export default function DiscoverPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryGrid 
        items={[]}
        title="DISCOVER"
      />
      <Footer />
    </div>
  )
} 