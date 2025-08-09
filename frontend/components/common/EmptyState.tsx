'use client'

import Link from 'next/link'

export default function EmptyState({ message, href, cta }: { message: string; href: string; cta: string }) {
  return (
    <div className="p-12 text-center">
      <p className="text-sm tracking-[0.15em] text-black/60 mb-4">{message}</p>
      <Link href={href} className="inline-block px-6 py-3 border border-black hover:bg-black hover:text-white text-sm tracking-[0.15em]">
        {cta}
      </Link>
    </div>
  )
}
