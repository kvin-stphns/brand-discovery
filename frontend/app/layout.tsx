// frontend/app/layout.tsx
import '@/styles/globals.css';
import type { Metadata } from 'next';

import Providers from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Discovery Studios',
  description: 'Fashion Brand Discovery Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>

        <Providers>
          <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}