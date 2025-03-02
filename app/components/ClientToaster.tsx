// ClientToaster.tsx
"use client";

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

export default function ClientToaster() {
  const [position, setPosition] = useState('top-center');

  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth < 768 ? 'top-center' : 'bottom-right');
    };

    updatePosition(); // Run on mount
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  return <Toaster position={position} />;
}
