// src/components/odontograma/Teeth.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('../canvas'), {
  ssr: false,
});

// Simplified version of Teeth component for debugging
export function Teeth() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a placeholder or null on the server and during initial client-side render
    return <p className="text-center py-10 text-muted-foreground">Cargando Odontograma...</p>;
  }

  return (
    <div className="w-full p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">Odontograma Simplificado (Debug)</h2>
      {/* Stage is only rendered on the client and after isClient is true */}
      <Canvas />
    </div>
  );
}
