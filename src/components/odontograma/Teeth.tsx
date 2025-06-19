
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import ToothA from './Tooth';
import type { DientesMap, SettingSupperJaw, SettingsLowerJaw, Hallazgo as HallazgoType, CurrentMode, ToothDisplays, OpenModeal, DetalleHallazgo } from './setting';
import { Hallazgos } from './setting';
import { InteractiveFace } from './ToothFace';


export function Teeth() {
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'agregar' | 'eliminar'>('agregar');
  const [toModal, setToModal] = useState<OpenModeal>({
    selectedTooth: null,
    code: '',
    to: ''
  });
  const [rangoSeleccion, setRangoSeleccion] = useState<Array<{ id: number; numTooth: number; jaw: 'superior' | 'inferior' }>>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const [toothDisplays, setToothDisplays] = useState<Record<number, ToothDisplays>>({});
  const [currentMode, setCurrentMode] = useState<CurrentMode>({
    position: -1,
    color: '#E40000', // Default to red
    detalle: -1,
  });
  const [dientes, setDientes] = useState<DientesMap>({});

  const toggleDetails = useCallback((key: string) => {
    setOpenDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleRemoveToothCode = useCallback((toothNumber: number, code: string) => {
    const currentTooth = dientes[toothNumber];
    if (!currentTooth) return;

    const hallazgoData = currentTooth[code];
    if (!hallazgoData) return;

    const grupo = hallazgoData.grupo;

    if (grupo && Array.isArray(grupo) && grupo.length > 0) {
      setToModal({ selectedTooth: toothNumber, code, group: grupo, to: 'toConfirmDelGroup' });
    } else {
      const currentDisplay = toothDisplays[toothNumber];
      let shouldClearDisplay = false;
      if (currentDisplay) {
        if (hallazgoData.abreviatura === currentDisplay.abreviatura) {
            shouldClearDisplay = true;
        } else if (hallazgoData.detalle) {
            shouldClearDisplay = hallazgoData.detalle.some(d => d.abreviatura === currentDisplay.abreviatura);
        }
      }

      if (shouldClearDisplay) {
        setToothDisplays((prev) => {
          const nuevo = { ...prev };
          delete nuevo[toothNumber];
          return nuevo;
        });
      }

      setDientes((prev) => {
        const nuevo = { ...prev };
        if (nuevo[toothNumber]) {
          delete nuevo[toothNumber][code];
          if (Object.keys(nuevo[toothNumber]).length === 0) {
            delete nuevo[toothNumber];
          }
        }
        return nuevo;
      });
    }
  }, [dientes, toothDisplays]);

  const confirmarEliminacionGrupo = useCallback(() => {
    if (!toModal || !Array.isArray(toModal.group) || !toModal.code) {
      setToModal({ selectedTooth: null, code: '', to: '' });
      return;
    }
    const { code, group } = toModal;

    setDientes((prev) => {
      const nuevo = { ...prev };
      for (const dienteNum of group) {
        if (nuevo[dienteNum] && nuevo[dienteNum][code]) {
          delete nuevo[dienteNum][code];
          if (Object.keys(nuevo[dienteNum]).length === 0) {
            delete nuevo[dienteNum];
          }
        }
      }
      return nuevo;
    });

    setToModal({ selectedTooth: null, code: '', to: '' });
  }, [toModal]);

  const cancelarEliminacionGrupo = useCallback(() => {
    setToModal({ selectedTooth: null, code: '', to: '' });
  }, []);

  const handleRemoveToothCodeDetalle = useCallback((toothNumber: number, code: string, idx: number) => {
    const currentToothDisplay = toothDisplays[toothNumber];
    const currentDientesForTooth = dientes[toothNumber];
    const currentCodeData = currentDientesForTooth?.[code];
    const currentDetalleArray = currentCodeData?.detalle;

    if (currentDetalleArray && currentDetalleArray[idx]?.abreviatura === currentToothDisplay?.abreviatura) {
        let newDataAbbr = '';
        if (currentDetalleArray[idx - 1]) {
            newDataAbbr = currentDetalleArray[idx - 1].abreviatura;
        } else if (currentDetalleArray[idx + 1]) {
            newDataAbbr = currentDetalleArray[idx + 1].abreviatura;
        }
        
        const mainHallazgo = Hallazgos.find(h => h.tipo === code);
        let newColor = currentToothDisplay?.color || currentMode.color;

        if (newDataAbbr === '') {
            if (mainHallazgo?.abreviatura) {
                newDataAbbr = mainHallazgo.abreviatura;
                newColor = mainHallazgo.color || currentMode.color;
            }
        }

        setToothDisplays((prev) => {
            const nuevo = { ...prev };
            if (newDataAbbr !== '') {
                nuevo[toothNumber] = { ...(nuevo[toothNumber] || {} as ToothDisplays), abreviatura: newDataAbbr, color: newColor };
            } else if (nuevo[toothNumber]) {
                 delete nuevo[toothNumber];
            }
            return nuevo;
        });
    }

    setDientes((prev) => {
        const prevToothData = prev[toothNumber];
        if (!prevToothData) return prev;

        const prevCodeData = prevToothData[code];
        if (!prevCodeData || !Array.isArray(prevCodeData.detalle)) return prev;

        const newDetalle = prevCodeData.detalle.filter((_, i) => i !== idx);

        return {
            ...prev,
            [toothNumber]: {
                ...prevToothData,
                [code]: {
                    ...prevCodeData,
                    detalle: newDetalle.length > 0 ? newDetalle : undefined,
                },
            },
        };
    });
  }, [dientes, toothDisplays, currentMode.color]);

  const handleToothClick = useCallback((toothNum: number, id: number, jaw: 'superior' | 'inferior') => {
    if (activeView === 'agregar') {
      if (currentMode.position === -1 || !Hallazgos[currentMode.position]) return;

      const hallazgoSeleccionado = Hallazgos[currentMode.position];
      const { tipo, denominacion, abreviatura, detalle: detallesHallazgo, color } = hallazgoSeleccionado;

      if (['AOF', 'AOR', 'ET', 'PDPF', 'PDC', 'PDPR'].includes(tipo)) {
        setRangoSeleccion((prev) => {
          const nuevoElemento = { id, numTooth: toothNum, jaw };
          if (prev.length === 0) return [nuevoElemento];
          if (prev.length === 1 && prev[0].id === nuevoElemento.id && prev[0].numTooth === nuevoElemento.numTooth && prev[0].jaw === nuevoElemento.jaw) return prev;
          return [prev[0], nuevoElemento];
        });
      } else if (['D', 'F', 'PDS', 'TD'].includes(tipo)) {
        const dentalArch = jaw === 'superior' ? SettingSupperJaw : SettingsLowerJaw;
        const nextId = dentalArch[id + 1] ? id + 1 : (dentalArch[id - 1] ? id - 1 : -1);
        if (nextId === -1) return;
        const nextTooth = dentalArch[nextId]?.number;
        if (nextTooth) {
          setRangoSeleccion([
            { id: id, numTooth: toothNum, jaw },
            { id: nextId, numTooth: nextTooth, jaw }
          ]);
        }
      } else {
        setDientes((prevDientes) => {
          const currentToothState = prevDientes[toothNum] || {};
          const selectedDetailIndex = currentMode.detalle;
          const hallazgoDetallesArray: DetalleHallazgo[] = Array.isArray(detallesHallazgo) ? detallesHallazgo : [];

          let currentDetailsForHallazgo: DetalleHallazgo[] = currentToothState[tipo]?.detalle || [];
          let newDetailsArrayForHallazgoImmutable = [...currentDetailsForHallazgo];

          if (selectedDetailIndex !== -1 && hallazgoDetallesArray[selectedDetailIndex]) {
            const detailToAdd = hallazgoDetallesArray[selectedDetailIndex];
            const detailAbreviatura = detailToAdd.tipo; // Assuming 'tipo' is the abreviatura in DetalleHallazgo
            const detailNombre = detailToAdd.denominacion;
            const yaExiste = newDetailsArrayForHallazgoImmutable.some(d => d.abreviatura === detailAbreviatura);
            if (!yaExiste) {
              newDetailsArrayForHallazgoImmutable = [...newDetailsArrayForHallazgoImmutable, { abreviatura: detailAbreviatura, nombre: detailNombre }];
            }
          }

          const finalColor = color === '' ? currentMode.color : color;
          let nuevoValor: HallazgoType = {
            tipo: tipo,
            color: finalColor,
            nombre: denominacion,
            abreviatura: abreviatura,
            ...(newDetailsArrayForHallazgoImmutable.length > 0 && { detalle: newDetailsArrayForHallazgoImmutable }),
          };

          if (currentMode.direccion) nuevoValor.direccion = currentMode.direccion;

          if (newDetailsArrayForHallazgoImmutable.length > 0 && selectedDetailIndex !== -1 && hallazgoDetallesArray[selectedDetailIndex] && !['RT', 'RD', 'LCD'].includes(tipo)) {
             setToothDisplays(prevDisplays => ({
              ...prevDisplays,
              [toothNum]: { abreviatura: hallazgoDetallesArray[selectedDetailIndex].tipo, color: finalColor },
            }));
          } else if (abreviatura !== '') {
            setToothDisplays(prevDisplays => ({
              ...prevDisplays,
              [toothNum]: { abreviatura: abreviatura, color: finalColor },
            }));
          }
          
          if(currentMode.cara && ['RT', 'RD', 'LCD'].includes(tipo)) {
            const caraAAgregar = currentMode.cara;
            let carasExistentes = currentToothState[tipo]?.cara || [];
            const caraYaExiste = carasExistentes.some(c => c.tipo === caraAAgregar.tipo);
            
            let nuevasCaras;
            if(!caraYaExiste){
                nuevasCaras = [...carasExistentes, {...caraAAgregar, color: finalColor}];
            } else {
                nuevasCaras = carasExistentes.map(c => c.tipo === caraAAgregar.tipo ? {...c, color: finalColor} : c);
            }
            nuevoValor.cara = nuevasCaras;

            // Ensure main abbreviation is shown even if a face is selected
            if (!toothDisplays[toothNum] || !toothDisplays[toothNum].abreviatura.startsWith(abreviatura)) {
                setToothDisplays(prevDisplays_1 => ({ // Renamed prevDisplays to avoid conflict
                ...prevDisplays_1,
                [toothNum]: { abreviatura: abreviatura, color: finalColor },
                }));
            }
          }

          return {
            ...prevDientes,
            [toothNum]: {
              ...currentToothState,
              [tipo]: nuevoValor,
            },
          };
        });

        if (['RT', 'RD', 'LCD'].includes(tipo)) {
          setToModal({ selectedTooth: toothNum, code: tipo, to: 'toToothFace', detalle: detallesHallazgo });
        }
      }
    } else if (activeView === 'eliminar') {
      setSelectedTooth(toothNum);
    }
  }, [activeView, currentMode, Hallazgos, SettingSupperJaw, SettingsLowerJaw, toothDisplays, dientes]); // Added 'dientes' to dependency array

  useEffect(() => {
    if (rangoSeleccion.length === 2) {
      if (currentMode.position === -1 || !Hallazgos[currentMode.position]) {
        setRangoSeleccion([]);
        return;
      }
      const { tipo, denominacion, abreviatura, detalle: detallesHallazgo, color } = Hallazgos[currentMode.position];
      if (!rangoSeleccion[0]) {
        setRangoSeleccion([]); return;
      }
      const dentalArch = rangoSeleccion[0].jaw === 'superior' ? SettingSupperJaw : SettingsLowerJaw;

      setDientes((prev) => {
        const nuevo = { ...prev };
        const group: number[] = [];
        if (!rangoSeleccion[0] || !rangoSeleccion[1]) return prev;
        const inicio = Math.min(rangoSeleccion[0].id, rangoSeleccion[1].id);
        const fin = Math.max(rangoSeleccion[0].id, rangoSeleccion[1].id);

        for (let i = inicio; i <= fin; i++) {
          const tooth = dentalArch[i];
          if (tooth && (!nuevo[tooth.number]?.[tipo] || ['D', 'F', 'PDS', 'TD'].includes(tipo))) {
            group.push(tooth.number);
          }
        }

        for (let toothNumber of group) {
          const hallazgoDetallesArray = Array.isArray(detallesHallazgo) ? detallesHallazgo : [];
          const selectedDetailDataArray = (currentMode.detalle !== -1 && hallazgoDetallesArray[currentMode.detalle])
            ? [{ abreviatura: hallazgoDetallesArray[currentMode.detalle].tipo, nombre: hallazgoDetallesArray[currentMode.detalle].denominacion }]
            : [];
          
          nuevo[toothNumber] = {
            ...(nuevo[toothNumber] || {}),
            [tipo]: {
              tipo: tipo,
              color: color === '' ? currentMode.color : color,
              nombre: denominacion,
              grupo: group,
              abreviatura: abreviatura,
              detalle: selectedDetailDataArray.length > 0 ? selectedDetailDataArray : undefined // Ensure it's an array or undefined
            }
          };
        }
        return nuevo;
      });
      setRangoSeleccion([]);
    }
  }, [rangoSeleccion, currentMode, Hallazgos, SettingSupperJaw, SettingsLowerJaw]);

  useEffect(() => {
    // console.log('Dientes state updated:', dientes);
  }, [dientes]);
  useEffect(() => {
    // console.log('ToModal state updated:', toModal);
  }, [toModal]);
  useEffect(() => {
    // console.log('CurrentMode state updated:', currentMode);
  }, [currentMode]);

  const handleSaveFaceSelection = useCallback(() => {
    if(toModal.selectedTooth !== null && toModal.code && currentMode.cara){
        setDientes(prevDientes => {
            const toothNum = toModal.selectedTooth as number;
            const code = toModal.code;
            const currentToothState = prevDientes[toothNum] || {};
            const baseHallazgoInfo = Hallazgos.find(h => h.tipo === code); // For default nombre/abreviatura
            
            // Ensure the main hallazgo object exists, even if it's new
            const hallazgoActual = currentToothState[code] || {
                tipo: code,
                nombre: baseHallazgoInfo?.denominacion || '',
                abreviatura: baseHallazgoInfo?.abreviatura || '',
                color: currentMode.color, // Use currentMode color as base
                // detalle will be handled if applicable
            };
            
            let carasExistentes: HallazgoType[] = hallazgoActual.cara || [];
            const caraAAgregar = currentMode.cara; // This should have type and color
            const caraYaExisteIndex = carasExistentes.findIndex(c => c.tipo === caraAAgregar.tipo);

            let nuevasCaras;
            if(caraYaExisteIndex !== -1){
                // Update existing cara
                nuevasCaras = carasExistentes.map((c, index) => 
                    index === caraYaExisteIndex ? { ...c, color: caraAAgregar.color || currentMode.color } : c
                );
            } else {
                // Add new cara
                nuevasCaras = [...carasExistentes, {...caraAAgregar, color: caraAAgregar.color || currentMode.color }];
            }
            
            const hallazgoActualizado : HallazgoType = {
                ...hallazgoActual, // Spread existing properties like nombre, abreviatura
                tipo: code, // Ensure tipo is correct
                color: currentMode.color, // Update main color if necessary
                cara: nuevasCaras,
            };

            // Update tooth display with the main abbreviation if a face is selected
            if (baseHallazgoInfo?.abreviatura) {
                 setToothDisplays(prevDisplays => ({
                    ...prevDisplays,
                    [toothNum]: { abreviatura: baseHallazgoInfo.abreviatura, color: currentMode.color },
                }));
            }

            return {
                ...prevDientes,
                [toothNum]: {
                    ...currentToothState,
                    [code]: hallazgoActualizado
                }
            };
        });
    }
    setToModal({ selectedTooth: null, code: '', to: '' });
    setCurrentMode(prev => ({...prev, cara: undefined})); // Reset selected face in currentMode
  }, [toModal, currentMode, Hallazgos]); // Added Hallazgos to dependencies

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-2 md:p-4 bg-card rounded-lg shadow">
      {/* Odontogram Canvas and Tooth Number Displays */}
      <div className="flex-grow order-2 md:order-1">
        <div className="flex justify-center">
          {SettingSupperJaw.map((setting, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedTooth(setting.number)}
              className="bg-gray-200 m-0.5 p-1 text-center cursor-pointer h-8 w-10 md:h-10 md:w-12 text-xs md:text-sm flex items-center justify-center"
              style={{ width: 'auto', minWidth: '40px', color: toothDisplays[setting.number]?.color || 'inherit' }}
            >
              {toothDisplays[setting.number]?.abreviatura || setting.number}
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <Stage width={885} height={370}>
            <Layer>
              <Group x={0} y={0}>
                {SettingSupperJaw.map((setting, idx) => (
                  <ToothA
                    key={setting.number}
                    id={idx}
                    dientes={dientes}
                    onClick={() => handleToothClick(setting.number, idx, 'superior')}
                    typeTeeth={setting.typeTooth}
                    rotated={Boolean(setting.rotated)}
                    reflected={Boolean(setting.reflected)}
                    numTooth={setting.number}
                    scale={0.28}
                    separation={55}
                    rangoSelect={rangoSeleccion}
                  />
                ))}
              </Group>
              <Group x={0} y={140}>
                {SettingsLowerJaw.map((setting, idx) => (
                  <ToothA
                    key={setting.number}
                    id={idx}
                    dientes={dientes}
                    onClick={() => handleToothClick(setting.number, idx, 'inferior')}
                    typeTeeth={setting.typeTooth}
                    rotated={Boolean(setting.rotated)}
                    reflected={Boolean(setting.reflected)}
                    numTooth={setting.number}
                    scale={0.28}
                    separation={55}
                    rangoSelect={rangoSeleccion}
                  />
                ))}
              </Group>
            </Layer>
          </Stage>
        </div>
        <div className="flex justify-center">
          {SettingsLowerJaw.map((setting, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedTooth(setting.number)}
              className="bg-gray-200 m-0.5 p-1 text-center cursor-pointer h-8 w-10 md:h-10 md:w-12 text-xs md:text-sm flex items-center justify-center"
              style={{ width: 'auto', minWidth: '40px', color: toothDisplays[setting.number]?.color || 'inherit' }}
            >
              {toothDisplays[setting.number]?.abreviatura || setting.number}
            </div>
          ))}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="w-full md:w-72 lg:w-80 order-1 md:order-2 space-y-3">
        <div className="flex items-center space-x-2 border-b pb-2 mb-2">
          <button
            onClick={() => {
              setActiveView('agregar');
              setSelectedTooth(null);
              setRangoSeleccion([]); // Clear selection when switching views
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'agregar' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
          >
            Agregar
          </button>
          <button
            onClick={() => {
              setActiveView('eliminar');
              setRangoSeleccion([]); // Clear selection when switching views
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'eliminar' ? 'bg-destructive text-destructive-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
          >
            Eliminar
          </button>
        </div>

        {activeView === 'agregar' ? (
          <div className="text-sm">
            <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-1 space-y-1.5">
              {(() => {
                const tiposEspeciales: [string, HallazgoType][] = [];
                const tiposNormales: [string, HallazgoType][] = [];

                Object.entries(Hallazgos).forEach(([key, hallazgo]) => {
                  if (['RD', 'RT', 'LCD'].includes(hallazgo.tipo)) {
                    tiposEspeciales.push([key, hallazgo]);
                  } else {
                    tiposNormales.push([key, hallazgo]);
                  }
                });

                return (
                  <>
                    {tiposEspeciales.length > 0 && (
                      <div className="mb-3 p-2 border border-dashed border-border rounded-md">
                        <p className="text-xs text-muted-foreground mb-1.5">Condiciones de Cara/Superficie:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tiposEspeciales.map(([key, hallazgo]) => {
                            // Determine the default color for this specific button if hallazgo.color is empty
                            let effectiveColor = hallazgo.color;
                            if (hallazgo.color === '') {
                                if (hallazgo.tipo === 'LCD') effectiveColor = '#E40000'; // Red for Caries
                                else if (hallazgo.tipo === 'RD') effectiveColor = '#0880D7'; // Blue for Definitive Restoration
                                else if (hallazgo.tipo === 'RT') effectiveColor = '#E40000'; // Red for Temporal Restoration
                            }
                            
                            // Determine text and border color class based on effectiveColor
                            let colorClass = "";
                            if (effectiveColor === '#E40000') colorClass = "text-red-600 border-red-500 hover:bg-red-50 focus:bg-red-100";
                            else if (effectiveColor === '#0880D7') colorClass = "text-blue-600 border-blue-500 hover:bg-blue-50 focus:bg-blue-100";
                            
                            return (
                              <button
                                key={key}
                                onClick={() => setCurrentMode({
                                  position: Number(key),
                                  color: effectiveColor || '#0880D7', // Fallback if somehow still empty
                                  detalle: hallazgo.detalle && hallazgo.detalle.length > 0 ? 0 : -1,
                                  cara: undefined, // Reset cara selection
                                })}
                                className={`px-2 py-1 rounded border text-xs font-medium transition-all ${colorClass} ${currentMode?.position === Number(key) ? (effectiveColor === '#E40000' ? 'bg-red-50 ring-1 ring-red-500' : 'bg-blue-50 ring-1 ring-blue-500') : 'bg-background'
                                  }`}
                              >
                                {hallazgo.denominacion}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {tiposNormales.length > 0 && (
                      <div className="space-y-1.5">
                        {tiposNormales.map(([key, hallazgo]) => (
                          <div key={key} className="bg-card border border-border rounded-md text-xs">
                            <div
                              className={`flex items-center p-1.5 cursor-pointer hover:bg-muted/50 rounded-t-md transition-colors ${currentMode?.position === Number(key) ? 'bg-muted' : ''
                                }`}
                              onClick={() => setCurrentMode({ position: Number(key), color: hallazgo.color === '' ? currentMode.color || '#0880D7' : hallazgo.color, detalle: hallazgo.detalle && hallazgo.detalle.length > 0 ? 0 : -1, cara: undefined })}
                            >
                              <span className="font-medium text-foreground flex-1">{hallazgo.denominacion}</span>
                              {(hallazgo.color === '' || (hallazgo.detalle && hallazgo.detalle.length > 0) || hallazgo.tipo === 'GI') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleDetails(key); }}
                                  className="ml-1 p-0.5 rounded hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground"
                                  title={openDetails[key] ? "Ocultar Opciones" : "Mostrar Opciones"}
                                >
                                  {openDetails[key] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              )}
                            </div>

                            {openDetails[key] && (
                              <div className="p-1.5 border-t border-border bg-muted/30 rounded-b-md">
                                {hallazgo.tipo === 'GI' && (
                                  <div className="flex items-center justify-around gap-1 my-1">
                                    <button onClick={() => setCurrentMode((prev) => ({ ...prev, direccion: 'izquierda' }))} className={`p-1 rounded-md transition-colors hover:bg-accent focus:bg-accent ${currentMode?.direccion === 'izquierda' && currentMode.position === Number(key) ? 'bg-accent text-accent-foreground ring-1 ring-primary' : 'text-muted-foreground'}`} title="Giroversión Izquierda"><ArrowLeft size={16} /></button>
                                    <button onClick={() => setCurrentMode((prev) => ({ ...prev, direccion: 'derecha' }))} className={`p-1 rounded-md transition-colors hover:bg-accent focus:bg-accent ${currentMode?.direccion === 'derecha' && currentMode.position === Number(key) ? 'bg-accent text-accent-foreground ring-1 ring-primary' : 'text-muted-foreground'}`} title="Giroversión Derecha"><ArrowRight size={16} /></button>
                                  </div>
                                )}
                                {hallazgo.color === '' && (
                                  <div className="flex flex-col gap-1 my-1">
                                    <button onClick={() => setCurrentMode((prev) => ({ ...prev, color: '#E40000' }))} className={`flex items-center p-1 rounded-md text-xs transition-colors hover:bg-red-100/50 ${currentMode?.color === '#E40000' && currentMode.position === Number(key) ? 'bg-red-100 text-red-700 ring-1 ring-red-500' : 'text-muted-foreground'}`} title="Mal estado"><div className="w-3 h-3 mr-1.5 rounded-full bg-red-500 border border-red-600"></div>Mal Estado</button>
                                    <button onClick={() => setCurrentMode((prev) => ({ ...prev, color: '#0880D7' }))} className={`flex items-center p-1 rounded-md text-xs transition-colors hover:bg-blue-100/50 ${currentMode?.color === '#0880D7' && currentMode.position === Number(key) ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500' : 'text-muted-foreground'}`} title="Buen estado"><div className="w-3 h-3 mr-1.5 rounded-full bg-blue-500 border border-blue-600"></div>Buen Estado</button>
                                  </div>
                                )}
                                {hallazgo.detalle && hallazgo.detalle.length > 0 && (
                                  <div className="flex flex-wrap gap-1 my-1">
                                    {hallazgo.detalle.map((item, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentMode(prev => ({ ...prev, position: Number(key), detalle: idx, color: hallazgo.color === '' ? prev.color || '#0880D7' : hallazgo.color || '#0880D7' }))}
                                        className={`px-1.5 py-0.5 rounded border text-[10px] leading-tight transition-colors ${currentMode?.detalle === idx && currentMode.position === Number(key) ? (hallazgo.color === '' ? (currentMode.color === '#0880D7' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-1 ring-blue-400' : 'bg-red-100 border-red-500 text-red-700 ring-1 ring-red-400') : (hallazgo.color === '#0880D7' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-1 ring-blue-400' : 'bg-red-100 border-red-500 text-red-700 ring-1 ring-red-400'))) : 'bg-background hover:bg-muted border-border text-foreground/80'}`}
                                      >{item.abreviatura || item.tipo}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="h-full">
            {selectedTooth !== null ? (
              <div className="p-1 space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                {dientes[selectedTooth] && Object.keys(dientes[selectedTooth]).length > 0 ? (
                  Object.entries(dientes[selectedTooth]).map(([code, hallazgoData]) => (
                    <div key={code} className="p-1.5 bg-card border border-border rounded-md shadow-sm text-xs">
                      <div onClick={() => handleRemoveToothCode(selectedTooth, code)} className="flex items-center justify-between p-1 font-medium text-foreground rounded-t-md cursor-pointer hover:bg-destructive/10 transition-colors" title="Click para eliminar toda la condición">
                        <span>{hallazgoData.nombre}</span>
                        <Trash2 size={14} className="text-destructive/70 hover:text-destructive" />
                      </div>
                      {hallazgoData.detalle && hallazgoData.detalle.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-border">
                          {hallazgoData.detalle.map((item, idx) => (
                            <div key={idx} className="flex items-center p-0.5 pl-1.5 bg-muted rounded border border-border text-foreground/90">
                              <span>{item.abreviatura || item.nombre}</span>
                              <button onClick={(e) => { e.stopPropagation(); handleRemoveToothCodeDetalle(selectedTooth, code, idx); }} aria-label="Eliminar detalle específico" title="Eliminar este detalle" className="ml-1 p-0.5 rounded hover:bg-destructive/20 text-destructive/80 hover:text-destructive"><Trash2 size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                       {hallazgoData.cara && hallazgoData.cara.length > 0 && (
                            <div className="mt-1 pt-1 border-t border-border">
                                <span className="text-xs text-muted-foreground">Caras afectadas: </span>
                                {hallazgoData.cara.map((caraItem, caraIdx) => (
                                    <span key={caraIdx} className="text-xs font-medium p-0.5 bg-gray-200 rounded mr-1" style={{ color: caraItem.color || hallazgoData.color }}>
                                        {caraItem.abreviatura || caraItem.tipo}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">Diente sin hallazgos.</div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm h-full flex items-center justify-center">Seleccione un diente para ver o eliminar hallazgos.</div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {toModal.to === 'toConfirmDelGroup' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-semibold text-foreground mb-2">Eliminar Hallazgo en Grupo</h2>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de eliminar el hallazgo <strong className="text-foreground">{(Hallazgos.find(h => h.tipo === toModal.code) || {denominacion: String(toModal.code)}).denominacion}</strong> para todos los dientes en el grupo seleccionado?
            </p>
            <div className="flex justify-end space-x-2">
              <button onClick={cancelarEliminacionGrupo} className="px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">Cancelar</button>
              <button onClick={confirmarEliminacionGrupo} className="px-3 py-1.5 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
      {toModal.to === 'toToothFace' && toModal.selectedTooth !== null && dientes[toModal.selectedTooth as number]?.[toModal.code] && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-primary">{dientes[toModal.selectedTooth as number]?.[toModal.code]?.nombre || "Seleccionar Caras"}</h2>
                    <p className="text-xs text-muted-foreground">Diente: {toModal.selectedTooth}</p>
                </div>
                <div className="p-4 flex-grow overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div className="flex flex-col items-center">
                        <p className="text-sm font-medium text-foreground mb-1">Caras del Diente</p>
                        <div className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] bg-muted/30 rounded-md flex items-center justify-center">
                            <Stage width={180} height={180} scaleX={0.8} scaleY={0.8} offsetX={-12.5} offsetY={-12.5}>
                                <Layer>
                                    <InteractiveFace
                                        onSelectCara={(hallazgo) =>
                                            setCurrentMode((prev) => ({
                                                ...prev,
                                                cara: { ...hallazgo, color: hallazgo.color || prev.color }, // Ensure color is passed
                                            }))
                                        }
                                    />
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Detalles del Hallazgo</p>
                        {Array.isArray(toModal.detalle) && toModal.detalle.length > 0 ? (
                            <div className="space-y-1">
                                {toModal.detalle.map((item, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setCurrentMode(prev => ({ ...prev, detalle: idx })) }
                                        className={`w-full text-left px-2 py-1 text-xs rounded-md border  focus:outline-none transition-colors
                                            ${currentMode.detalle === idx && currentMode.position === Hallazgos.findIndex(h => h.tipo === toModal.code) 
                                                ? 'bg-accent text-accent-foreground ring-1 ring-primary' 
                                                : 'bg-background hover:bg-muted border-input'}`}
                                    >
                                        {item.denominacion} ({item.abreviatura || item.tipo})
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">Sin detalles específicos.</p>
                        )}
                        {(toModal.code === 'LCD' || toModal.code === 'RD' || toModal.code === 'RT') && (
                            <div className="pt-2 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Estado/Color:</p>
                                <button 
                                    onClick={() => setCurrentMode((prev) => ({ ...prev, color: '#E40000' }))} 
                                    className={`w-full flex items-center px-2 py-1 text-xs rounded-md border transition-colors ${currentMode.color === '#E40000' ? 'bg-red-100 border-red-500 text-red-700 ring-1 ring-red-400' : 'bg-background hover:bg-red-50 border-input'}`}>
                                    <div className="w-2.5 h-2.5 mr-1.5 rounded-full bg-red-500 border border-red-600"></div> 
                                    {toModal.code === 'LCD' ? 'Caries Activa' : 'Mal Estado'}
                                </button>
                                <button 
                                    onClick={() => setCurrentMode((prev) => ({ ...prev, color: '#0880D7' }))} 
                                    className={`w-full flex items-center px-2 py-1 text-xs rounded-md border transition-colors ${currentMode.color === '#0880D7' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-1 ring-blue-400' : 'bg-background hover:bg-blue-50 border-input'}`}>
                                    <div className="w-2.5 h-2.5 mr-1.5 rounded-full bg-blue-500 border border-blue-600"></div> 
                                    {toModal.code === 'LCD' ? 'Caries Inactiva/Remineralizada' : 'Buen Estado'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-border flex justify-end space-x-2">
                    <button onClick={() => { setToModal({ selectedTooth: null, code: '', to: '' }); setCurrentMode(prev => ({...prev, cara: undefined, detalle: -1})); }} className="px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">Cerrar</button>
                    <button onClick={handleSaveFaceSelection} className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Aplicar Hallazgo</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default Teeth;

    