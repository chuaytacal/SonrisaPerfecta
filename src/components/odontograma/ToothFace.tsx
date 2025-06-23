
'use client';

import React, { useState }  from 'react';
import { Group, Rect, Line } from 'react-konva';
import type { Hallazgo as HallazgoType, HallazgoCaraCurrent  } from './setting';



type ShowFaceProps = {
  hallazgo: any;
  strokeWidth?: number;
  rotated?: boolean;
  reflected?: boolean;
};

const getFill = (hallazgo: any, cara: string) =>
  hallazgo.LCD?.cara?.[cara]?.color ||
  hallazgo.RD?.cara?.[cara]?.color ||
  'white';

const getStroke = (hallazgo: any, cara: string) =>
  hallazgo.RT?.cara?.[cara]?.color || 'black';

const getStrokeWidth = (hallazgo: any, cara: string, strokeWidth: number) =>
  hallazgo.RT?.cara?.[cara]?.color ? strokeWidth + 7 : strokeWidth;

const GroupWrapper = ({
  children,
  rotated = false,
  reflected = false,
}: {
  children: React.ReactNode;
  rotated?: boolean;
  reflected?: boolean;
}) => (
  <Group
    x={0}
    y={150}
    scaleX={reflected ? -1 : 1}
    scaleY={rotated ? -1 : 1}
    offsetX={reflected ? 200 : 0}
    offsetY={rotated ? 200 : 0}
  >
    {children}
  </Group>
);

// ▶ ShowFaceA
export function ShowFaceA({ hallazgo, strokeWidth = 3, rotated = false, reflected = false }: ShowFaceProps) {
  return (
    <GroupWrapper rotated={rotated} reflected={reflected}>
      <Line points={[10, 10, 70, 70, 70, 130, 10, 190]} fill={getFill(hallazgo, 'M')} stroke={getStroke(hallazgo, 'M')} strokeWidth={getStrokeWidth(hallazgo, 'M', strokeWidth)} closed />
      <Line points={[190, 10, 130, 70, 130, 130, 190, 190]} fill={getFill(hallazgo, 'D')} stroke={getStroke(hallazgo, 'D')} strokeWidth={getStrokeWidth(hallazgo, 'D', strokeWidth)} closed />
      <Line points={[10, 10, 190, 10, 130, 70, 70, 70]} fill={getFill(hallazgo, 'O')} stroke={getStroke(hallazgo, 'O')} strokeWidth={getStrokeWidth(hallazgo, 'O', strokeWidth)} closed />
      <Line points={[10, 190, 190, 190, 130, 130, 70, 130]} fill={getFill(hallazgo, 'C')} stroke={getStroke(hallazgo, 'C')} strokeWidth={getStrokeWidth(hallazgo, 'C', strokeWidth)} closed />
      <Rect x={70} y={70} width={60} height={60} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
      {[{ x: 70, y: 70 }, { x: 100, y: 70 }, { x: 70, y: 100 }, { x: 100, y: 100 }].map((pos, i) => (
        <Rect key={i} x={pos.x} y={pos.y} width={30} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
      ))}
    </GroupWrapper>
  );
}

// ▶ ShowFaceB
export function ShowFaceB({ hallazgo, strokeWidth = 3, rotated = false, reflected = false }: ShowFaceProps) {
  return (
    <GroupWrapper rotated={rotated} reflected={reflected}>
      <Line points={[10, 10, 70, 70, 70, 130, 10, 190]} fill={getFill(hallazgo, 'M')} stroke={getStroke(hallazgo, 'M')} strokeWidth={getStrokeWidth(hallazgo, 'M', strokeWidth)} closed />
      <Line points={[190, 10, 130, 70, 130, 130, 190, 190]} fill={getFill(hallazgo, 'D')} stroke={getStroke(hallazgo, 'D')} strokeWidth={getStrokeWidth(hallazgo, 'D', strokeWidth)} closed />
      <Line points={[10, 10, 190, 10, 130, 70, 70, 70]} fill={getFill(hallazgo, 'O')} stroke={getStroke(hallazgo, 'O')} strokeWidth={getStrokeWidth(hallazgo, 'O', strokeWidth)} closed />
      <Line points={[10, 190, 190, 190, 130, 130, 70, 130]} fill={getFill(hallazgo, 'C')} stroke={getStroke(hallazgo, 'C')} strokeWidth={getStrokeWidth(hallazgo, 'C', strokeWidth)} closed />
      <Rect x={70} y={70} width={60} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
      <Rect x={70} y={100} width={60} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
    </GroupWrapper>
  );
}

// ▶ ShowFaceC
export function ShowFaceC({ hallazgo, strokeWidth = 3, rotated = false, reflected = false }: ShowFaceProps) {
  const existeV = hallazgo.LCD?.cara?.V || hallazgo.RD?.cara?.V || hallazgo.RT?.cara?.V;

  return (
    <GroupWrapper rotated={rotated} reflected={reflected}>
      <Line points={[10, 10, 70, 70, 70, 130, 10, 190]} fill={getFill(hallazgo, 'M')} stroke={getStroke(hallazgo, 'M')} strokeWidth={getStrokeWidth(hallazgo, 'M', strokeWidth)} closed />
      <Line points={[190, 10, 130, 70, 130, 130, 190, 190]} fill={getFill(hallazgo, 'D')} stroke={getStroke(hallazgo, 'D')} strokeWidth={getStrokeWidth(hallazgo, 'D', strokeWidth)} closed />
      <Line points={[10, 10, 190, 10, 130, 100, 70, 100]} fill={getFill(hallazgo, 'O')} stroke={getStroke(hallazgo, 'O')} strokeWidth={getStrokeWidth(hallazgo, 'O', strokeWidth)} closed />
      <Line points={[10, 190, 190, 190, 130, 100, 70, 100]} fill={getFill(hallazgo, 'C')} stroke={getStroke(hallazgo, 'C')} strokeWidth={getStrokeWidth(hallazgo, 'C', strokeWidth)} closed />
      {existeV && (
        <Rect x={65} y={65} width={70} height={70} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
      )}
    </GroupWrapper>
  );
}

// ▶ ShowFaceD      
export function ShowFaceD({ hallazgo, strokeWidth = 3, rotated = false, reflected = false }: ShowFaceProps) {
  return (
    <GroupWrapper rotated={rotated} reflected={reflected}>
      {/* Caras externas */}
      <Line points={[10, 10, 70, 70, 70, 130, 10, 190]} fill={getFill(hallazgo, 'M')} stroke={getStroke(hallazgo, 'M')} strokeWidth={getStrokeWidth(hallazgo, 'M', strokeWidth)} closed />
      <Line points={[190, 10, 130, 70, 130, 130, 190, 190]} fill={getFill(hallazgo, 'D')} stroke={getStroke(hallazgo, 'D')} strokeWidth={getStrokeWidth(hallazgo, 'D', strokeWidth)} closed />
      <Line points={[10, 10, 190, 10, 130, 70, 70, 70]} fill={getFill(hallazgo, 'O')} stroke={getStroke(hallazgo, 'O')} strokeWidth={getStrokeWidth(hallazgo, 'O', strokeWidth)} closed />
      <Line points={[10, 190, 190, 190, 130, 130, 70, 130]} fill={getFill(hallazgo, 'C')} stroke={getStroke(hallazgo, 'C')} strokeWidth={getStrokeWidth(hallazgo, 'C', strokeWidth)} closed />
      
      {/* Cara V dividida */}
      {/* Superior izquierda */}
      <Rect
        x={70}
        y={70}
        width={30}
        height={30}
        fill={getFill(hallazgo, 'V')}
        stroke={getStroke(hallazgo, 'V')}
        strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)}
      />
      {/* Superior derecha */}
      <Rect
        x={100}
        y={70}
        width={30}
        height={30}
        fill={getFill(hallazgo, 'V')}
        stroke={getStroke(hallazgo, 'V')}
        strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)}
      />
      {/* Inferior completa */}
      <Rect
        x={70}
        y={100}
        width={60}
        height={30}
        fill={getFill(hallazgo, 'V')}
        stroke={getStroke(hallazgo, 'V')}
        strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)}
      />
    </GroupWrapper>
  );
}

// ▶ ShowFaceE
export function ShowFaceE({ hallazgo, strokeWidth = 3, rotated = false, reflected = false }: ShowFaceProps) {
  return (
    <GroupWrapper rotated={rotated} reflected={reflected}>
      {/* Caras externas */}
      <Line points={[10, 10, 70, 70, 70, 130, 10, 190]} fill={getFill(hallazgo, 'M')} stroke={getStroke(hallazgo, 'M')} strokeWidth={getStrokeWidth(hallazgo, 'M', strokeWidth)} closed />
      <Line points={[190, 10, 130, 70, 130, 130, 190, 190]} fill={getFill(hallazgo, 'D')} stroke={getStroke(hallazgo, 'D')} strokeWidth={getStrokeWidth(hallazgo, 'D', strokeWidth)} closed />
      <Line points={[10, 10, 190, 10, 130, 70, 70, 70]} fill={getFill(hallazgo, 'O')} stroke={getStroke(hallazgo, 'O')} strokeWidth={getStrokeWidth(hallazgo, 'O', strokeWidth)} closed />
      <Line points={[10, 190, 190, 190, 130, 130, 70, 130]} fill={getFill(hallazgo, 'C')} stroke={getStroke(hallazgo, 'C')} strokeWidth={getStrokeWidth(hallazgo, 'C', strokeWidth)} closed />

      {/* Parte central V dividida */}
      {/* Parte superior: 2 rectángulos */}
      <Rect x={70} y={70} width={30} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
      <Rect x={100} y={70} width={30} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />

      {/* Parte inferior: 3 rectángulos */}
      <Rect x={70} y={100} width={20} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
      <Rect x={90} y={100} width={20} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
      <Rect x={110} y={100} width={20} height={30} fill={getFill(hallazgo, 'V')} stroke={getStroke(hallazgo, 'V')} strokeWidth={getStrokeWidth(hallazgo, 'V', strokeWidth)} />
    </GroupWrapper>
  );
}



type InteractiveFaceProps = {
    onToggleCara: (faceKey: string) => void;
    color: any;
    selectedCaras: Record<string, HallazgoCaraCurrent>;
};

export function InteractiveFace({ onToggleCara, color, selectedCaras }: InteractiveFaceProps) {
    const faceParts = {
        M: { points: [10, 10, 70, 70, 70, 130, 10, 190] },
        D: { points: [190, 10, 130, 70, 130, 130, 190, 190] },
        O: { points: [10, 10, 190, 10, 130, 70, 70, 70] },
        C: { points: [10, 190, 190, 190, 130, 130, 70, 130] },
    };

    return (
      <Group x={0} y={0}>
        {Object.entries(faceParts).map(([key, { points }]) => (
            <Line
                key={`interactive-${key}`}
                points={points}
                fill={selectedCaras[key] ? color : 'white'}
                stroke="black"
                strokeWidth={3}
                closed
                onClick={() => onToggleCara(key)}
                onTap={() => onToggleCara(key)}
            />
        ))}
        <Rect
            key="interactive-V"
            x={70}
            y={70}
            width={60}
            height={60}
            stroke="black"
            strokeWidth={3}
            fill={selectedCaras['V'] ? color : 'white'}
            onClick={() => onToggleCara('V')}
            onTap={() => onToggleCara('V')}
        />
      </Group>
    );
}
