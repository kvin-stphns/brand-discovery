'use client'
import Image from 'next/image'
import Link from 'next/link'
import { brandTypes } from '@/types/gridItems'

interface PageProps {
  params: {
    id: string
  }
}

export default function BrandPage({ params }: PageProps) {
  const { id } = params
  const brandType = brandTypes[0] // For static demo, will be dynamic later
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brand Image Section */}
        <div className="relative aspect-square">
          <Image
            src="/placeholders/product-1.jpg"
            alt={`Brand ${id}`}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Brand Info Section */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Brand {id}</h1>
            <p className="text-sm text-gray-600 tracking-wide">{brandType} Brand</p>
            <p className="text-sm leading-relaxed">
              A premium fashion brand focused on creating unique pieces that blend style with functionality.
            </p>
          </div>
          
          <Link 
            href={`/brand/${id}/products`}
            className="mt-8 w-full bg-black text-white py-3 px-6 text-center text-sm tracking-wider hover:bg-gray-800 transition-colors"
          >
            VIEW PRODUCTS
          </Link>
        </div>
      </div>
    </div>
  )
} 