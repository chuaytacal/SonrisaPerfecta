
'use client';

import React from 'react';
import { Group, Rect, Line, Text, Circle, Arrow, Arc, Ellipse } from 'react-konva'; // Static imports
import { ToothAnnotations } from './ToothAnnotations';
import type { DientesMap } from './setting';
import {ShowFaceA, ShowFaceC, ShowFaceB} from './ToothFace';

type ToothAProps = {
  id: number;
  dientes: DientesMap;
  onClick: () => void;
  typeTeeth: any;
  rotated: boolean;
  reflected: boolean;
  numTooth: number;
  scale: number;
  separation: number;
  rangoSelect: { id: number; numTooth: number; jaw: 'superior' | 'inferior' }[];
};

export function ToothA({ id, dientes, onClick, typeTeeth, rotated = false, reflected = false, numTooth, scale = 0.25, separation = 50, rangoSelect }: ToothAProps) {
  const hallazgos = dientes[numTooth] || {};
  const xPos = id * separation;

  return (
    <Group
      key={`tooth-group-${numTooth}-${id}`} x={xPos+30} y={120}
      scaleX={(reflected ? -1 : 1) * scale}
      scaleY={(rotated ? -1 : 1) * scale}
      offsetX={200 / 2}
      offsetY={350 / 2}
    >
      <Group
        onClick={onClick}
        key={`clickable-tooth-${numTooth}`}
      >
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

      <ToothAnnotations hallazgos={hallazgos} rotated={rotated} reflected={reflected} numTooth={numTooth} />

      {rangoSelect?.some(item => Number(item.numTooth) === Number(numTooth)) && (
        <Rect x={0} y={-35} width={200} height={400} fill="rgb(59 130 246 / .5)" opacity={0.5} />
      )}

    </Group>
  );
}

export default ToothA;
