import Head from 'next/head'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/Hero'
import FeaturedBrands from '@/components/FeaturedBrands'
import PopularBrands from '@/components/PopularBrands'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>Discovery Studios - Fashion Brand Discovery</title>
        <meta name="description" content="Discover emerging fashion brands" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Hero />
        <div className="divider"></div> 
        <div className="w-full" id="featured-section">
          <FeaturedBrands />
        </div>
        <div className="divider"></div>
        <PopularBrands />
        <div className="divider"></div>
        <Footer />
      </div>
    </>
  )
}