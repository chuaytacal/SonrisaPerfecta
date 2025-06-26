
'use client';

import React from 'react';
import type { DientesMap, OdontogramDataItem } from './setting';
import TreatmentPlanTable from './TreatmentPlan';
import Teeth from './Teeth';

interface OdontogramProps {
  dientesData: DientesMap;
  onDientesChange: (newDientesMap: DientesMap) => void;
  onOdontogramDataChange: (odontogramData: OdontogramDataItem[]) => void;
  odontogramType: 'Permanent' | 'Primary';
}

export function Odontogram({ dientesData, onDientesChange, odontogramType, onOdontogramDataChange }: OdontogramProps) {
  
  const scalaTeeth = odontogramType === 'Primary' 
    ? {x:650, y:450, moveTeethX: 100, moveTeethY: 40}
    : {x:760, y:550, moveTeethX: 0, moveTeethY: 60};

  const scalaTooth = {scale:0.24, separation:47};

  return (
    <div className='md:gap-6 p-2 md:p-4 bg-card rounded-lg shadow bg-white'>
      <div className="flex items-center justify-between p-3 ">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-500">Dentición: <span className="font-bold text-gray-700">{odontogramType}</span></span>
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
          typeTooth={odontogramType}
          onChangeDientes={onDientesChange}
          dientes={dientesData}
        />
      </div>
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 px-1">Plan de Tratamiento</h3>
        <TreatmentPlanTable
          dientesMap={dientesData}
          odontogramType={odontogramType}
          onOdontogramDataChange={onOdontogramDataChange}
        />
      </div>
    </div>
  );
}
