import dynamic from 'next/dynamic';

const Stage = dynamic(() => import('react-konva').then(mod => mod.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => mod.Layer), { ssr: false });
const Circle = dynamic(() => import('react-konva').then(mod => mod.Circle), { ssr: false });

import React, { useEffect, useState } from 'react';

  // Get window dimensions for the stage if running on the client
  // Ensure this code only runs client-side by checking isClient or typeof window
  const stageWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600;
  const stageHeight = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400;

function Canvas() {
  const [isClient, setIsClient] = useState(false);

  // Asegurarnos de que solo se ejecute en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p>Loading...</p>; // Asegurarse de que el componente se renderice solo en el cliente
  }

  return (
    <Stage width={stageWidth > 0 ? stageWidth : 600} height={stageHeight > 0 ? stageHeight : 400}>
      <Layer>
        <Circle x={200} y={100} radius={50} fill="green" />
      </Layer>
    </Stage>
  );
}

export default Canvas;