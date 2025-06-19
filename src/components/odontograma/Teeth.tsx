
'use client';

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle } from 'react-konva';

// Simplified version of Teeth component
export function Teeth() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p className="text-center py-10 text-muted-foreground">Cargando Odontograma...</p>;
  }

  // Get window dimensions for the stage if running on the client
  const stageWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600; // Default width
  const stageHeight = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400; // Default height


  return (
    <div className="w-full p-4 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">Odontograma Simplificado</h2>
      {isClient && ( // Ensure Stage is only rendered on the client
        <Stage width={stageWidth > 0 ? stageWidth : 600} height={stageHeight > 0 ? stageHeight : 400}>
          <Layer>
            <Circle x={100} y={100} radius={50} fill="blue" />
            <Circle x={250} y={150} radius={70} fill="red" draggable />
          </Layer>
        </Stage>
      )}
       {!isClient && ( // Fallback or loading state for SSR or pre-hydration
         <div style={{ width: '600px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
           Cargando canvas...
         </div>
       )}
    </div>
  );
}

// If your page.tsx still expects a default export for some reason (though the dynamic import suggests named):
// export default Teeth;
