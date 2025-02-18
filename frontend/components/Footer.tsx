import Link from 'next/link'

const Footer = () => {
  const footerLinks = [
    { label: 'LOGIN', href: '/login' },
    { label: 'ABOUT', href: '/about' },
    { label: 'CONTACT', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'PRIVACY', href: '/privacy' }
  ]

  return (
    <footer className="w-full">
      {/* Grid layout for footer links */}
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 border-t border-black">
        {footerLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="relative h-[200px] border-r border-black border-b border-black group last:border-r-0 tablet:last:border-r tablet:[&:nth-child(3)]:border-r-0 desktop:last:border-r-0 desktop:[&:nth-child(3)]:border-r"
          >
            <span className="absolute top-8 left-8 text-sm tracking-[0.25em] text-black/60 group-hover:text-black transition-colors">
              {link.label}
            </span>
          </Link>
        ))}
        {/* Ghost grid item to maintain layout */}
        <div className="desktop:hidden h-[200px] border-b border-black"></div>
      </div>

      {/* Copyright section */}
      <div className="border-b border-black">
        <div className="p-8 text-sm text-black/60 text-center">
          © 2024 Discovery Studios
        </div>
      </div>
    </footer>
  )
}

export default Footer