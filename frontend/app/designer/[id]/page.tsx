'use client'
import Image from 'next/image'
import Link from 'next/link'
import { brandTypes } from '@/types/gridItems'

interface PageProps {
  params: {
    id: string
  }
}

export default function DesignerPage({ params }: PageProps) {
  const { id } = params
  const brandType = brandTypes[0] // For static demo, will be dynamic later
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Designer Image Section */}
        <div className="relative aspect-square">
          <Image
            src="/placeholders/product-2.jpg"
            alt={`Designer ${id}`}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Designer Info Section */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Designer {id}</h1>
            <p className="text-sm text-gray-600 tracking-wide">{brandType} Designer</p>
            <p className="text-sm leading-relaxed">
              An innovative designer known for pushing boundaries in contemporary fashion.
            </p>
          </div>
          
          <Link 
            href={`/designer/${id}/collections`}
            className="mt-8 w-full bg-black text-white py-3 px-6 text-center text-sm tracking-wider hover:bg-gray-800 transition-colors"
          >
            VIEW COLLECTIONS
          </Link>
        </div>
      </div>
    </div>
  )
} 