// src/components/odontograma/Teeth.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stage, Layer, Group as KonvaGroup } from 'react-konva'; // Renamed Group to KonvaGroup to avoid conflict if any
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import Tooth from './Tooth'; // Assuming ToothA was meant to be Tooth from ./Tooth.tsx
import { Badge } from '@/components/ui/badge';
import { DientesMap, SettingSupperJaw, SettingsLowerJaw, Hallazgos, CurrentMode, Hallazgo as HallazgoType, ToothDisplays, OpenModeal, DetalleHallazgo } from './setting';
import { InteractiveFace } from './ToothFace';
import { Button } from '@/components/ui/button'; // For modal buttons

export function Teeth() {
  const [isClient, setIsClient] = useState(false);
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'agregar' | 'eliminar'>('agregar');
  const [toModal, setToModal] = useState<OpenModeal>({
    selectedTooth: null, // Changed from string to number | null
    code: '',
    to: '',
    detalle: undefined, // Make sure this is aligned with OpenModeal type
    group: undefined,   // Make sure this is aligned with OpenModeal type
  });
  const [rangoSeleccion, setRangoSeleccion] = useState<Array<{ id: number; numTooth: number; jaw: 'superior' | 'inferior' }>>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null); // For delete view

  const [toothDisplays, setToothDisplays] = useState<Record<number, ToothDisplays>>({});
  const [currentMode, setCurrentMode] = useState<CurrentMode>({
    position: -1,
    color: '#0880D7', // Default to a neutral/blue color
    detalle: -1,
    direccion: undefined,
    cara: undefined,
  });
  const [dientes, setDientes] = useState<DientesMap>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleDetails = useCallback((key: string) => {
    setOpenDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleRemoveToothCode = useCallback((currentSelectedTooth: number | null, code: string) => {
    if (currentSelectedTooth === null) return;

    const hallazgoEnDiente = dientes[currentSelectedTooth]?.[code];
    const grupo = hallazgoEnDiente?.grupo;

    if (grupo && Array.isArray(grupo) && grupo.length > 0) {
      setToModal({ selectedTooth: currentSelectedTooth, code, group: grupo, to: 'toConfirmDelGroup', detalle: undefined });
    } else {
      if (hallazgoEnDiente?.detalle) { // Check if 'detalle' existed which might imply a display
        // If the display was specifically for this code, remove it
        if(toothDisplays[currentSelectedTooth]?.abreviatura === hallazgoEnDiente.abreviatura || 
           hallazgoEnDiente.detalle?.some(d => d.abreviatura === toothDisplays[currentSelectedTooth]?.abreviatura)) {
            setToothDisplays((prev) => {
                const nuevo = { ...prev };
                delete nuevo[currentSelectedTooth];
                return nuevo;
            });
        }
      }

      setDientes((prev) => {
        const newState = { ...prev };
        if (newState[currentSelectedTooth]) {
          const newToothState = { ...newState[currentSelectedTooth] };
          delete newToothState[code];
          if (Object.keys(newToothState).length === 0) {
            delete newState[currentSelectedTooth];
          } else {
            newState[currentSelectedTooth] = newToothState;
          }
        }
        return newState;
      });
    }
  }, [dientes, toothDisplays]);

  const confirmarEliminacionGrupo = useCallback(() => {
    if (!toModal || !toModal.group || !toModal.code) return;
    const { code, group } = toModal;

    setDientes((prev) => {
      const newState = { ...prev };
      for (const dienteNum of group) {
        if (newState[dienteNum] && newState[dienteNum][code]) {
          const newToothState = { ...newState[dienteNum] };
          delete newToothState[code];
           if (Object.keys(newToothState).length === 0) {
            delete newState[dienteNum];
          } else {
            newState[dienteNum] = newToothState;
          }
        }
        // Also remove display if it was for this group item
        if (toothDisplays[dienteNum]?.abreviatura === Hallazgos.find(h => h.tipo === code)?.abreviatura) {
            setToothDisplays(prevDisplays => {
                const newDisplays = {...prevDisplays};
                delete newDisplays[dienteNum];
                return newDisplays;
            });
        }
      }
      return newState;
    });

    setToModal({ selectedTooth: null, code: '', to: '', detalle: undefined, group: undefined });
  }, [toModal, toothDisplays]);

  const cancelarEliminacionGrupo = useCallback(() => {
    setToModal({ selectedTooth: null, code: '', to: '', detalle: undefined, group: undefined });
  }, []);

  const handleRemoveToothCodeDetalle = useCallback((currentSelectedTooth: number | null, code: string, idx: number) => {
    if (currentSelectedTooth === null) return;

    setDientes((prev) => {
      const newState = { ...prev };
      if (!newState[currentSelectedTooth] || !newState[currentSelectedTooth][code] || !newState[currentSelectedTooth][code].detalle) {
        return prev; // No change if data is missing
      }
      
      const hallazgoActual = newState[currentSelectedTooth][code];
      const detalleOriginal = hallazgoActual.detalle || [];
      const detalleEliminado = detalleOriginal[idx];

      const nuevoDetalle = detalleOriginal.filter((_, i) => i !== idx);

      newState[currentSelectedTooth] = {
        ...newState[currentSelectedTooth],
        [code]: {
          ...hallazgoActual,
          detalle: nuevoDetalle.length > 0 ? nuevoDetalle : undefined, // Remove detalle array if empty
        },
      };
      
      // Update toothDisplays if the removed detail was the one being displayed
      if (toothDisplays[currentSelectedTooth]?.abreviatura === detalleEliminado?.abreviatura) {
        let nuevaAbreviaturaDisplay = hallazgoActual.abreviatura || ''; // Fallback to main finding abbreviation
        if (nuevoDetalle.length > 0) {
          nuevaAbreviaturaDisplay = nuevoDetalle[0].abreviatura; // Show first available detail or main
        } else if (!hallazgoActual.abreviatura) { // If no main abreviatura and no details left
            setToothDisplays(prevDisp => {
                const newDisp = {...prevDisp};
                delete newDisp[currentSelectedTooth];
                return newDisp;
            });
            return newState; // Early return if display is cleared
        }
        
        setToothDisplays(prevDisp => ({
            ...prevDisp,
            [currentSelectedTooth]: { 
                abreviatura: nuevaAbreviaturaDisplay, 
                color: hallazgoActual.color 
            }
        }));
      } else if (nuevoDetalle.length === 0 && !hallazgoActual.abreviatura && toothDisplays[currentSelectedTooth]) {
          // If no details left, no main abbreviation, and there was a display, clear it
          setToothDisplays(prevDisp => {
            const newDisp = {...prevDisp};
            delete newDisp[currentSelectedTooth];
            return newDisp;
        });
      }

      return newState;
    });
  }, [dientes, toothDisplays]);

  const handleToothClick = useCallback((toothNum: number, id: number, jaw: 'superior' | 'inferior') => {
    if (currentMode.position === -1 && activeView === 'agregar') return; // No finding selected

    if (activeView === 'agregar') {
      const hallazgoDef = Hallazgos[currentMode.position];
      if (!hallazgoDef) return;

      const { tipo, denominacion, abreviatura, detalle: detalleDef, color: colorDef } = hallazgoDef;
      const colorFinal = colorDef === '' ? currentMode.color : colorDef;

      if (tipo === 'AOF' || tipo === 'AOR' || tipo === 'ET' || tipo === 'PDPF' || tipo === 'PDC' || tipo === 'PDPR') {
        setRangoSeleccion((prevRango) => {
          const nuevoPunto = { id, numTooth: toothNum, jaw };
          return prevRango.length === 0 ? [nuevoPunto] : [prevRango[0], nuevoPunto];
        });
      } else if (tipo === 'D' || tipo === 'F' || tipo === 'PDS' || tipo === 'TD') {
        const dentalArch = jaw === 'superior' ? SettingSupperJaw : SettingsLowerJaw;
        const nextId = dentalArch[id + 1] ? id + 1 : (id - 1 >=0 ? id -1 : -1) ;
        if (nextId !== -1) {
            const nextTooth = dentalArch[nextId]?.number;
            if (nextTooth) {
                setRangoSeleccion([{ id, numTooth: toothNum, jaw }, { id: nextId, numTooth: nextTooth, jaw }]);
            }
        }
      } else {
        setDientes((prevDientes) => {
          const dienteActual = prevDientes[toothNum] || {};
          let nuevosDetallesParaHallazgo: DetalleHallazgo[] | undefined = dienteActual[tipo]?.detalle;

          if (currentMode.detalle !== -1 && detalleDef && detalleDef[currentMode.detalle]) {
            const detalleSeleccionado = detalleDef[currentMode.detalle];
            if (!nuevosDetallesParaHallazgo) nuevosDetallesParaHallazgo = [];
            const yaExiste = nuevosDetallesParaHallazgo.some(d => d.abreviatura === detalleSeleccionado.tipo);
            if (!yaExiste) {
              nuevosDetallesParaHallazgo.push({ abreviatura: detalleSeleccionado.tipo, nombre: detalleSeleccionado.denominacion });
            }
          }

          const nuevoHallazgo: HallazgoType = {
            tipo: tipo,
            color: colorFinal,
            nombre: denominacion,
            abreviatura: abreviatura,
            ...(nuevosDetallesParaHallazgo && nuevosDetallesParaHallazgo.length > 0 && { detalle: nuevosDetallesParaHallazgo }),
            ...(currentMode.direccion && { direccion: currentMode.direccion }),
            ...(currentMode.cara && { cara: [currentMode.cara] }) // Store cara as an array
          };
          
          // Update toothDisplays
          let displayAbreviatura = abreviatura;
          if (currentMode.detalle !== -1 && detalleDef && detalleDef[currentMode.detalle]) {
              displayAbreviatura = detalleDef[currentMode.detalle].tipo;
          } else if (currentMode.cara) {
              displayAbreviatura = currentMode.cara.abreviatura;
          }

          if (displayAbreviatura && displayAbreviatura !== '') {
            setToothDisplays(prevDisplays => ({
              ...prevDisplays,
              [toothNum]: { abreviatura: displayAbreviatura, color: colorFinal },
            }));
          } else if (abreviatura && abreviatura !== '') { // Fallback to main abbreviation if no detail/cara
             setToothDisplays(prevDisplays => ({
              ...prevDisplays,
              [toothNum]: { abreviatura: abreviatura, color: colorFinal },
            }));
          }


          if (tipo === 'RT' || tipo === 'RD' || tipo === 'LCD') {
            setToModal({ selectedTooth: toothNum, code: tipo, to: 'toToothFace', detalle: detalleDef, group: undefined });
            // For these types, cara selection will finalize the state, so we might not want to set it fully yet
            // Or, set a preliminary state and update/finalize after face selection
            return { ...prevDientes, [toothNum]: { ...dienteActual, [tipo]: nuevoHallazgo } };
          }
          
          return { ...prevDientes, [toothNum]: { ...dienteActual, [tipo]: nuevoHallazgo } };
        });
        setCurrentMode(prev => ({ ...prev, cara: undefined })); // Reset cara after applying
      }
    } else if (activeView === 'eliminar') {
      setSelectedTooth(toothNum);
    }
  }, [activeView, currentMode, Hallazgos]);

  useEffect(() => {
    if (rangoSeleccion.length === 2) {
      const { tipo, denominacion, abreviatura, detalle: detalleDef, color: colorDef } = Hallazgos[currentMode.position];
      const colorFinal = colorDef === '' ? currentMode.color : colorDef;
      const dentalArch = rangoSeleccion[0].jaw === 'superior' ? SettingSupperJaw : SettingsLowerJaw;
      
      const inicioId = Math.min(rangoSeleccion[0].id, rangoSeleccion[1].id);
      const finId = Math.max(rangoSeleccion[0].id, rangoSeleccion[1].id);
      
      setDientes((prevDientes) => {
        const newState = { ...prevDientes };
        const grupoAfectado: number[] = [];

        for (let i = inicioId; i <= finId; i++) {
          const dienteInfo = dentalArch[i];
          if (dienteInfo) {
            // For D, F, PDS, TD, ensure we only mark the two selected teeth in the group
            if (['D', 'F', 'PDS', 'TD'].includes(tipo)) {
                if (i === rangoSeleccion[0].id || i === rangoSeleccion[1].id) {
                    grupoAfectado.push(dienteInfo.number);
                }
            } else {
                 grupoAfectado.push(dienteInfo.number);
            }
          }
        }
        
        if (grupoAfectado.length > 0) {
            grupoAfectado.forEach(numDiente => {
                newState[numDiente] = {
                ...(newState[numDiente] || {}),
                [tipo]: {
                    tipo: tipo,
                    color: colorFinal,
                    nombre: denominacion,
                    grupo: grupoAfectado,
                    abreviatura: abreviatura,
                    ...(detalleDef && currentMode.detalle !== -1 && detalleDef[currentMode.detalle] && 
                        { detalle: [{ abreviatura: detalleDef[currentMode.detalle].tipo, nombre: detalleDef[currentMode.detalle].denominacion }] }
                    ),
                }
                };
                if (abreviatura) {
                    setToothDisplays(prevDisp => ({ ...prevDisp, [numDiente]: { abreviatura, color: colorFinal }}));
                }
            });
        }
        return newState;
      });
      setRangoSeleccion([]);
    }
  }, [rangoSeleccion, currentMode, Hallazgos]);

  const handleSaveFaceSelection = useCallback(() => {
    if (toModal.selectedTooth !== null && toModal.code && currentMode.cara) {
      setDientes(prevDientes => {
        const dienteActual = prevDientes[toModal.selectedTooth!] || {};
        const hallazgoExistente = dienteActual[toModal.code!] || Hallazgos.find(h => h.tipo === toModal.code); // Fallback to definition

        if (!hallazgoExistente) return prevDientes; // Should not happen if modal opened

        const nuevasCaras = [...(hallazgoExistente.cara || []), currentMode.cara!];
        
        const hallazgoActualizado: HallazgoType = {
          ...hallazgoExistente,
          tipo: hallazgoExistente.tipo, // Ensure tipo is correctly from definition
          nombre: hallazgoExistente.nombre,
          color: currentMode.color, // Update color from currentMode if changed for RD
          abreviatura: hallazgoExistente.abreviatura, // Keep original abreviatura
          cara: nuevasCaras,
          // Preserve other properties like 'detalle', 'grupo', 'direccion'
          ...(hallazgoExistente.detalle && { detalle: hallazgoExistente.detalle }),
          ...(hallazgoExistente.grupo && { grupo: hallazgoExistente.grupo }),
          ...(hallazgoExistente.direccion && { direccion: hallazgoExistente.direccion }),
        };
        
        setToothDisplays(prevDisplays => ({
          ...prevDisplays,
          [toModal.selectedTooth!]: { abreviatura: currentMode.cara!.abreviatura, color: currentMode.color },
        }));

        return {
          ...prevDientes,
          [toModal.selectedTooth!]: {
            ...dienteActual,
            [toModal.code!]: hallazgoActualizado,
          },
        };
      });
    }
    setToModal({ selectedTooth: null, code: '', to: '', detalle: undefined, group: undefined });
    setCurrentMode(prev => ({...prev, cara: undefined})); // Reset cara selection
  }, [toModal, currentMode.cara, currentMode.color, Hallazgos]);


  if (!isClient) {
    return <p className="text-center py-10 text-muted-foreground">Cargando Odontograma...</p>;
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-2 md:p-4 bg-card rounded-lg shadow">
      {/* Odontogram Canvas and Tooth Number Displays */}
      <div className="flex-grow order-2 md:order-1">
        <div className="flex justify-center">
          {SettingSupperJaw.map((setting) => (
            <div
              key={`display-sup-${setting.number}`}
              onClick={() => activeView === 'eliminar' && setSelectedTooth(setting.number)}
              className="flex flex-col items-center m-px text-xs font-medium text-center cursor-pointer h-10 w-[51px]" // Tailwind for width, ensure consistency
            >
              <span style={{ color: toothDisplays[setting.number]?.color || 'inherit' }} className="h-4">
                {toothDisplays[setting.number]?.abreviatura}
              </span>
              <span className="text-muted-foreground">{setting.number}</span>
            </div>
          ))}
        </div>
        <Stage width={885} height={370}>
          <Layer>
            <KonvaGroup x={0} y={0}>
              {SettingSupperJaw.map((setting, idx) => (
                <Tooth
                  key={`tooth-sup-${setting.number}`}
                  id={idx}
                  dientes={dientes[setting.number] || {}}
                  onClick={() => handleToothClick(setting.number, idx, 'superior')}
                  typeTeeth={setting.typeTooth}
                  rotated={Boolean(setting.rotated)}
                  reflected={Boolean(setting.reflected)}
                  numTooth={setting.number}
                  scale={0.28}
                  separation={55}
                  rangoSelect={rangoSeleccion.filter(r => r.jaw === 'superior')}
                />
              ))}
            </KonvaGroup>
            <KonvaGroup x={0} y={140}>
              {SettingsLowerJaw.map((setting, idx) => (
                <Tooth
                  key={`tooth-inf-${setting.number}`}
                  id={idx}
                  dientes={dientes[setting.number] || {}}
                  onClick={() => handleToothClick(setting.number, idx, 'inferior')}
                  typeTeeth={setting.typeTooth}
                  rotated={Boolean(setting.rotated)}
                  reflected={Boolean(setting.reflected)}
                  numTooth={setting.number}
                  scale={0.28}
                  separation={55}
                  rangoSelect={rangoSeleccion.filter(r => r.jaw === 'inferior')}
                />
              ))}
            </KonvaGroup>
          </Layer>
        </Stage>
        <div className="flex justify-center">
          {SettingsLowerJaw.map((setting) => (
            <div
              key={`display-inf-${setting.number}`}
              onClick={() => activeView === 'eliminar' && setSelectedTooth(setting.number)}
              className="flex flex-col items-center m-px text-xs font-medium text-center cursor-pointer h-10 w-[51px]" // Tailwind for width
            >
              <span className="text-muted-foreground">{setting.number}</span>
              <span style={{ color: toothDisplays[setting.number]?.color || 'inherit' }} className="h-4">
                {toothDisplays[setting.number]?.abreviatura}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="w-full md:w-72 lg:w-80 order-1 md:order-2 space-y-4 sticky top-4 self-start">
        <div className="flex items-center justify-around bg-muted p-1 rounded-md">
          <Button
            variant={activeView === 'agregar' ? 'default' : 'ghost'}
            onClick={() => { setActiveView('agregar'); setSelectedTooth(null); }}
            className="flex-1"
          >
            Agregar
          </Button>
          <Button
            variant={activeView === 'eliminar' ? 'destructive' : 'ghost'}
            onClick={() => setActiveView('eliminar')}
            className="flex-1"
          >
            Eliminar
          </Button>
        </div>

        {activeView === 'agregar' ? (
          <div className="text-sm p-2 border rounded-md max-h-[calc(100vh-12rem)] overflow-y-auto">
            <h3 className="font-semibold mb-2 text-muted-foreground">Hallazgos</h3>
            {(() => {
              const tiposEspeciales: [string, HallazgoType][] = [];
              const tiposNormales: [string, HallazgoType][] = [];
              Hallazgos.forEach((label, key) => {
                if (['RD', 'RT', 'LCD'].includes(label.tipo)) {
                  tiposEspeciales.push([String(key), label]);
                } else {
                  tiposNormales.push([String(key), label]);
                }
              });
              return (
                <>
                  {tiposEspeciales.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {tiposEspeciales.map(([key, label]) => {
                        let colorClass = "";
                        if (label.tipo === 'LCD') colorClass = "border-red-500 text-red-600 hover:bg-red-50";
                        else if (label.tipo === 'RD') colorClass = "border-red-500 text-red-600 hover:bg-red-50";
                        else if (label.tipo === 'RT') colorClass = "border-blue-500 text-blue-600 hover:bg-blue-50";
                        
                        return (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentMode({
                              position: Number(key),
                              color: label.color === '' ? '#0880D7' : label.color, // Default blue if color not specified
                              detalle: (label.detalle && label.detalle.length > 0) ? 0 : -1,
                              direccion: undefined,
                              cara: undefined,
                            })}
                            className={`h-auto py-1 px-2 ${colorClass} ${currentMode?.position === Number(key) ? (label.tipo === 'LCD' || label.tipo === 'RD' ? 'bg-red-50' : 'bg-blue-50') : ''}`}
                          >
                            {label.denominacion}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {tiposNormales.map(([key, label]) => (
                    <div key={key} className="mb-2">
                      <Button
                        variant="ghost"
                        className={`w-full justify-between h-auto py-2 px-3 text-left ${currentMode?.position === Number(key) ? 'bg-accent text-accent-foreground' : ''}`}
                        onClick={() => setCurrentMode({
                          position: Number(key),
                          color: label.color === '' ? '#0880D7' : label.color,
                          detalle: (label.detalle && label.detalle.length > 0) ? 0 : -1,
                          direccion: undefined,
                          cara: undefined,
                        })}
                      >
                        <span>{label.denominacion}</span>
                        {(label.color === '' || (label.detalle && label.detalle.length > 0) || label.tipo === 'GI') && (
                          <span onClick={(e) => { e.stopPropagation(); toggleDetails(key); }} className="text-muted-foreground hover:text-foreground">
                            {openDetails[key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </Button>
                      {openDetails[key] && (
                        <div className="p-2 ml-3 mt-1 bg-muted/50 rounded space-y-2 text-xs">
                          {label.tipo === 'GI' && (
                            <div className="flex items-center justify-start gap-2">
                              <Button variant={currentMode?.direccion === 'izquierda' ? 'secondary' : 'outline'} size="icon" onClick={() => setCurrentMode(prev => ({ ...prev, direccion: 'izquierda' }))}><ArrowLeft size={16}/></Button>
                              <Button variant={currentMode?.direccion === 'derecha' ? 'secondary' : 'outline'} size="icon" onClick={() => setCurrentMode(prev => ({ ...prev, direccion: 'derecha' }))}><ArrowRight size={16}/></Button>
                            </div>
                          )}
                          {label.color === '' && (
                            <div className="space-y-1">
                              <Button variant={currentMode.color === '#E40000' ? 'destructive' : 'outline'} size="sm" className="w-full justify-start gap-2" onClick={() => setCurrentMode(prev => ({ ...prev, color: '#E40000' }))}><div className="w-3 h-3 rounded-full bg-red-500"/>Mal estado</Button>
                              <Button variant={currentMode.color === '#0880D7' ? 'default' : 'outline'} size="sm" className="w-full justify-start gap-2" onClick={() => setCurrentMode(prev => ({ ...prev, color: '#0880D7' }))}><div className="w-3 h-3 rounded-full bg-blue-500"/>Buen estado</Button>
                            </div>
                          )}
                          {label.detalle && label.detalle.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {label.detalle.map((item, idx) => (
                                <Button key={idx} variant={currentMode.detalle === idx ? 'secondary': 'outline'} size="sm" className="h-auto py-0.5 px-1.5" onClick={() => setCurrentMode(prev => ({ ...prev, detalle: idx }))}>
                                  {item.tipo}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="p-2 border rounded-md max-h-[calc(100vh-8rem)] overflow-y-auto">
            {selectedTooth !== null && dientes[selectedTooth] && Object.keys(dientes[selectedTooth]).length > 0 ? (
              <ul className="space-y-1">
                {Object.entries(dientes[selectedTooth]).map(([code, hallazgo]) => (
                  <li key={code} className="p-1.5 bg-muted/50 rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span>{hallazgo.nombre}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveToothCode(selectedTooth, code)} title="Eliminar hallazgo completo">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    {hallazgo.detalle && hallazgo.detalle.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pl-2">
                        {hallazgo.detalle.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs py-0.5 px-1.5 relative group">
                            {item.abreviatura}
                            <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-4 w-4 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleRemoveToothCodeDetalle(selectedTooth, code, idx);}} title="Eliminar este detalle">
                               <Trash2 size={10}/>
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {hallazgo.cara && hallazgo.cara.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pl-2">
                            {hallazgo.cara.map((c, idx) => (
                                <Badge key={`cara-${idx}`} variant="outline" className="text-xs py-0.5 px-1.5 border-blue-500 text-blue-600">
                                    Cara: {c.abreviatura}
                                </Badge>
                            ))}
                        </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">{selectedTooth === null ? "Seleccione un diente para ver/eliminar hallazgos." : "Sin hallazgos para este diente."}</p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {toModal.to === 'toConfirmDelGroup' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Eliminar Hallazgo en Grupo</h2>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Estás seguro de que deseas eliminar el hallazgo &quot;{Hallazgos.find(h => h.tipo === toModal.code)?.denominacion || toModal.code}&quot; de todos los dientes en el grupo seleccionado?
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelarEliminacionGrupo}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmarEliminacionGrupo}>Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}

      {toModal.to === 'toToothFace' && toModal.selectedTooth !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-primary">
                {dientes[toModal.selectedTooth]?.[toModal.code!]?.nombre || Hallazgos.find(h => h.tipo === toModal.code)?.denominacion}
              </h2>
              <p className="text-sm text-muted-foreground">Seleccione la cara afectada y/o el tipo de hallazgo.</p>
            </div>
            
            <div className="p-6 flex-grow overflow-y-auto space-y-4">
              <div className="flex items-center justify-center">
                <Stage width={150} height={150}>
                  <Layer scaleX={0.75} scaleY={0.75} x={-25} y={-25}>
                    <InteractiveFace
                      onSelectCara={(hallazgo) => setCurrentMode(prev => ({ ...prev, cara: { ...hallazgo, color: prev.color } }))}
                    />
                  </Layer>
                </Stage>
              </div>
              {currentMode.cara && (
                <div className="text-center text-sm">
                    Cara seleccionada: <Badge variant="outline">{currentMode.cara.nombre} ({currentMode.cara.abreviatura})</Badge>
                </div>
              )}

              {toModal.detalle && toModal.detalle.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Tipo de hallazgo:</label>
                  <div className="space-y-1">
                    {toModal.detalle.map((item, idx) => (
                      <Button
                        key={idx}
                        variant={currentMode.detalle === idx ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setCurrentMode(prev => ({ ...prev, detalle: idx, cara: undefined }))} // Reset cara if detail changes
                      >
                        {item.denominacion} ({item.tipo})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {(toModal.code === 'RD' || toModal.code === 'LCD' || toModal.code === 'RT') && (
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Estado:</label>
                    <div className="flex gap-2">
                        <Button variant={currentMode.color === '#E40000' ? 'destructive' : 'outline'} size="sm" className="flex-1 justify-start gap-2" onClick={() => setCurrentMode(prev => ({ ...prev, color: '#E40000' }))}><div className="w-3 h-3 rounded-full bg-red-500"/>Mal estado</Button>
                        <Button variant={currentMode.color === '#0880D7' ? 'default' : 'outline'} size="sm" className="flex-1 justify-start gap-2" onClick={() => setCurrentMode(prev => ({ ...prev, color: '#0880D7' }))}><div className="w-3 h-3 rounded-full bg-blue-500"/>Buen estado</Button>
                    </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setToModal({ selectedTooth: null, code: '', to: '', detalle: undefined, group: undefined })}>Cancelar</Button>
              <Button onClick={handleSaveFaceSelection}>Guardar Selección</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
