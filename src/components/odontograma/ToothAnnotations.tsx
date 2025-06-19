
'use client';

import React from 'react';
import { Group, Line, Circle, Rect, Text, Arrow, Arc, Ellipse } from 'react-konva';
import type { HallazgosPorDiente } from './setting';

interface ToothAnnotationsProps {
  hallazgos: HallazgosPorDiente;
  rotated: boolean;
  reflected: boolean;
  numTooth: number;
}

export function ToothAnnotations({ hallazgos, rotated, reflected, numTooth }: ToothAnnotationsProps) {
  const b = { x: -5, y: 10, width: 210, height: 350 };

  if (typeof hallazgos !== 'object' || hallazgos === null) {
    return null;
  }

  return (
    <>
      {hallazgos.PDA && (
        <>
          <Line points={[b.x, b.y, b.x + b.width, b.y + b.height]} stroke={hallazgos.PDA.color} strokeWidth={8} lineCap="round" />
          <Line points={[b.x + b.width, b.y, b.x, b.y + b.height]} stroke={hallazgos.PDA.color} strokeWidth={8} lineCap="round" />
        </>
      )}

      {hallazgos.FD && (
        <Line points={[b.x + b.width, 45, b.x + 10, 345]} stroke={hallazgos.FD.color} strokeWidth={8} lineCap="round"
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 200: 0)}
        />
      )}
      {hallazgos.SD && (
        <Group x={5} y={130}>
        <Line
          points={[
            0, 30,
            190, 30
          ]}
          stroke={hallazgos.SD.color}
          strokeWidth={10}
        />
      </Group>
      )}

      {hallazgos.M && (
        <>
          <Rect x={70} y={220} width={60} height={60} stroke={hallazgos.M.color} strokeWidth={8} />
          <Line points={[100, 20, 100, 220]} stroke={hallazgos.M.color} strokeWidth={8} lineCap="round" />
        </>
      )}
      {hallazgos.C && (
        <>
          <Line points={[10, 160, 190, 160]} stroke={hallazgos.C.color} strokeWidth={8} />
          <Line points={[190, 160, 190, 340]} stroke={hallazgos.C.color} strokeWidth={8} />
          <Line points={[190, 340, 10, 340]} stroke={hallazgos.C.color} strokeWidth={8} />
          <Line points={[10, 340, 10, 160]} stroke={hallazgos.C.color} strokeWidth={8} />
        </>
      )}
      {hallazgos.CT && (
        <>
          <Line points={[10, 160, 190, 160]} stroke={hallazgos.CT.color} strokeWidth={8} />
          <Line points={[190, 160, 190, 340]} stroke={hallazgos.CT.color} strokeWidth={8} />
          <Line points={[190, 340, 10, 340]} stroke={hallazgos.CT.color} strokeWidth={8} />
          <Line points={[10, 340, 10, 160]} stroke={hallazgos.CT.color} strokeWidth={8} />
        </>
      )}

      {hallazgos.S && (
        <>
          <Line points={[70, 250, 130, 250]} stroke={hallazgos.S.color} strokeWidth={20} lineCap="round" />
          <Line points={[100, 220, 100, 280]} stroke={hallazgos.S.color} strokeWidth={20} lineCap="round" />
        </>
      )}

      {hallazgos.PP && (
        <Circle x={100} y={250} radius={38} fill={hallazgos.PP.color} stroke={hallazgos.PP.color} strokeWidth={8} />
      )}

      {hallazgos.TC && (
        <Line points={[100, 10, 100, 220]} stroke={hallazgos.TC.color} strokeWidth={8} lineCap="round" />
      )}

      <Group x={30} y={-220}
      scaleX={(reflected ? -1 : 1)}
      offsetX={(reflected? 140: 0)}
      >
        <Circle
          x={65}
          y={44}
          radius={60}
          fill="transparent"
          stroke={hallazgos.GE ? hallazgos.GE.color : undefined}
          strokeWidth={8}
        />
        <Text
          x={50}
          y={45}
          text={String(numTooth)}
          fontSize={70}
          fontFamily="Calibri"
          fill="black"
          offsetX={20}
          offsetY={30}
          scaleY={rotated ? -1 : 1}
        />
      </Group>

      {hallazgos.GI && hallazgos.GI.direccion === 'derecha' && (
        <Arrow
          scaleX={(reflected ? -1 : 1)}
          offsetX={(reflected ? 200 : 0)}
          points={[0, 360, 100, 410, 200, 360]}
          pointerLength={20}
          pointerWidth={20}
          tension={0.5}
          stroke={hallazgos.GI.color}
          strokeWidth={8}
          fill={hallazgos.GI.color}
        />
      )}

      {hallazgos.GI && hallazgos.GI.direccion === 'izquierda' && (
        <Arrow
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 200: 0)}
          points={[200, 360, 100, 410, 0, 360]}
          pointerLength={20}
          pointerWidth={20}
          tension={0.5}
          stroke={hallazgos.GI.color}
          strokeWidth={8}
          fill={hallazgos.GI.color}
        />
      )}

      {hallazgos.PDI && (
        <Arrow
          points={[100, 410, 100, 400, 100, 360]}
          pointerLength={15}
          pointerWidth={30}
          tension={0.5}
          stroke={hallazgos.PDI.color}
          strokeWidth={8}
          fill={hallazgos.PDI.color}
        />
      )}

      {hallazgos.PDEX && (
        <Arrow
          points={[100, 410, 100, 360, 100, 410]}
          pointerLength={15}
          pointerWidth={30}
          tension={0.5}
          stroke={hallazgos.PDEX.color}
          strokeWidth={8}
          fill={hallazgos.PDEX.color}
        />
      )}

      {hallazgos?.AOF?.grupo && (
        <>
          {hallazgos.AOF.grupo[0] === numTooth && (
            <Group x={0} y={-85}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 200: 0)}
            >
              <Line points={[40, 30, 190, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />
              {[10].map((x, i) => (
                <React.Fragment key={`AOF-start-${i}`}>
                  <Rect
                    x={x - 5}
                    y={10}
                    width={40}
                    height={40}
                    stroke={hallazgos.AOF.color}
                    fill="transparent"
                    strokeWidth={5}
                  />
                  <Line points={[x + 15, 18, x + 15, 42]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                  <Line points={[x + 5, 30, x + 25, 30]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                </React.Fragment>
              ))}
            </Group>
          )}

          {hallazgos.AOF.grupo[hallazgos.AOF.grupo.length - 1] === numTooth && (
            <Group x={-30} y={-85}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 255: 0)}
            >
              <Line points={[40, 30, 180, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />
              {[183].map((x, i) => (
                <React.Fragment key={`AOF-end-${i}`}>
                  <Rect
                    x={x - 5}
                    y={10}
                    width={40}
                    height={40}
                    stroke={hallazgos.AOF.color}
                    fill="transparent"
                    strokeWidth={5}
                  />
                  <Line points={[x + 15, 18, x + 15, 42]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                  <Line points={[x + 5, 30, x + 25, 30]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                </React.Fragment>
              ))}
            </Group>
          )}

          {hallazgos.AOF.grupo.length === 1 && hallazgos.AOF.grupo[0] === numTooth && (
            <Group x={0} y={-85}>
              <Line points={[40, 30, 180, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />
              {[10, 152].map((x, i) => (
                <React.Fragment key={`AOF-single-${i}`}>
                  <Rect
                    x={x - 5}
                    y={10}
                    width={40}
                    height={40}
                    stroke={hallazgos.AOF.color}
                    fill="transparent"
                    strokeWidth={5}
                  />
                  <Line points={[x + 15, 18, x + 15, 42]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                  <Line points={[x + 5, 30, x + 25, 30]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                </React.Fragment>
              ))}
            </Group>
          )}

          {hallazgos.AOF.grupo[0] !== numTooth &&
            hallazgos.AOF.grupo[hallazgos.AOF.grupo.length - 1] !== numTooth && (
              <Group x={-30} y={-85}>
                <Line points={[40, 30, 220, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />
              </Group>
          )}
        </>
      )}

      {hallazgos?.PDPF?.grupo && (
        <>
          {hallazgos.PDPF.grupo[0] === numTooth && (
            <Group x={150} y={-105}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? -100: 0)}
            >
              <Line points={[40, 30, -140, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              <Line points={[-140, 30, -140, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
          </Group>
          )}

          {hallazgos.PDPF.grupo[hallazgos.PDPF.grupo.length - 1] === numTooth && (
            <Group x={-30} y={-105}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 260: 0)}
            >
              <Line points={[40, 30, 220, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              <Line points={[220, 30, 220, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
            </Group>
          )}

          {hallazgos.PDPF.grupo.length === 1 && hallazgos.PDPF.grupo[0] === numTooth && (
            <Group x={0} y={-105}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 140: 0)}
            >
              <Line points={[40, 30, 180, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              <Line points={[40, 30, 40, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              <Line points={[180, 30, 180, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
            </Group>
          )}

          {hallazgos.PDPF.grupo[0] !== numTooth &&
            hallazgos.PDPF.grupo[hallazgos.PDPF.grupo.length - 1] !== numTooth && (
              <Group x={-30} y={-105}>
                <Line points={[40, 30, 220, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              </Group>
          )}
        </>
      )}

      {hallazgos.AOR && (
        <Group x={0} y={-85}>
          <Line
            points={[0, 60, 95, 10, 190, 60]}
            stroke={hallazgos.AOR.color}
            strokeWidth={10}
            tension={0}
          />
        </Group>
      )}

      {hallazgos.ET && (
        <Group x={5} y={220}>
          <Line
            points={[0, 30, 190, 30]}
            stroke={hallazgos.ET.color}
            strokeWidth={10}
          />
        </Group>
      )}

      {hallazgos.PDC && (
        <Group x={5} y={-130}>
          <Line
            points={[0, 30, 190, 30]}
            stroke={hallazgos.PDC.color}
            strokeWidth={8}
          />
          <Line
            points={[0, 50, 190, 50]}
            stroke={hallazgos.PDC.color}
            strokeWidth={8}
          />
        </Group>
      )}

      {hallazgos.PDPR  && (
        <Group x={5} y={-130}>
          <Line
            points={[0, 30, 190, 30]}
            stroke={hallazgos.PDPR.color}
            strokeWidth={8}
          />
          <Line
            points={[0, 60, 190, 60]}
            stroke={hallazgos.PDPR.color}
            strokeWidth={8}
          />
        </Group>
      )}

      {hallazgos.PDCL && hallazgos.PDCL.color && (
        <Group x={0} y={-70}>
          <Line points={[100, 0, 60, 50, 140, 50]} stroke={hallazgos.PDCL.color} strokeWidth={8} closed />
        </Group>
      )}

      {hallazgos.PDE && (
        <Group x={80} y={180} listening={false}>
          <Line
            points={[50, -150, -10, -100, 50, -50, -10, 0, 50, 50, 10, 80]}
            stroke={hallazgos.PDE.color}
            strokeWidth={12}
            lineCap="round"
            lineJoin="round"
          />
          <Line points={[5, 75, 10, 90, 0, 85]} stroke={hallazgos.PDE.color} fill={hallazgos.PDE.color} strokeWidth={12} closed />
        </Group>
      )}

      {hallazgos?.D?.grupo?.[0] === numTooth && (
        <Group x={200} y={250}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected?-200: 0)}
        >
        <Arc
          x={-40}
          y={0}
          innerRadius={40}
          outerRadius={40}
          angle={180}
          rotation={270}
          stroke={hallazgos.D.color}
          strokeWidth={8}
          fillEnabled={false}
        />
        </Group>
      )}
      {hallazgos?.D?.grupo?.[1] === numTooth && (
        <Group x={0} y={250}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 200: 0)}
        >
        <Arc
          x={40}
          y={0}
          innerRadius={40}
          outerRadius={40}
          angle={180}
          rotation={90}
          stroke={hallazgos.D.color}
          strokeWidth={8}
          fillEnabled={false}
        />
        </Group>
      )}

      {hallazgos?.PDS?.grupo?.[0] === numTooth && (
        <Group x={200} y={10}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? -200: 0)}
        >
          <Circle
            x={0}
            y={0}
            radius={30}
            stroke={hallazgos.PDS.color}
            strokeWidth={10}
            fillEnabled={false}
          />
          <Text
            x={-10}
            y={-10}
            text="S"
            fontSize={30}
            fill={hallazgos.PDS.color}
          />
        </Group>
      )}
      {hallazgos?.TD?.grupo?.[0] === numTooth && (
        <Group x={50} y={-380}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 100: 0)}
        >
          <Arrow
            points={[0, 360, 100, 310, 200, 360]}
            pointerLength={20}
            pointerWidth={20}
            tension={0.5}
            stroke={hallazgos.TD.color}
            strokeWidth={8}
            fill={hallazgos.TD.color}
          />
        </Group>
      )}
      {hallazgos?.TD?.grupo?.[1] === numTooth && (
        <Group x={-40} y={-380}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 280: 0)}
        >
          <Arrow
            points={[200, 360, 100, 310, 0, 360]}
            pointerLength={20}
            pointerWidth={20}
            tension={0.5}
            stroke={hallazgos.TD.color}
            strokeWidth={8}
            fill={hallazgos.TD.color}
          />
        </Group>
      )}

      {hallazgos?.F?.grupo?.[0] === numTooth && (
        <Group x={30} y={-180}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 140: 0)}
        >
          <Ellipse
            x={102}
            y={34}
            radiusX={120}
            radiusY={60}
            fill="transparent"
            stroke={hallazgos.F.color}
            strokeWidth={8}
          />
        </Group>
      )}
      {hallazgos?.F?.grupo?.[1] === numTooth && (
        <Group x={30} y={-180}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 140: 0)}
        >
          <Ellipse
            x={42}
            y={34}
            radiusX={120}
            radiusY={60}
            fill="transparent"
            stroke={hallazgos.F.color}
            strokeWidth={8}
          />
        </Group>
      )}
    </>
  );
}
