// src/components/odontograma/Teeth.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle } from 'react-konva';

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

  // Get window dimensions for the stage if running on the client
  // Ensure this code only runs client-side by checking isClient or typeof window
  const stageWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600;
  const stageHeight = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400;


  return (
    <div className="w-full p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">Odontograma Simplificado (Debug)</h2>
      {/* Stage is only rendered on the client and after isClient is true */}
      <Stage width={stageWidth > 0 ? stageWidth : 600} height={stageHeight > 0 ? stageHeight : 400}>
        <Layer>
          <Circle x={100} y={100} radius={50} fill="blue" />
          <Circle x={250} y={150} radius={70} fill="red" draggable />
        </Layer>
      </Stage>
    </div>
  );
}
