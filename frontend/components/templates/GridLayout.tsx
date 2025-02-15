'use client'
import { ReactNode } from 'react'

interface GridLayoutProps {
  title: string
  children: ReactNode
}

const GridLayout = ({ title, children }: GridLayoutProps) => {
  return (
    <div className="pt-[140px] px-8 max-w-[2000px] mx-auto">
      <h1 className="text-2xl tracking-tight font-bold mb-12">{title}</h1>
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-8">
        {children}
      </div>
    </div>
  )
}

export default GridLayout 