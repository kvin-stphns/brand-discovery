import { X } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: string[]
}

const MobileMenu = ({ isOpen, onClose, items }: MobileMenuProps) => {
  return (
    <div 
      className={`fixed inset-0 bg-white z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-black">
        <h1 className="text-lg tracking-tight font-bold">
          <span className="block mobile:inline">DISCOVERY</span>
          <span className="block mobile:inline mobile:ml-1">STUDIOS</span>
        </h1>
        <button 
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col h-[calc(100vh-88px)] pt-12">
        {items.map((item, index) => (
          <a
            key={item}
            href="#"
            className={`flex-1 flex items-center justify-center text-sm tracking-[0.25em] hover:text-gray-500 transition-colors
              ${index < items.length - 1 ? 'border-b border-black' : ''}`}
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  )
}

export default MobileMenu 