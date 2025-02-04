const Footer = () => {
  const links = ['Login', 'About', 'Contact', 'FAQ', 'Privacy']

  return (
    <footer className="border-t border-black">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-5 divide-x divide-black">
          {links.map((link) => (
            <div key={link} className="py-6">
              <a
                href="#"
                className="block text-center text-sm tracking-wider hover:text-gray-600 transition-colors"
              >
                {link}
              </a>
            </div>
          ))}
        </div>
        <div className="text-center py-4 text-xs border-t border-black">
          © 2024 Discovery Studios
        </div>
      </div>
    </footer>
  )
}

export default Footer 