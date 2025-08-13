import '@/styles/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/Footer'
import { ToastViewport } from '@/lib/toast'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/web3/config'

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
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2">Skip to content</a>
        <WagmiProvider config={wagmiConfig}>
          <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <ToastViewport />
        </WagmiProvider>
      </body>
    </html>
  )
}
