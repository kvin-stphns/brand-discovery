import Link from 'next/link'

const Footer = () => {
  const footerLinks = [
    { label: 'SUBMISSIONS', href: '/submissions' },
    { label: 'ABOUT', href: '/about' },
    { label: 'CONTACT', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'PRIVACY', href: '/privacy' },
    { 
      label: <>LOGIN /<br />SIGN UP</>, 
      href: '/login',
      className: 'hidden tablet:block' 
    }
  ]

  return (
    <footer className="w-full bg-gray-100">
      {/* Grid layout for footer links */}
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-6 border-t border-black">
        {footerLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            aria-label={(typeof link.label === 'string' ? link.label : 'Login / Sign Up') as string}
            className={`relative h-[200px] border-r border-black border-b border-black group last:border-r-0 tablet:last:border-r tablet:[&:nth-child(3)]:border-r-0 desktop:last:border-r-0 desktop:[&:nth-child(3)]:border-r hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 ${link.className || ''}`}
          >
            <span className="absolute top-8 left-8 text-sm tracking-[0.25em] text-black/60 group-hover:text-black transition-colors duration-200">
              {link.label}
            </span>
          </Link>
        ))}
        {/* Mobile/Tablet Login Link */}
        <Link
          href="/login"
          className="relative h-[200px] border-r border-black border-b border-black group tablet:hidden hover:bg-gray-200 active:bg-gray-300 transition-all duration-200"
        >
          <span className="absolute top-8 left-8 text-sm tracking-[0.25em] text-black/60 group-hover:text-black transition-colors duration-200">
            LOGIN<br />SIGN UP
          </span>
        </Link>
      </div>

      {/* Copyright section */}
      <div className="border-b border-black hover:bg-gray-200 transition-colors duration-200">
        <div className="p-8 text-sm text-black/60 text-center">
          © 2024 Discovery Studios
        </div>
      </div>
    </footer>
  )
}

export default Footer