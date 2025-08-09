'use client'

export function GridCardSkeleton() {
  return (
    <div className="h-[500px] animate-pulse bg-black/5 border border-black" />
  )
}

export function ListRowSkeleton() {
  return (
    <div className="h-12 animate-pulse bg-black/5" />
  )
}
