'use client'
import { ReactNode } from 'react'

interface ListLayoutProps {
  title: string
  children: ReactNode
}

const ListLayout = ({ title, children }: ListLayoutProps) => {
  return (
    <div className="pt-[140px] px-8 max-w-[2000px] mx-auto">
      <h1 className="text-2xl tracking-tight font-bold mb-12">{title}</h1>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export default ListLayout 