'use client'

import GeoMap from '@/components/map/GeoMap'

export default function MapPage() {
  return (
    <div className="min-h-screen pt-[155px] px-8 max-w-[2000px] mx-auto">
      <h1 className="text-2xl tracking-[0.05em] font-bold mb-4">LOCATIONS MAP</h1>
      <GeoMap />
    </div>
  )
}
