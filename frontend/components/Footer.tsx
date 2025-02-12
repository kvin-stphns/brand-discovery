const Footer = () => {
  return (
    <footer className="py-12 bg-white text-center">
      <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
        <a href="#" className="text-gray-500 hover:text-black transition">Login</a>
        <a href="#" className="text-gray-500 hover:text-black transition">About</a>
        <a href="#" className="text-gray-500 hover:text-black transition">Contact</a>
        <a href="#" className="text-gray-500 hover:text-black transition">FAQ</a>
        <a href="#" className="text-gray-500 hover:text-black transition">Privacy</a>
      </div>
      <p className="mt-8 text-gray-400 text-sm">© 2024 Discovery Studios</p>
    </footer>
  )
}

export default Footer