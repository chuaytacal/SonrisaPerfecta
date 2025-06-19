'use client';

import React from 'react';
import { Group, Rect, Line, Text, Circle, Arrow, Arc, Ellipse } from 'react-konva'; // Added Circle, Arrow, Arc, Ellipse
import { ToothAnnotations } from './ToothAnnotations';
import type { DientesMap } from './setting'; // Removed unused 'SettingSupperJaw', 'selectMode'
import {ShowFaceA, ShowFaceC, ShowFaceB} from './ToothFace';

type ToothAProps = {
  id: number;
  dientes: DientesMap;
  onClick: () => void;
  typeTeeth: any;
  rotated: any;
  reflected: any;
  numTooth: number;
  scale: any;
  separation: any;
  rangoSelect: { id: number; numTooth: number; jaw: 'superior' | 'inferior' }[];
};

export function ToothA({ id, dientes, onClick, typeTeeth, rotated  =false, reflected = false, numTooth, scale = 0.25,separation = 50, rangoSelect }: ToothAProps) {
  const hallazgos = dientes[numTooth] || {}; // Initialize as empty object if no findings
  const xPos = id * separation;

  // Props for Konva components (Group, Line, Circle, Rect, Text, Arrow, Arc, Ellipse)
  // These will be implicitly passed to ToothAnnotations if it uses them directly via JSX
  const konvaShapes = { Group, Line, Circle, Rect, Text, Arrow, Arc, Ellipse };


  return (
    <Group 
      key={id} x={xPos+30} y={120}
      scaleX={(reflected ? -1 : 1) * scale} // escala y reflexión combinadas
      scaleY={(rotated ? -1 : 1) * scale}   // escala y rotación combinadas  
      offsetX={200 / 2}
      offsetY={350 / 2}
    >
      <Group 
        onClick={onClick}
      >
        {typeTeeth==1 && (
          <>
            <ShowFaceA/>

            {/* Triángulos */}
            <Group x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={54} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                  <Line key="2" points={base} fill="white" stroke="black" strokeWidth={3} closed x={146} y={65} offsetX={100} offsetY={65} />
                ];
              })()}
            </Group>
          </>  
        )}
        {typeTeeth==2 && (
          <>
            {/* Diente */}
            <ShowFaceB/>

            {/* Triángulos */}
            <Group x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </Group>
          </>  
        )}
        {typeTeeth==3 && (
          <>
            {/* Diente */}
            <ShowFaceB/>

            {/* Triángulos */}
            <Group x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65} dash={[20, 4]} />,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </Group>
          </>  
        )}
        {typeTeeth==4 && (
          <>
            <ShowFaceC/>

            {/* Triángulos */}
            <Group x={0} y={19}>
              {(() => {
                const base = [10,140,100,-30,190,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </Group>
          </>  
        )}
        {typeTeeth==5 && (
          <>
            {/* Diente */}
            <ShowFaceA/>

            {/* Triángulos */}
            <Group x={2} y={19}>
              {(() => {
                const base = [77,140,120,-30,166,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65}/>,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </Group>
          </>  
        )}
      </Group>

      {/* Anotaciones */}
      {ToothAnnotations(hallazgos, rotated, reflected, numTooth)}

      {rangoSelect?.some(item =>{ return Number(item.numTooth) == Number(numTooth)} ) && (
        <Rect x={0} y={-35} width={200} height={400} fill="rgb(59 130 246 / .5)" opacity={0.5} />
      )}
  
</Group>
  );
}

export default ToothA;