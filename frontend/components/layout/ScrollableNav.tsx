import { ChevronRight } from 'lucide-react'

interface ScrollableNavProps {
  items: string[]
}

const ScrollableNav = ({ items }: ScrollableNavProps) => {
  return (
    <div className="relative tablet:flex desktop:hidden items-center w-[30vw]">
      {/* Scrollable container */}
      <div className="overflow-x-auto scrollbar-hide w-full">
        <div className="flex space-x-12">
          {items.map((item, index) => (
            <a
              key={item}
              href="#"
              className={`text-sm tracking-[0.25em] whitespace-nowrap hover:text-gray-500 transition-colors py-1 ${
                index === items.length - 1 ? 'pr-24' : ''
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
      
      {/* Gradient fade and arrow */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
        <div className="h-full w-16 bg-gradient-to-r from-transparent to-white" />
        <div className="bg-white pl-2">
          <ChevronRight className="w-4 h-4 text-black/60" />
        </div>
      </div>
    </div>
  )
}

export default ScrollableNav 