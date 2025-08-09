import '@/styles/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Discovery Studios',
  description: 'Fashion Brand Discovery Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
<<<<<<< Current (Your changes)
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[2000] bg-white border border-black px-3 py-2 text-sm tracking-[0.15em]">Skip to content</a>
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <main id="main-content" className="flex-1 focus:outline-none">
=======
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2">Skip to content</a>
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <main id="main-content" className="flex-1">
>>>>>>> Incoming (Background Agent changes)
            {children}
          </main>
          <Footer />
        </div>
        {/* Toast viewport placeholder */}
        <div id="toast-viewport" aria-live="polite" aria-atomic="true" className="fixed bottom-4 right-4 z-[2000] space-y-2" />
      </body>
    </html>
  )
}
