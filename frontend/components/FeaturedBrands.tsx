'use client'

import { motion } from 'framer-motion'

const FeaturedBrands = () => {
  const brands = Array(8).fill('FEATURED BRAND')

  return (
    <section id="featured" className="py-20">
      <div className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-12 tracking-wider text-center">FEATURED</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-black/10">
          {brands.map((brand, index) => (
            <motion.div
              key={index}
              className="featured-brand bg-white"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-sm tracking-wider">{brand}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedBrands 