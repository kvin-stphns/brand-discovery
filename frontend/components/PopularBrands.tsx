'use client'

import { motion } from 'framer-motion'

const PopularBrands = () => {
  const brands = [
    { id: '01', name: 'POPULAR BRAND' },
    { id: '02', name: 'POPULAR BRAND' },
    { id: '03', name: 'POPULAR BRAND' },
    { id: '04', name: 'POPULAR BRAND' },
  ]

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/popular-bg.jpg')] bg-cover bg-center" />
      
      <div className="relative max-w-screen-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-12 tracking-wider text-white text-center">POPULAR</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map(({ id, name }) => (
            <motion.div
              key={id}
              className="popular-brand"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-cyan-400 text-xl mb-2">{id}</span>
              <span className="text-white tracking-wider">{name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularBrands 