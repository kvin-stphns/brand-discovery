'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect } from 'react'
import { Analytics } from '@/lib/analytics'

export default function DiscoverPage() {
  useEffect(() => {
    Analytics.view('discover')
  }, [])

  return (
    <CategoryGrid 
      items={[]}
      title="DISCOVER"
      isDiscoverPage={true}
    />
  )
} 