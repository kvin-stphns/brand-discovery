'use client'

import { motion } from 'framer-motion'

const Hero = () => {
  const scrollToFeatured = () => {
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative h-screen">
      {/* Hero Image */}
      <div className="absolute inset-0 bg-[url('/hero-image.jpg')] bg-cover bg-center" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={scrollToFeatured}
          className="px-8 py-3 border border-black hover:border-cyan-400 
                     transition-colors bg-white/90 tracking-wider"
        >
          DISCOVER
        </motion.button>
      </div>
    </div>
  )
}

export default Hero 