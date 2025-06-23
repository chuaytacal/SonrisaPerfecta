// src/components/odontograma/Tooth.tsx
'use client';

import React, {useState} from 'react';
import { Group as KonvaGroup, Rect, Line, Text, Circle, Arc, Ellipse } from 'react-konva';
import { ToothAnnotations } from './ToothAnnotations';
import type { HallazgosPorDiente, ToothDisplays } from './setting';
import {ShowFaceA, ShowFaceC, ShowFaceB,ShowFaceD, ShowFaceE} from './ToothFace';

type ToothProps = {
  id: number;
  dientes: HallazgosPorDiente;
  onClick: (event: any) => void;
  onDisplayClick: (findings: ToothDisplays[], event: any) => void;
  typeTeeth: number;
  rotated: boolean;
  reflected: boolean;
  numTooth: number;
  scale?: number;
  separation?: number;
  rangoSelect: Array<{ id: number; numTooth: number; jaw: 'superior' | 'inferior' }>;
  display:any;
};

export function ToothA({
  id,
  dientes,
  onClick,
  onDisplayClick,
  typeTeeth,
  rotated = false,
  reflected = false,
  numTooth,
  scale = 0.28,
  separation = 55,
  rangoSelect,
  display
}: ToothProps) {

  const hallazgosParaEsteDiente = dientes;
  const xPos = id * separation;

  const isSelectedInRange = rangoSelect?.some(item => Number(item.numTooth) === Number(numTooth));
  const strokeWidth = 4;

  const [isHovered, setIsHovered] = useState(false);
  const findings = display[numTooth] || [];
  const firstFinding = findings.length > 0 ? findings[0] : null;
  const otherFindingsCount = findings.length > 1 ? findings.length - 1 : 0;

  return (
    <KonvaGroup
      key={`tooth-group-${numTooth}-${id}`}
      x={xPos + (separation / 2)}
      y={120}
      scaleX={(reflected ? -1 : 1) * scale}
      scaleY={(rotated ? -1 : 1) * scale}
      offsetX={100}
      offsetY={175}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <KonvaGroup
        scaleX={reflected ? -1 : 1}
        offsetX={reflected ? 200 : 0}
        onClick={(e) => onDisplayClick(findings, e)}
        onTap={(e) => onDisplayClick(findings, e)}
        onMouseEnter={e => {
            const container = e.target.getStage()?.container();
            if (container && findings.length > 0) container.style.cursor = 'pointer';
        }}
        onMouseLeave={e => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'default';
        }}
        >
          <Rect
            x={0}
            y={-450}
            width={190}
            height={150}
            fill="#E5E7EB"
          />
          {firstFinding && (
             <Text
                x={80}
                y={-380}
                text={firstFinding.abreviatura}
                fontSize={70}
                fontFamily="Calibri"
                fill={firstFinding.color}
                offsetX={20}
                offsetY={30}
                scaleY={rotated ? -1 : 1}
              />
          )}
          {otherFindingsCount > 0 && (
             <Text
                x={130}
                y={-380}
                text={`+${otherFindingsCount}`}
                fontSize={50}
                fontFamily="Calibri"
                fill="hsl(var(--primary))"
                offsetX={20}
                offsetY={30}
                scaleY={rotated ? -1 : 1}
              />
          )}
      </KonvaGroup>
      {/* Tooth Shapes */}
      <KonvaGroup key={`clickable-tooth-shape-${numTooth}`} onClick={onClick} onTap={onClick} >
        {typeTeeth === 1 && (
          <>
            <ShowFaceA hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
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
            <ShowFaceB hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
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
            <ShowFaceB hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
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
            <ShowFaceC hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
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
            <ShowFaceA hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
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

      <ToothAnnotations hallazgos={hallazgosParaEsteDiente} rotated={rotated} reflected={reflected} numTooth={numTooth} baseStrokeWidth={8}/>

      {isSelectedInRange && (
        <Rect x={0} y={-35} width={200} height={400} fill="rgba(59, 130, 246, 0.3)"  />
      )}
      {isHovered && (
        <Rect
          x={0}
          y={-35}
          width={200}
          height={400}
          fill="rgb(59 130 246 / .5)"
          opacity={0.5}
          onClick={onClick}
          onTap={onClick}
        />
      )}
    </KonvaGroup>
  );
}
export function ToothB({
  id,
  dientes,
  onClick,
  onDisplayClick,
  typeTeeth,
  rotated = false,
  reflected = false,
  numTooth,
  scale = 0.28,
  separation = 55,
  rangoSelect,
  display
  }: ToothProps) {
    const hallazgosParaEsteDiente = dientes;
  const xPos = id * separation;

  const isSelectedInRange = rangoSelect?.some(item => Number(item.numTooth) === Number(numTooth));
  const strokeWidth = 4;

  const [isHovered, setIsHovered] = useState(false);
  const findings = display[numTooth] || [];
  const firstFinding = findings.length > 0 ? findings[0] : null;
  const otherFindingsCount = findings.length > 1 ? findings.length - 1 : 0;

  return (
    <KonvaGroup 
      key={id} x={xPos+30} y={120}
      scaleX={(reflected ? -1 : 1) * scale}
      scaleY={(rotated ? -1 : 1) * scale}
      offsetX={200 / 2}
      offsetY={350 / 2}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <KonvaGroup
        scaleX={reflected ? -1 : 1}
        offsetX={reflected ? 200 : 0}
        onClick={(e) => onDisplayClick(findings, e)}
        onTap={(e) => onDisplayClick(findings, e)}
        onMouseEnter={e => {
            const container = e.target.getStage()?.container();
            if (container && findings.length > 0) container.style.cursor = 'pointer';
        }}
        onMouseLeave={e => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'default';
        }}
      >
          <Rect
            x={0}
            y={-450}
            width={190}
            height={150}
            fill="#E5E7EB"
          />
          {firstFinding && (
             <Text
                x={80}
                y={-380}
                text={firstFinding.abreviatura}
                fontSize={70}
                fontFamily="Calibri"
                fill={firstFinding.color}
                offsetX={20}
                offsetY={30}
                scaleY={rotated ? -1 : 1}
              />
          )}
          {otherFindingsCount > 0 && (
             <Text
                x={130}
                y={-380}
                text={`+${otherFindingsCount}`}
                fontSize={50}
                fontFamily="Calibri"
                fill="hsl(var(--primary))"
                offsetX={20}
                offsetY={30}
                scaleY={rotated ? -1 : 1}
              />
          )}
      </KonvaGroup>
      <KonvaGroup onClick={onClick} onTap={onClick}>
        {typeTeeth==1 && (
          <>
            <ShowFaceA hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={54} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                  <Line key="2" points={base} fill="white" stroke="black" strokeWidth={3} closed x={146} y={65} offsetX={100} offsetY={65} />
                ];
              })()}
            </KonvaGroup>
          </>  
        )}
        {typeTeeth==2 && (
          <>
            <ShowFaceB hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </KonvaGroup>
          </>  
        )}
        {typeTeeth==3 && (
          <>
            <ShowFaceB hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65} dash={[20, 4]} />,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </KonvaGroup>
          </>  
        )}
        {typeTeeth==4 && (
          <>
            <ShowFaceC hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [10,140,100,-30,190,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                ];
              })()}
            </KonvaGroup>
          </>  
        )}
        {typeTeeth==5 && (
          <>
            <ShowFaceA hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
            <KonvaGroup x={2} y={19}>
              {(() => {
                const base = [77,140,120,-30,166,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65}/>,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </KonvaGroup>
          </>  
        )}
        {typeTeeth==6 && (
          <>
            <ShowFaceD hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
            <KonvaGroup x={0} y={19}>
              {(() => {
                const base = [58.5,140,100,-30,144.5,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={100} y={65} offsetX={100} offsetY={65} />,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={54} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                  <Line key="2" points={base} fill="white" stroke="black" strokeWidth={3} closed x={146} y={65} offsetX={100} offsetY={65} />
                ];
              })()}
            </KonvaGroup>
          </>  
        )}
        {typeTeeth==7 && (
          <>
            <ShowFaceE hallazgo={hallazgosParaEsteDiente} strokeWidth={strokeWidth} rotated={rotated} reflected={reflected} />
            <KonvaGroup x={2} y={19}>
              {(() => {
                const base = [77,140,120,-30,166,140];
                return [
                  <Line key="0" points={base} fill="white" stroke="black" strokeWidth={3} closed x={120} y={65} offsetX={100} offsetY={65}/>,
                  <Line key="1" points={base} fill="white" stroke="black" strokeWidth={3} closed x={74} y={65} offsetX={100} offsetY={65} scaleX={-1} />,
                ];
              })()}
            </KonvaGroup>
          </>  
        )}
      </KonvaGroup>
      <ToothAnnotations hallazgos={hallazgosParaEsteDiente} rotated={rotated} reflected={reflected} numTooth={numTooth}  baseStrokeWidth={8}/>

      {isSelectedInRange && (
        <Rect x={0} y={-35} width={200} height={400} fill="rgba(59, 130, 246, 0.3)"  />
      )}
      {isHovered && (
        <Rect
          x={0}
          y={-35}
          width={200}
          height={400}
          fill="rgb(59 130 246 / .5)"
          opacity={0.5}
          onClick={onClick}
          onTap={onClick}
        />
      )}
</KonvaGroup>
  );
}
export default ToothA;
