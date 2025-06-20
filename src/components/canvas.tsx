import { Stage, Layer, Circle } from 'react-konva';

  // Get window dimensions for the stage if running on the client
  // Ensure this code only runs client-side by checking isClient or typeof window
  const stageWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600;
  const stageHeight = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400;

function Canvas() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Circle x={200} y={100} radius={50} fill="green" />
      </Layer>
    </Stage>
  );
}

export default Canvas;