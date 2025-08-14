// frontend/app/providers.tsx
'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/web3/config';
import { ToastViewport } from '@/lib/toast';

export default function Providers({ children }: { children: ReactNode }) {
  // React Query v5 client (memoized once)
  const [client] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        {children}
        <ToastViewport />
      </QueryClientProvider>
    </WagmiProvider>
  );
}