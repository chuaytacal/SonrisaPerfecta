
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Group as KonvaGroup } from 'react-konva';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Tooth from './Tooth';
import type { DientesMap, Hallazgo as HallazgoType, ToothDisplays, DetalleHallazgo } from './setting';
import { SettingSupperJaw, SettingsLowerJaw, Hallazgos } from './setting';

const TOOTH_WIDTH = 55; // Ancho estimado de cada diente en el canvas para posicionar divs
const TOOTH_NUMBER_DISPLAY_HEIGHT = 30;
const HALLAZGO_ABBREV_DISPLAY_HEIGHT = 20;

export function Teeth() {
  const [isClient, setIsClient] = useState(false);
  const [dientes, setDientes] = useState<DientesMap>({});
  const [toothDisplays, setToothDisplays] = useState<Record<number, ToothDisplays>>({});

  const [selectedToothNumber, setSelectedToothNumber] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  
  const stageRefUpper = useRef<any>(null);
  const stageRefLower = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToothClick = useCallback((toothNumber: number, event: any) => {
    setSelectedToothNumber(toothNumber);
    
    const stage = event.target.getStage();
    if (stage) {
      const pointerPosition = stage.getPointerPosition();
      const stageContainer = stage.container();
      if (pointerPosition && stageContainer) {
        const stageRect = stageContainer.getBoundingClientRect();
        setDropdownPosition({
          top: stageRect.top + pointerPosition.y + window.scrollY,
          left: stageRect.left + pointerPosition.x + window.scrollX,
        });
      } else {
        // Fallback si no se puede obtener la posición exacta
        const clickedToothDiv = document.getElementById(`tooth-num-${toothNumber}`);
        if (clickedToothDiv) {
            const rect = clickedToothDiv.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
        }
      }
    }
    setDropdownOpen(true);
  }, []);

  const handleSelectHallazgo = useCallback((hallazgoDefinition: HallazgoType, selectedColor?: string, selectedDetalle?: DetalleHallazgo) => {
    if (selectedToothNumber === null) return;

    const { tipo, denominacion, abreviatura, color: hallazgoColorDef } = hallazgoDefinition;
    const effectiveColor = selectedColor || hallazgoColorDef || '#000000'; // Negro por defecto

    const newHallazgoData: HallazgoType = {
      ...hallazgoDefinition,
      color: effectiveColor,
      detalle: selectedDetalle ? [selectedDetalle] : (hallazgoDefinition.detalle || undefined),
    };

    setDientes(prevDientes => ({
      ...prevDientes,
      [selectedToothNumber]: {
        ...(prevDientes[selectedToothNumber] || {}),
        [tipo]: newHallazgoData,
      },
    }));

    setToothDisplays(prevDisplays => ({
      ...prevDisplays,
      [selectedToothNumber]: { 
        abreviatura: selectedDetalle ? selectedDetalle.abreviatura : (abreviatura || tipo), 
        color: effectiveColor 
      },
    }));

    setDropdownOpen(false);
    setSelectedToothNumber(null);
  }, [selectedToothNumber]);

  if (!isClient) {
    return <p className="text-center py-10 text-muted-foreground">Cargando Odontograma...</p>;
  }

  const renderToothRow = (jawSettings: any[], isUpperJaw: boolean, stageRef: React.RefObject<any>) => {
    return (
      <div className="flex flex-col items-center">
        {/* Fila para abreviaturas de hallazgos */}
        <div className="flex justify-center mb-1" style={{ height: `${HALLAZGO_ABBREV_DISPLAY_HEIGHT}px` }}>
          {jawSettings.map((setting) => (
            <div
              key={`abrev-${setting.number}`}
              className="flex items-center justify-center text-xs font-semibold"
              style={{ 
                width: `${TOOTH_WIDTH}px`, 
                color: toothDisplays[setting.number]?.color || 'hsl(var(--foreground))'
              }}
            >
              {toothDisplays[setting.number]?.abreviatura}
            </div>
          ))}
        </div>

        {/* Fila para números de dientes */}
        <div className="flex justify-center" style={{ height: `${TOOTH_NUMBER_DISPLAY_HEIGHT}px` }}>
          {jawSettings.map((setting) => (
             <div 
                id={`tooth-num-${setting.number}`} // ID para posible fallback de posicionamiento
                key={`num-${setting.number}`}
                className="flex items-center justify-center font-bold"
                style={{ width: `${TOOTH_WIDTH}px` }}
             >
                {setting.number}
            </div>
          ))}
        </div>
        
        {/* Canvas de Konva para los dientes */}
        <Stage ref={stageRef} width={jawSettings.length * TOOTH_WIDTH} height={isUpperJaw ? 180 : 190}>
          <Layer>
            <KonvaGroup x={0} y={isUpperJaw ? 0 : 0}>
              {jawSettings.map((setting, idx) => (
                <Tooth
                  key={`tooth-${setting.number}`}
                  id={idx}
                  dientes={dientes[setting.number] || {}}
                  onClick={(e) => handleToothClick(setting.number, e)}
                  typeTeeth={setting.typeTooth}
                  rotated={Boolean(setting.rotated)}
                  reflected={Boolean(setting.reflected)}
                  numTooth={setting.number}
                  scale={0.28}
                  separation={TOOTH_WIDTH}
                  rangoSelect={[]} 
                />
              ))}
            </KonvaGroup>
          </Layer>
        </Stage>
      </div>
    );
  };
  
  const defaultColor = 'hsl(var(--foreground))';
  const malEstadoColor = '#E40000'; // Rojo
  const buenEstadoColor = '#0880D7'; // Azul

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-2 text-xs">
        <span className="flex items-center mr-4"><span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: malEstadoColor}}></span>Mal estado</span>
        <span className="flex items-center"><span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: buenEstadoColor}}></span>Buen estado</span>
      </div>

      {renderToothRow(SettingSupperJaw, true, stageRefUpper)}
      <div className="my-4 border-b border-border"></div> {/* Separador */}
      {renderToothRow(SettingsLowerJaw, false, stageRefLower)}

      {selectedToothNumber !== null && dropdownPosition && (
        <DropdownMenu open={dropdownOpen} onOpenChange={(open) => {
          setDropdownOpen(open);
          if (!open) setSelectedToothNumber(null);
        }}>
          <DropdownMenuTrigger asChild>
            {/* Trigger invisible posicionado dinámicamente */}
            <div style={{ position: 'fixed', top: dropdownPosition.top, left: dropdownPosition.left, width: 1, height: 1, background: 'transparent', border: 'none' }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-60" // Aumentado el ancho para mejor visualización
            align="start"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onSelect={() => { // Opción para limpiar hallazgos del diente
                setDientes(prev => {
                    const newDientes = {...prev};
                    delete newDientes[selectedToothNumber];
                    return newDientes;
                });
                setToothDisplays(prev => {
                    const newDisplays = {...prev};
                    delete newDisplays[selectedToothNumber];
                    return newDisplays;
                });
                setDropdownOpen(false);
                setSelectedToothNumber(null);
            }} className="text-destructive focus:text-destructive">
                Limpiar Hallazgos (Diente {selectedToothNumber})
            </DropdownMenuItem>
            {Hallazgos.map((hallazgoDef) => {
              const hasDetalles = hallazgoDef.detalle && hallazgoDef.detalle.length > 0;
              const needsColorChoice = hallazgoDef.color === '';

              if (needsColorChoice || hasDetalles) {
                return (
                  <DropdownMenuSub key={hallazgoDef.tipo}>
                    <DropdownMenuSubTrigger>
                      <span>{hallazgoDef.denominacion}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-52">
                        {hasDetalles && hallazgoDef.detalle?.map((detalleItem) => {
                          if (needsColorChoice) {
                            return (
                              <DropdownMenuSub key={`${hallazgoDef.tipo}-${detalleItem.abreviatura || detalleItem.tipo}`}>
                                <DropdownMenuSubTrigger>{detalleItem.denominacion || detalleItem.tipo}</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onSelect={() => handleSelectHallazgo(hallazgoDef, malEstadoColor, detalleItem)}>Mal estado</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleSelectHallazgo(hallazgoDef, buenEstadoColor, detalleItem)}>Buen estado</DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                            );
                          } else { // Tiene detalles pero no necesita elección de color (color ya definido en hallazgoDef)
                            return (
                              <DropdownMenuItem key={`${hallazgoDef.tipo}-${detalleItem.abreviatura || detalleItem.tipo}`} onSelect={() => handleSelectHallazgo(hallazgoDef, hallazgoDef.color, detalleItem)}>
                                {detalleItem.denominacion || detalleItem.tipo}
                              </DropdownMenuItem>
                            );
                          }
                        })}
                        {/* Si solo necesita elección de color y no tiene detalles específicos */}
                        {needsColorChoice && !hasDetalles && (
                          <>
                            <DropdownMenuItem onSelect={() => handleSelectHallazgo(hallazgoDef, malEstadoColor)}>Mal estado</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleSelectHallazgo(hallazgoDef, buenEstadoColor)}>Buen estado</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                );
              } else { // No necesita elección de color y no tiene detalles
                return (
                  <DropdownMenuItem key={hallazgoDef.tipo} onSelect={() => handleSelectHallazgo(hallazgoDef, hallazgoDef.color)}>
                    <span>{hallazgoDef.denominacion}</span>
                  </DropdownMenuItem>
                );
              }
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default Teeth;
