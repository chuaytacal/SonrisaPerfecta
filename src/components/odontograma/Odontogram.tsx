// src/components/odontograma/Teeth.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stage, Layer, Group as KonvaGroup } from 'react-konva'; // Renamed Group to KonvaGroup to avoid conflict if any
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight,Trash2, FileSearch, X } from "lucide-react";
import {ToothA, ToothB} from './Tooth';
import { Badge } from '@/components/ui/badge';
import { DientesMap, SettingSupperJaw, SettingsLowerJaw, Hallazgos, CurrentMode, Hallazgo as HallazgoType, ToothDisplays, OpenModeal, DetalleHallazgo } from './setting';
import { InteractiveFace } from './ToothFace';
import { Button } from '@/components/ui/button'; // For modal buttons
import TreatmentPlanTable from './TreatmentPlan';
import Teeth from './Teeth';

export function Odontogram() {
  const [isClient, setIsClient] = useState(false);
  const [dientesData, setDientesData] = useState<DientesMap>({});

  const handleDientesChange = (nuevoEstado: DientesMap) => {
    setDientesData(nuevoEstado); 
  };  

  //variables de configuracion
  const [typeTooth, setTypeTooth] = useState('Permanent');
  const [scalaTeeth, setScalaTeeth] = useState({x:900, y:770, moveTeethX: 8, moveTeethY: 60});
  const [scalaTooth, setScalaTooth] = useState({scale:0.24, separation:47});

 useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    typeTooth === 'Primary'?setScalaTeeth({x:650, y:450, moveTeethX: 100,moveTeethY: 40}):setScalaTeeth({x:760, y:550, moveTeethX: 0, moveTeethY: 60}); 
  }, [typeTooth]);

  if (!isClient) {
    return <p className="text-center py-10 text-muted-foreground">Cargando Odontograma...</p>;
  }

  return (
    <div className='md:gap-6 p-2 md:p-4 bg-card rounded-lg shadow bg-white'>
      <div className="flex items-center justify-between p-3 ">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">Dentición</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTypeTooth('Primary')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        typeTooth === 'Primary'
                          ? 'bg-blue-100 text-blue-600 font-medium'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Primaria
                    </button>
                    <button
                      onClick={() => setTypeTooth('Permanent')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        typeTooth === 'Permanent'
                          ? 'bg-blue-100 text-blue-600 font-medium'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Permanente
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <span className="text-xs text-gray-500">Mal estado</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-500">Buen estado</span>
                  </div>
                </div>
      </div>
      <div className="flex flex-col md:flex-row items-start gap-4">
        <Teeth
          scalaTeeth={scalaTeeth}
          scalaTooth={scalaTooth}
          typeTooth={typeTooth}
          onChangeDientes={handleDientesChange}
        />
      </div>
      <div>
        <TreatmentPlanTable dientesMap={dientesData}/>
      </div>
    </div>
  );
}
