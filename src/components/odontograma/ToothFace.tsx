
'use client';

import React, { useState }  from 'react';
import { Group, Rect, Line, Text } from 'react-konva'; // Static imports
import type { Hallazgo } from './setting';

export function ShowFaceA() {
  return (
    <Group x={0} y={150}>
      {[[10,10,70,70,70,130,10,190], [190,10,130,70,130,130,190,190], [10,10,190,10,130,70,70,70], [10,190,190,190,130,130,70,130]].map((pts, i) => (
        <Line key={`showfaceA-line-${i}`} points={pts} fill="white" stroke="black" strokeWidth={3} closed />
      ))}
      <Rect x={70} y={70} width={60} height={60} stroke="black" strokeWidth={3} fill="white" />
      {[{x:70,y:70},{x:100,y:70},{x:70,y:100},{x:100,y:100}].map((pos,i) => (
        <Rect key={`showfaceA-rect-${i}`} x={pos.x} y={pos.y} width={30} height={30} stroke="black" strokeWidth={3} fill="white" />
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
            <Line key={`showfaceB-line-${i}`} points={pts} fill="white" stroke="black" strokeWidth={3} closed />
          ))}
          <Rect x={70} y={70} width={60} height={30} stroke="black" strokeWidth={3} fill="white" />
          <Rect x={70} y={100} width={60} height={30} stroke="black" strokeWidth={3} fill="white" />
        </Group>
    );
  }

export function ShowFaceC() {
    return (
        <Group x={0} y={150}>
              {[ 
                [10, 10, 70, 70, 70, 130, 10, 190], 
                [190, 10, 130, 70, 130, 130, 190, 190], 
                [10, 10, 190, 10, 130, 100, 70, 100], 
                [10, 190, 190, 190, 130, 100, 70, 100]
              ].map((pts, i) => (
                <Line key={`showfaceC-line-${i}`} points={pts} fill="white" stroke="black" strokeWidth={3} closed />
              ))}
        </Group>
    );
}

type InteractiveFaceProps = { // Renamed Props to InteractiveFaceProps for clarity
    onSelectCara: (hallazgo: Hallazgo) => void;
};
  
export function InteractiveFace({ onSelectCara }: InteractiveFaceProps) { // Use new prop type name
    const [filled, setFilled] = useState({
      M: false, 
      D: false, 
      O: false, 
      C: false, 
      V: false, 
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
        color: '', // Color will be determined by currentMode in Teeth.tsx
        nombre: caraLabels[key],
      };
  
      onSelectCara(hallazgo);
    };
  
    return (
      <Group x={0} y={0}>
        <Line
          key="interactive-M"
          points={[10, 10, 70, 70, 70, 130, 10, 190]}
          fill={filled.M ? 'hsl(var(--primary))' : 'white'} // Use theme color
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('M')}
          onTap={() => handleClick('M')}
        />
        <Line
          key="interactive-D"
          points={[190, 10, 130, 70, 130, 130, 190, 190]}
          fill={filled.D ? 'hsl(var(--primary))' : 'white'}
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('D')}
          onTap={() => handleClick('D')}
        />
        <Line
          key="interactive-O"
          points={[10, 10, 190, 10, 130, 70, 70, 70]}
          fill={filled.O ? 'hsl(var(--primary))' : 'white'}
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('O')}
          onTap={() => handleClick('O')}
        />
        <Line
          key="interactive-C"
          points={[10, 190, 190, 190, 130, 130, 70, 130]}
          fill={filled.C ? 'hsl(var(--primary))' : 'white'}
          stroke="black"
          strokeWidth={3}
          closed
          onClick={() => handleClick('C')}
          onTap={() => handleClick('C')}
        />
        <Rect
          key="interactive-V"
          x={70}
          y={70}
          width={60}
          height={60}
          stroke="black"
          strokeWidth={3}
          fill={filled.V ? 'hsl(var(--primary))' : 'white'}
          onClick={() => handleClick('V')}
          onTap={() => handleClick('V')}
        />
      </Group>
    );
  }

    