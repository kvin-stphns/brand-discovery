'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-[160px] px-8 text-center">
      <h1 className="text-2xl tracking-[0.05em] font-bold">PAGE NOT FOUND</h1>
      <p className="text-sm tracking-[0.15em] text-black/60 max-w-md">
<<<<<<< Current (Your changes)
<<<<<<< Current (Your changes)
        The page you are looking for does not exist or has moved.
=======
        The page you are looking for doesn&apos;t exist or has moved.
>>>>>>> Incoming (Background Agent changes)
=======
        The page you are looking for doesn&apos;t exist or has moved.
>>>>>>> Incoming (Background Agent changes)
      </p>
      <Link href="/discover" className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors text-sm tracking-[0.15em]">
        BACK TO DISCOVER
      </Link>
    </div>
  )
}
