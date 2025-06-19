'use client';

import React, { useState }  from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import type { Hallazgo } from './setting';

export function ShowFaceA() {
  
  return (
    <Group x={0} y={150}>
      {[[10,10,70,70,70,130,10,190], [190,10,130,70,130,130,190,190], [10,10,190,10,130,70,70,70], [10,190,190,190,130,130,70,130]].map((pts, i) => (
        <Line key={i} points={pts} fill="white" stroke="black" strokeWidth={3} closed />
      ))}
      <Rect x={70} y={70} width={60} height={60} stroke="black" strokeWidth={3} fill="white" />
      {[{x:70,y:70},{x:100,y:70},{x:70,y:100},{x:100,y:100}].map((pos,i) => (
        <Rect key={i} x={pos.x} y={pos.y} width={30} height={30} stroke="black" strokeWidth={3} fill="white" />
      ))}
    </Group>
  );
}

export function ShowFaceB() {
  
    return (
        <Group x={0} y={150}>
          {/* Diente base (estructura) */}
          {[ 
            [10, 10, 70, 70, 70, 130, 10, 190], 
            [190, 10, 130, 70, 130, 130, 190, 190], 
            [10, 10, 190, 10, 130, 70, 70, 70], 
            [10, 190, 190, 190, 130, 130, 70, 130]
          ].map((pts, i) => (
            <Line key={i} points={pts} fill="white" stroke="black" strokeWidth={3} closed />
          ))}

          {/* Reemplazo de los 4 cuadrados por 2 rectángulos horizontales */}
          {/* Rectángulo superior */}
          <Rect x={70} y={70} width={60} height={30} stroke="black" strokeWidth={3} fill="white" />
          {/* Rectángulo inferior */}
          <Rect x={70} y={100} width={60} height={30} stroke="black" strokeWidth={3} fill="white" />
        </Group>

    );
  }

export function ShowFaceC() {
  
    return (
        <Group x={0} y={150}>
              {/* Diente base (estructura) */}
              {[ 
                [10, 10, 70, 70, 70, 130, 10, 190], 
                [190, 10, 130, 70, 130, 130, 190, 190], 
                [10, 10, 190, 10, 130, 100, 70, 100], 
                [10, 190, 190, 190, 130, 100, 70, 100]
              ].map((pts, i) => (
                <Line key={i} points={pts} fill="white" stroke="black" strokeWidth={3} closed />
              ))}


        </Group>
    );
}

type Props = {
    onSelectCara: (hallazgo: Hallazgo) => void;
  };
  
  export function InteractiveFace({ onSelectCara }: Props) {
    const [filled, setFilled] = useState({
      M: false, // Mesial
      D: false, // Distal
      O: false, // Oclusal/Incisal
      C: false, // Cervical
      V: false, // Vestibular/Lingual
    });
  
    const [locked, setLocked] = useState(false);
  
    const caraLabels: Record<keyof typeof filled, string> = {
      M: 'Mesial',
      D: 'Distal',
      O: 'Oclusal/Incisal',
      C: 'Cervical',
      V: 'Vestibular/Lingual',
    };
  
    const handleClick = (key: keyof typeof filled) => {
      if (locked) return;
  
      setFilled((prev) => ({ ...prev, [key]: true }));
      setLocked(true);
  
      const hallazgo: Hallazgo = {
        tipo: key,
        abreviatura: key,
        color: '',
        nombre: caraLabels[key],
      };
  
      onSelectCara(hallazgo);
    };
  
    return (
      <Group x={0} y={0}>
        {/* M - Mesial (izquierda) */}
        <Line
          points={[10, 10, 70, 70, 70, 130, 10, 190]}
          fill={filled.M ? 'red' : 'white'}
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('M')}
        />
        {/* D - Distal (derecha) */}
        <Line
          points={[190, 10, 130, 70, 130, 130, 190, 190]}
          fill={filled.D ? 'red' : 'white'}
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('D')}
        />
        {/* O - Oclusal/Incisal (arriba) */}
        <Line
          points={[10, 10, 190, 10, 130, 70, 70, 70]}
          fill={filled.O ? 'red' : 'white'}
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('O')}
        />
        {/* C - Cervical (abajo) */}
        <Line
          points={[10, 190, 190, 190, 130, 130, 70, 130]}
          fill={filled.C ? 'red' : 'white'}
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('C')}
        />
        {/* V - Vestibular/Lingual (centro) */}
        <Rect
          x={70}
          y={70}
          width={60}
          height={60}
          stroke="black"
          strokeWidth={3}
          fill={filled.V ? 'red' : 'white'}
          onClick={() => handleClick('V')}
        />
      </Group>
    );
  }