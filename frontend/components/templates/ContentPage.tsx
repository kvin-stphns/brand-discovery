'use client'

interface ContentPageProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function ContentPage({ title, subtitle, children }: ContentPageProps) {
  return (
    <section className="w-full min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-white z-30">
        <div className="mt-[155px] max-w-[2000px] mx-auto">
          <div className="px-8">
            <h2 className="text-black text-2xl tracking-[0.05em] font-bold">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-xs tracking-[0.15em] text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="max-w-[2000px] mx-auto border-t border-black mt-12" />
      </div>

      <div className="mt-[285px] max-w-[1600px] mx-auto px-8">
        {children}
      </div>
    </section>
  )
} 