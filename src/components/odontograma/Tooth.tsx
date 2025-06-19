
'use client';

import React from 'react';
import { Group, Rect, Line, Text, Circle, Arrow, Arc, Ellipse } from 'react-konva';
import { ToothAnnotations } from './ToothAnnotations';
import type { HallazgosPorDiente } from './setting';
import {ShowFaceA, ShowFaceC, ShowFaceB} from './ToothFace';

type ToothProps = {
  id: number;
  dientes: HallazgosPorDiente;
  onClick: (event: any) => void; // event es el evento de Konva
  typeTeeth: any;
  rotated: boolean;
  reflected: boolean;
  numTooth: number;
  scale: number;
  separation: number;
  rangoSelect: { id: number; numTooth: number; jaw: 'superior' | 'inferior' }[];
};

export function Tooth({ id, dientes, onClick, typeTeeth, rotated = false, reflected = false, numTooth, scale = 0.25, separation = 50, rangoSelect }: ToothProps) {
  const hallazgos = dientes; 
  const xPos = id * separation;

  return (
    <Group
      key={`tooth-group-${numTooth}-${id}`} x={xPos + (separation / 2)} y={120}
      scaleX={(reflected ? -1 : 1) * scale}
      scaleY={(rotated ? -1 : 1) * scale}
      offsetX={100} 
      offsetY={175} 
      onClick={onClick} // El evento onClick se pasa directamente al Group principal
      onTap={onClick} // Para dispositivos táctiles
      hitGraphEnabled={true} // Asegura que el grupo sea clickeable
    >
      {/* Formas del diente - estas deben ser clickeables si son parte de la detección del clic */}
      <Group key={`clickable-tooth-shape-${numTooth}`} listening={false}> {/* Hacemos que las formas internas no escuchen eventos para que el Group padre los maneje */}
        {typeTeeth==1 && (
          <>
            <ShowFaceA/>
            <Group x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key={`tooth-${numTooth}-face1-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                  <Line key={`tooth-${numTooth}-face1-line1`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={54} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                  <Line key={`tooth-${numTooth}-face1-line2`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={146} y={65} offsetX={100} offsetY={65} />
                ];
              })()}
            </Group>
          </>
        )}
        {typeTeeth==2 && (
          <>
            <ShowFaceB/>
            <Group x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key={`tooth-${numTooth}-face2-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </Group>
          </>
        )}
        {typeTeeth==3 && (
          <>
            <ShowFaceB/>
            <Group x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key={`tooth-${numTooth}-face3-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65} dash={[20, 4]} />,
                  <Line key={`tooth-${numTooth}-face3-line1`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </Group>
          </>
        )}
        {typeTeeth==4 && (
          <>
            <ShowFaceC/>
            <Group x={0} y={19}>
              {(() => {
                const base = [10,140,100,-30,190,140];
                return [
                  <Line key={`tooth-${numTooth}-face4-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </Group>
          </>
        )}
        {typeTeeth==5 && (
          <>
            <ShowFaceA/>
            <Group x={2} y={19}>
              {(() => {
                const base = [77,140,120,-30,166,140];
                return [
                  <Line key={`tooth-${numTooth}-face5-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65}/>,
                  <Line key={`tooth-${numTooth}-face5-line1`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </Group>
          </>
        )}
      </Group>

      {/* Las anotaciones no deberían ser clickeables por defecto, a menos que tengan su propio manejo */}
      <ToothAnnotations hallazgos={hallazgos} rotated={rotated} reflected={reflected} numTooth={numTooth} />

      {/* El rectángulo de selección de rango no debería interferir con el clic del diente */}
      {rangoSelect?.some(item => Number(item.numTooth) === Number(numTooth)) && (
        <Rect x={0} y={-35} width={200} height={400} fill="rgb(59 130 246 / .5)" opacity={0.5} listening={false} />
      )}
    </Group>
  );
}

export default Tooth;
