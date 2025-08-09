'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-[160px] px-8 text-center">
      <h1 className="text-2xl tracking-[0.05em] font-bold">PAGE NOT FOUND</h1>
      <p className="text-sm tracking-[0.15em] text-black/60 max-w-md">
        The page you are looking for doesn\'t exist or has moved.
      </p>
      <Link href="/discover" className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors text-sm tracking-[0.15em]">
        BACK TO DISCOVER
      </Link>
    </div>
  )
}
