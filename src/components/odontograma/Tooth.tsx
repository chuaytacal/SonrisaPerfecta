// src/components/odontograma/Tooth.tsx
'use client';

import React from 'react';
import { Group as KonvaGroup, Rect, Line, Text, Circle, Arc, Ellipse } from 'react-konva';
import { ToothAnnotations } from './ToothAnnotations';
import type { HallazgosPorDiente } from './setting';
import { ShowFaceA, ShowFaceC, ShowFaceB } from './ToothFace';

type ToothProps = {
  id: number;
  dientes: HallazgosPorDiente;
  onClick: (event: any) => void;
  typeTeeth: number;
  rotated: boolean;
  reflected: boolean;
  numTooth: number;
  scale?: number;
  separation?: number;
  rangoSelect: Array<{ id: number; numTooth: number; jaw: 'superior' | 'inferior' }>;
};

export function Tooth({
  id,
  dientes,
  onClick,
  typeTeeth,
  rotated = false,
  reflected = false,
  numTooth,
  scale = 0.28, // Matched scale from Teeth.tsx
  separation = 55, // Matched separation from Teeth.tsx
  rangoSelect
}: ToothProps) {

  const hallazgosParaEsteDiente = dientes;
  const xPos = id * separation;

  const isSelectedInRange = rangoSelect?.some(item => Number(item.numTooth) === Number(numTooth));

  return (
    <KonvaGroup
      key={`tooth-group-${numTooth}-${id}`}
      x={xPos + (separation / 2)}
      y={120}
      scaleX={(reflected ? -1 : 1) * scale}
      scaleY={(rotated ? -1 : 1) * scale}
      offsetX={100}
      offsetY={175}
      onClick={onClick}
      onTap={onClick}
      hitGraphEnabled={true}
    >
      {/* Tooth Shapes */}
      <KonvaGroup key={`clickable-tooth-shape-${numTooth}`} listening={false}>
        {typeTeeth === 1 && (
          <>
            <ShowFaceA />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [58.5, 140, 100, -30, 144.5, 140];
                return [
                  <Line key={`tooth-${numTooth}-face1-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                  <Line key={`tooth-${numTooth}-face1-line1`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={54} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                  <Line key={`tooth-${numTooth}-face1-line2`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={146} y={65} offsetX={100} offsetY={65} />
                ];
              })()}
            </KonvaGroup>
          </>
        )}
        {typeTeeth === 2 && (
          <>
            <ShowFaceB />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [58.5, 140, 100, -30, 144.5, 140];
                return [
                  <Line key={`tooth-${numTooth}-face2-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </KonvaGroup>
          </>
        )}
        {typeTeeth === 3 && (
          <>
            <ShowFaceB />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [58.5, 140, 100, -30, 144.5, 140];
                return [
                  <Line key={`tooth-${numTooth}-face3-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65} dash={[20, 4]} />,
                  <Line key={`tooth-${numTooth}-face3-line1`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </KonvaGroup>
          </>
        )}
        {typeTeeth === 4 && (
          <>
            <ShowFaceC />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [10, 140, 100, -30, 190, 140];
                return [
                  <Line key={`tooth-${numTooth}-face4-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </KonvaGroup>
          </>
        )}
        {typeTeeth === 5 && (
          <>
            <ShowFaceA />
            <KonvaGroup x={2} y={19}>
              {(() => {
                const base = [77, 140, 120, -30, 166, 140];
                return [
                  <Line key={`tooth-${numTooth}-face5-line0`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65} />,
                  <Line key={`tooth-${numTooth}-face5-line1`} points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </KonvaGroup>
          </>
        )}
      </KonvaGroup>

      <ToothAnnotations hallazgos={hallazgosParaEsteDiente} rotated={rotated} reflected={reflected} numTooth={numTooth} />

      {isSelectedInRange && (
        <Rect x={0} y={-35} width={200} height={400} fill="rgba(59, 130, 246, 0.3)" listening={false} />
      )}
       <Text
            text={String(numTooth)}
            x={100}
            y={-20}
            fontSize={60}
            fill="black"
            align="center"
            verticalAlign="middle"
            offsetX={100/2} 
            offsetY={60/2}
            scaleY={rotated ? -1: 1}
            scaleX={reflected ? -1: 1}
        />
    </KonvaGroup>
  );
}

export default Tooth;
