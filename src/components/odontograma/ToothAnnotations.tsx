'use client';

import React, { useEffect } from 'react';
import { Group, Line, Circle, Rect, Text, Arrow,Arc,Ellipse } from 'react-konva';
import type { HallazgosPorDiente } from './setting';

export function ToothAnnotations(hallazgos: HallazgosPorDiente, rotated: boolean, reflected: boolean, numTooth: any) {

  
  const b = { x: -5, y: 10, width: 210, height: 350 };
  
  return (
    <>
      {/* missing */}
      {hallazgos.PDA && (
        <>
          <Line points={[b.x, b.y, b.x + b.width, b.y + b.height]} stroke={hallazgos.PDA.color} strokeWidth={8} lineCap="round" />
          <Line points={[b.x + b.width, b.y, b.x, b.y + b.height]} stroke={hallazgos.PDA.color} strokeWidth={8} lineCap="round" />
        </>
      )}

      {/* fracture */}
      {hallazgos.FD && (
        <Line points={[b.x + b.width, 45, b.x + 10, 345]} stroke={hallazgos.FD.color} strokeWidth={8} lineCap="round" 
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 200: 0)}
        />
      )}
      {/* Superficie Desgastada*/}
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

      {/* espigo */}
      {hallazgos.M && (
        <>
          <Rect x={70} y={220} width={60} height={60} stroke={hallazgos.M.color} strokeWidth={8} />
          <Line points={[100, 20, 100, 220]} stroke={hallazgos.M.color} strokeWidth={8} lineCap="round" />
        </>
      )}
      {/* tempCrown con Line en lugar de Rect */}
      {hallazgos.C && (
        <>
          {/* línea superior */}
          <Line points={[10, 160, 190, 160]} stroke={hallazgos.C.color} strokeWidth={8} />
          {/* línea derecha */}
          <Line points={[190, 160, 190, 340]} stroke={hallazgos.C.color} strokeWidth={8} />
          {/* línea inferior */}
          <Line points={[190, 340, 10, 340]} stroke={hallazgos.C.color} strokeWidth={8} />
          {/* línea izquierda */}
          <Line points={[10, 340, 10, 160]} stroke={hallazgos.C.color} strokeWidth={8} />
        </>
      )}
      {/* tempCrown con Line en lugar de Rect */}
      {hallazgos.CT && (
        <>
          {/* línea superior */}
          <Line points={[10, 160, 190, 160]} stroke={hallazgos.CT.color} strokeWidth={8} />
          {/* línea derecha */}
          <Line points={[190, 160, 190, 340]} stroke={hallazgos.CT.color} strokeWidth={8} />
          {/* línea inferior */}
          <Line points={[190, 340, 10, 340]} stroke={hallazgos.CT.color} strokeWidth={8} />
          {/* línea izquierda */}
          <Line points={[10, 340, 10, 160]} stroke={hallazgos.CT.color} strokeWidth={8} />
        </>
      )}

      {/* sealant */}
      {hallazgos.S && (
        <>
          <Line points={[70, 250, 130, 250]} stroke={hallazgos.S.color} strokeWidth={20} lineCap="round" />
          <Line points={[100, 220, 100, 280]} stroke={hallazgos.S.color} strokeWidth={20} lineCap="round" />
        </>
      )}

      {/* pulpotomy */}
      {hallazgos.PP && (
        <Circle x={100} y={250} radius={38} fill={hallazgos.PP.color} stroke={hallazgos.PP.color} strokeWidth={8} />
      )}

      {/* treatment */}
      {hallazgos.TC && (
        <Line points={[100, 10, 100, 220]} stroke={hallazgos.TC.color} strokeWidth={8} lineCap="round" />
      )}

      {/* numGroup */}
      <Group x={30} y={-220}
      scaleX={(reflected ? -1 : 1)}
      offsetX={(reflected? 140: 0)}
           
      >
        <Circle
          x={65}
          y={44}
          radius={60} // antes era 36
          fill="transparent"
          stroke={hallazgos.GE ? hallazgos.GE.color : undefined}
          strokeWidth={8}
        />
        <Text
          x={50}
          y={45}
          text={numTooth}
          fontSize={70} // antes era 32
          fontFamily="Calibri"
          fill="black"
          offsetX={20}
          offsetY={30}
          scaleY={rotated ? -1 : 1}
        />
      </Group>

      {/* giroversion derecha*/}
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

      {/* giroversion izquierda */}
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

      {/* intruded */}
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

      {/* extruded */}
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

      {/* Aparato Ortodóntico Fijo */}
      {hallazgos?.AOF?.grupo && (
        <>
          {/* Primero: si el diente actual es el primero en el grupo */}
          {hallazgos.AOF.grupo[0] === numTooth && (
            <Group x={0} y={-85}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 200: 0)}
            >
              {/* Línea guía roja en el centro */}
              <Line points={[40, 30, 190, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />

              {[10].map((x, i) => (
                <React.Fragment key={i}>
                  {/* Rect más pequeño y más centrado */}
                  <Rect
                    x={x - 5}
                    y={10}
                    width={40}
                    height={40}
                    stroke={hallazgos.AOF.color}
                    fill="transparent"
                    strokeWidth={5}
                  />

                  {/* Cruz (+) más pequeña */}
                  <Line points={[x + 15, 18, x + 15, 42]} stroke={hallazgos.AOF.color} strokeWidth={5} />

                  {/* Horizontal más corta y más centrada */}
                  <Line points={[x + 5, 30, x + 25, 30]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                </React.Fragment>
              ))}
            </Group>
          )}

          {/* Segundo: si el diente actual es el último en el grupo */}
          {hallazgos.AOF.grupo[hallazgos.AOF.grupo.length - 1] === numTooth && (
            <Group x={-30} y={-85}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 255: 0)}
            >
              {/* Línea guía roja en el centro */}
              <Line points={[40, 30, 180, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />

              {[183].map((x, i) => (
                <React.Fragment key={i}>
                  {/* Rect más pequeño y más centrado */}
                  <Rect
                    x={x - 5}
                    y={10}
                    width={40}
                    height={40}
                    stroke={hallazgos.AOF.color}
                    fill="transparent"
                    strokeWidth={5}
                  />

                  {/* Cruz (+) más pequeña */}
                  <Line points={[x + 15, 18, x + 15, 42]} stroke={hallazgos.AOF.color} strokeWidth={5} />

                  {/* Horizontal más corta y más centrada */}
                  <Line points={[x + 5, 30, x + 25, 30]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                </React.Fragment>
              ))}
            </Group>
          )}

          {/* Tercero: si el grupo tiene solo 1 diente */}
          {hallazgos.AOF.grupo.length === 1 && (
            <Group x={0} y={-85}>
              {/* Línea guía roja en el centro */}
              <Line points={[40, 30, 180, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />

              {[10, 152].map((x, i) => (
                <React.Fragment key={i}>
                  {/* Rect más pequeño y más centrado */}
                  <Rect
                    x={x - 5}
                    y={10}
                    width={40}
                    height={40}
                    stroke={hallazgos.AOF.color}
                    fill="transparents"
                    strokeWidth={5}
                  />

                  {/* Cruz (+) más pequeña */}
                  <Line points={[x + 15, 18, x + 15, 42]} stroke={hallazgos.AOF.color} strokeWidth={5} />

                  {/* Horizontal más corta y más centrada */}
                  <Line points={[x + 5, 30, x + 25, 30]} stroke={hallazgos.AOF.color} strokeWidth={5} />
                </React.Fragment>
              ))}
            </Group>
          )}

          {/* Finalmente: si el diente actual NO es primero ni último en el grupo */}
          {hallazgos.AOF.grupo[0] !== numTooth &&
            hallazgos.AOF.grupo[hallazgos.AOF.grupo.length - 1] !== numTooth && (
              <Group x={-30} y={-85}>
                {/* Línea guía roja en el centro */}
                <Line points={[40, 30, 220, 30]} stroke={hallazgos.AOF.color} strokeWidth={10} />
              </Group>
          )}

        </>
      )}

      {/* Proteis Dental Parcial Fija*/}
      {hallazgos?.PDPF?.grupo && (
        <>
          {/* Primero: si el diente actual es el primero en el grupo */}
          {hallazgos.PDPF.grupo[0] === numTooth && (
            <Group x={150} y={-105}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? -100: 0)}
            >
              {/* Líneas en forma de └ pero en el lado izquierdo y arriba */}
              {/* Primero la línea horizontal hacia la izquierda */}
              <Line points={[40, 30, -140, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />

              {/* Después la línea vertical hacia abajo en el extremo izquierdo */}
              <Line points={[-140, 30, -140, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
          </Group>

          )}

          {/* Segundo: si el diente actual es el último en el grupo */}
          {hallazgos.PDPF.grupo?.at?.(-1) === numTooth && (
            <Group x={-30} y={-105}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 260: 0)}
            >
              {/* Líneas en forma de ┐ */}
              <Line points={[40, 30, 220, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              <Line points={[220, 30, 220, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
            </Group>
          )}

          {/* Tercero: si el grupo tiene solo 1 diente */}
          {hallazgos.PDPF.grupo.length === 1 && (
            <Group x={0} y={-105}
            scaleX={(reflected ? -1 : 1)}
            offsetX={(reflected? 140: 0)}
            >
              {/* Parte de arriba del cuadrado */}
              <Line points={[40, 30, 180, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              {/* Lado izquierdo */}
              <Line points={[40, 30, 40, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              {/* Lado derecho */}
              <Line points={[180, 30, 180, 100]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
            </Group>
          )}


          {/* Finalmente: si el diente actual NO es primero ni último en el grupo */}
          {hallazgos.PDPF.grupo[0] !== numTooth &&
            hallazgos.PDPF.grupo?.at?.(-1) !== numTooth && (
              <Group x={-30} y={-105}>
                {/* Línea guía roja en el centro */}
                <Line points={[40, 30, 220, 30]} stroke={hallazgos.PDPF.color} strokeWidth={10} />
              </Group>
          )}

        </>
      )}


      {/* Aparato Ortodóntico Removible */}
      {hallazgos.AOR && (
        <Group x={0} y={-85}>
          <Line
            points={[
              0, 60, // base izquierda
              95, 10, // pico en el centro
              190, 60 // base derecha
            ]}
            stroke={hallazgos.AOR.color}
            strokeWidth={10}
            tension={0} // sin curva, más anguloso
          />
        </Group>
      )}

      {/*Edentulo Total*/}
      {hallazgos.ET && (
        <Group x={5} y={220}>
          <Line
            points={[
              0, 30, 
              190, 30 
            ]}
            stroke={hallazgos.ET.color}
            strokeWidth={10}
          />
        </Group>
      )}

      {/*Pieza Dentaria en Clavija*/ }
      {hallazgos.PDC && (
        <Group x={5} y={-130}>
          <Line
            points={[
              0, 30,
              190, 30
            ]}
            stroke={hallazgos.PDC.color}
            strokeWidth={8}
          />
          <Line
            points={[
              0, 50,
              190, 50
            ]}
            stroke={hallazgos.PDC.color}
            strokeWidth={8}
          />
        </Group>
      )}

      {/*Proteis Dental Parcial Removible*/}
      {hallazgos.PDPR  && (
        <Group x={5} y={-130}>
          <Line
            points={[
              0, 30,
              190, 30
            ]}
            stroke={hallazgos.PDPR.color}
            strokeWidth={8}
          />
          <Line
            points={[
              0, 60,
              190, 60
            ]}
            stroke={hallazgos.PDPR.color}
            strokeWidth={8}
          />
        </Group>
      )}


      {/* plug */}
      {hallazgos.PDCL && (
        <Group x={0} y={-70}>
          <Line points={[100, 0, 60, 50, 140, 50]} stroke={hallazgos.PDCL.color} strokeWidth={8} closed />
        </Group>
      )}

      {/* rash */}
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

      {/* Diastema )( */}
      {hallazgos?.D?.grupo?.[0] === numTooth && (
        <Group x={200} y={250} 
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected?-200: 0)}
        >
        {/* Semicírculo izquierdo — curva hacia adentro */}
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
      {/* Diastema )( */}
      {hallazgos?.D?.grupo?.[1] === numTooth && (
        <Group x={0} y={250} 
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 200: 0)}
        >

        {/* Semicírculo derecho — curva hacia adentro */}
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

      {/* Pieza Dentaria Supernumeraria*/}
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
      {/* Transposicion Dentaria */}
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
      {/* Transposicion Dentaria*/}
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

      {/* Fusion*/}
      {hallazgos?.F?.grupo?.[0] === numTooth && (
        <Group x={30} y={-180}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 140: 0)}
        >
          <Ellipse
            x={102}
            y={34}
            radiusX={120} // más grande en horizontal
            radiusY={60} // más pequeña en vertical
            fill="transparent"
            stroke={hallazgos.F.color}
            strokeWidth={8}
          />
        </Group>
      )}
      {/* Fusion*/}
      {hallazgos?.F?.grupo?.[1] === numTooth && (
        <Group x={30} y={-180}
        scaleX={(reflected ? -1 : 1)}
        offsetX={(reflected? 140: 0)}
        >
          <Ellipse
            x={42}
            y={34}
            radiusX={120} // más grande en horizontal
            radiusY={60} // más pequeña en vertical
            fill="transparent"
            stroke={hallazgos.F.color}
            strokeWidth={8}
          />
        </Group>
      )}
    </>
  );
}
