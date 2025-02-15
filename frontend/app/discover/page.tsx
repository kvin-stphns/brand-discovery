'use client'
import GridLayout from '@/components/templates/GridLayout'
import Image from 'next/image'

// Placeholder data
const items = Array(12).fill(null).map((_, i) => ({
  id: `item-${i}`,
  title: 'Discovery Item',
  image: `/placeholders/discover-${(i % 4) + 1}.jpg`
}))

export default function DiscoverPage() {
  return (
    <GridLayout title="DISCOVER">
      {items.map((item) => (
        <div key={item.id} className="group cursor-pointer">
          <div className="aspect-[3/4] relative mb-4 bg-gray-100">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-opacity group-hover:opacity-90"
            />
          </div>
          <p className="text-sm tracking-[0.25em]">{item.title}</p>
        </div>
      ))}
    </GridLayout>
  )
} 