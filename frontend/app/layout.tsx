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
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}
