'use client';

import { useEffect, useState } from 'react';
import { StagewiseToolbar } from '@stagewise/toolbar-next';

const stagewiseConfig = {
  plugins: []
};

export default function StagewiseClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render on client and in development
  if (!isClient || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <StagewiseToolbar config={stagewiseConfig} />;
} 