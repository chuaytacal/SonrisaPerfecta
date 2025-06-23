
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Group as KonvaGroup } from 'react-konva';
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Trash2, X } from "lucide-react";
import {ToothA, ToothB} from './Tooth';
import { Badge } from '@/components/ui/badge';
import { DientesMap, SettingSupperJaw, SettingsLowerJaw, SettingSupperJawPrimary, SettingsLowerJawPrimary, Hallazgos, CurrentMode, Hallazgo as HallazgoType, ToothDisplays, OpenModeal, DetalleHallazgo } from './setting';
import { InteractiveFace } from './ToothFace';
import { Button } from '@/components/ui/button';

type Props = {
  scalaTeeth: { x: number; y: number; moveTeethX: number; moveTeethY: number };
  scalaTooth: { scale: number; separation: number };
  typeTooth: 'Permanent' | 'Primary';
  onChangeDientes: (nuevo: DientesMap) => void;
  initialDientesMap: DientesMap;
};

export function Teeth({ scalaTeeth, scalaTooth, typeTooth, onChangeDientes, initialDientesMap }: Props) {
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'agregar' | 'eliminar'>('agregar');
  const [toModal, setToModal] = useState<OpenModeal>({
    selectedTooth: null,
    code: '',
    to: '',
    detalle: undefined,
    group: undefined,
  });
  const [colorHallazgo, setColorHallazgo] = useState<Record<any, string>>({});
  const [rangoSeleccion, setRangoSeleccion] = useState<Array<{ id: number; numTooth: number; jaw: 'superior' | 'inferior' }>>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const [dientes, setDientes] = useState<DientesMap>(initialDientesMap);
  const [toothDisplays, setToothDisplays] = useState<Record<number, ToothDisplays[]>>({});

  const [currentMode, setCurrentMode] = useState<CurrentMode>({
    position: -1,
    color: '#0880D7',
    detalle: -1,
    direccion: undefined,
    cara: undefined,
  });

  const { supperJawSettings, lowerJawSettings } = useMemo(() => {
    if (typeTooth === 'Primary') {
        return { supperJawSettings: SettingSupperJawPrimary, lowerJawSettings: SettingsLowerJawPrimary };
    }
    return { supperJawSettings: SettingSupperJaw, lowerJawSettings: SettingsLowerJaw };
  }, [typeTooth]);

  useEffect(() => {
    setDientes(initialDientesMap);
  }, [initialDientesMap]);
  
  useEffect(() => {
    onChangeDientes(dientes);

    const newDisplays: Record<number, ToothDisplays[]> = {};
    for (const toothNum in dientes) {
      const hallazgos = dientes[toothNum];
      const displaysForTooth: ToothDisplays[] = [];
      for (const code in hallazgos) {
        const hallazgo = hallazgos[code];
        if (hallazgo.abreviatura) {
            displaysForTooth.push({ abreviatura: hallazgo.abreviatura, color: hallazgo.color });
        }
        if (hallazgo.detalle) {
            hallazgo.detalle.forEach(d => {
                displaysForTooth.push({ abreviatura: d.abreviatura, color: hallazgo.color });
            });
        }
        if (hallazgo.cara) {
            Object.values(hallazgo.cara).forEach(c => {
                if (c.detalle) {
                    c.detalle.forEach(cd => {
                        if(c.abreviatura) {
                           displaysForTooth.push({ abreviatura: cd.abreviatura, color: c.color || hallazgo.color });
                        }
                    });
                } else if(c.abreviatura) {
                    displaysForTooth.push({ abreviatura: c.abreviatura, color: c.color || hallazgo.color });
                }
            });
        }
      }
      if (displaysForTooth.length > 0) {
        newDisplays[Number(toothNum)] = displaysForTooth;
      }
    }
    setToothDisplays(newDisplays);
  }, [dientes, onChangeDientes]);

  const toggleDetails = useCallback((key: string) => {
    setOpenDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const confirmGroupDeletion = useCallback(() => {
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
      }
      return newState;
    });

    setToModal({ selectedTooth: null, code: '', to: '', detalle: undefined, group: undefined });
  }, [toModal]);

 const handleRemoveToothCode = useCallback((currentSelectedTooth: number | null, code: string) => {
  if (currentSelectedTooth === null) return;
  const hallazgoEnDiente = dientes[currentSelectedTooth]?.[code];
  if (!hallazgoEnDiente) return;
  
  const grupo = hallazgoEnDiente.grupo;

  if (grupo && Array.isArray(grupo) && grupo.length > 0) {
    setToModal({ selectedTooth: currentSelectedTooth, code, group: grupo, to: 'toConfirmDelGroup', detalle: undefined });
  } else {
    setDientes((prev) => {
      const nuevo = { ...prev };
      if (nuevo[currentSelectedTooth]) {
        const nuevoDiente = { ...nuevo[currentSelectedTooth] };
        delete nuevoDiente[code];
        if (Object.keys(nuevoDiente).length === 0) {
          delete nuevo[currentSelectedTooth];
        } else {
          nuevo[currentSelectedTooth] = nuevoDiente;
        }
      }
      return nuevo;
    });
  }
}, [dientes]);


  const handleRemoveToothCodeDetalle = useCallback((currentSelectedTooth: number | null, code: string, idx: number) => {
    if (currentSelectedTooth === null) return;
    setDientes((prev) => {
      const newState = { ...prev };
      if (!newState[currentSelectedTooth] || !newState[currentSelectedTooth][code] || !newState[currentSelectedTooth][code].detalle) {
        return prev;
      }
      const hallazgoActual = newState[currentSelectedTooth][code];
      const nuevoDetalle = (hallazgoActual.detalle || []).filter((_, i) => i !== idx);
      newState[currentSelectedTooth] = {
        ...newState[currentSelectedTooth],
        [code]: {
          ...hallazgoActual,
          detalle: nuevoDetalle.length > 0 ? nuevoDetalle : undefined,
        },
      };
      return newState;
    });
  }, []);

  const handleRemoveFace = (toothNumber: any, code: any, caraName: any) => {
    setDientes(prevDientes => {
      const newDientes = JSON.parse(JSON.stringify(prevDientes));
      if (newDientes[toothNumber]?.[code]?.cara?.[caraName]) {
        delete newDientes[toothNumber][code].cara[caraName];
        if (Object.keys(newDientes[toothNumber][code].cara).length === 0) {
          delete newDientes[toothNumber][code].cara;
        }
        if (!newDientes[toothNumber][code].cara && !newDientes[toothNumber][code].detalle && !newDientes[toothNumber][code].grupo) {
          delete newDientes[toothNumber][code];
          if (Object.keys(newDientes[toothNumber]).length === 0) {
            delete newDientes[toothNumber];
          }
        }
      }
      return newDientes;
    });
  };
  
  
  const handleRemoveFaceDetalle = (toothNumber: number, code: string, caraName: string,index: number) => {
    setDientes(prevDientes => {
      const newDientes = JSON.parse(JSON.stringify(prevDientes));
      const detalles = newDientes[toothNumber]?.[code]?.cara?.[caraName]?.detalle;
      if (Array.isArray(detalles)) {
        detalles.splice(index, 1);
        if (detalles.length === 0) {
          delete newDientes[toothNumber][code].cara[caraName].detalle;
        }
      }
      return newDientes;
    });
  };

  const handleToothClick = useCallback((toothNum: number, id: number, jaw: 'superior' | 'inferior') => {
    if (currentMode.position === -1 && activeView === 'agregar') return;
    if (activeView === 'agregar') {
      const hallazgoDef = Hallazgos[currentMode.position];
      if (!hallazgoDef) return;
      const { tipo, denominacion, abreviatura, detalle: detalleDef, color: colorDef } = hallazgoDef;
      const colorFinal = colorDef === '' ? currentMode.color : colorDef;
      if (['AOF', 'AOR', 'ET', 'PDPF', 'PDC', 'PDPR'].includes(tipo)) {
        setRangoSeleccion((prevRango) => {
          const nuevoPunto = { id, numTooth: toothNum, jaw };
          return prevRango.length === 0 ? [nuevoPunto] : [prevRango[0], nuevoPunto];
        });
      } else if (['D', 'F', 'PDS', 'TD'].includes(tipo)) {
        const dentalArch = jaw === 'superior' ? supperJawSettings : lowerJawSettings;
        const nextId = dentalArch[id + 1] ? id + 1 : (id - 1 >=0 ? id -1 : -1) ;
        if (nextId !== -1) {
            const nextTooth = dentalArch[nextId]?.number;
            if (nextTooth) {
                setRangoSeleccion([{ id, numTooth: toothNum, jaw }, { id: nextId, numTooth: nextTooth, jaw }]);
            }
        }
      } else {
        if (['RT', 'RD', 'LCD'].includes(tipo)) {
          setToModal({ selectedTooth: toothNum, code: tipo, to: 'toToothFace', detalle: detalleDef });
        } else {
          setDientes((prevDientes) => {
            const dienteActual = prevDientes[toothNum] || {};
            const hallazgoActual = dienteActual[tipo] || {};
            const seleccionado = currentMode.detalle;
            const detalleSeleccionado = detalleDef?.[seleccionado];
            let nuevosDetalles: DetalleHallazgo[] = Array.isArray(hallazgoActual.detalle)
              ? [...hallazgoActual.detalle]
              : [];
            if (detalleSeleccionado) {
              const yaExiste = nuevosDetalles.some(d => d.abreviatura === detalleSeleccionado.tipo);
              if (!yaExiste) {
                nuevosDetalles.push({
                  abreviatura: detalleSeleccionado.tipo,
                  nombre: detalleSeleccionado.denominacion
                });
              }
            }
            const nuevoHallazgo: HallazgoType = {
              tipo,
              color: colorFinal,
              nombre: denominacion,
              abreviatura,
              ...(nuevosDetalles.length > 0 && { detalle: nuevosDetalles }),
              ...(currentMode.direccion && { direccion: currentMode.direccion }),
              ...(currentMode.cara && { cara: { [currentMode.cara.tipo]: currentMode.cara } })
            };
            return {
              ...prevDientes,
              [toothNum]: {
                ...dienteActual,
                [tipo]: nuevoHallazgo
              }
            };
          });
          setCurrentMode(prev => ({ ...prev, cara: undefined }));
        }
      }
    } else if (activeView === 'eliminar') {
      setSelectedTooth(toothNum);
    }
  }, [activeView, currentMode, dientes, supperJawSettings, lowerJawSettings]);

  useEffect(() => {
    if (rangoSeleccion.length === 2) {
      const { tipo, denominacion, abreviatura, detalle: detalleDef, color: colorDef } = Hallazgos[currentMode.position];
      const colorFinal = colorDef === '' ? currentMode.color : colorDef;
      const dentalArch = rangoSeleccion[0].jaw === 'superior' ? supperJawSettings : lowerJawSettings;
      const inicioId = Math.min(rangoSeleccion[0].id, rangoSeleccion[1].id);
      const finId = Math.max(rangoSeleccion[0].id, rangoSeleccion[1].id);
      setDientes((prevDientes) => {
        const newState = { ...prevDientes };
        const grupoAfectado: number[] = [];
        for (let i = inicioId; i <= finId; i++) {
          const tooth = dentalArch[i];
          if (!tooth) continue;
          if (['D', 'F', 'PDS', 'TD'].includes(tipo)) {
            if (i === rangoSeleccion[0].id || i === rangoSeleccion[1].id) {
              grupoAfectado.push(tooth.number);
            }
          } else {
            if (!newState[tooth.number]?.[tipo]) {
              grupoAfectado.push(tooth.number);
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
            });
        }
        return newState;
      });
      setRangoSeleccion([]);
    }
  }, [rangoSeleccion, currentMode, supperJawSettings, lowerJawSettings]);

  const handleSaveFaceSelection = useCallback(() => {
    const id = toModal.selectedTooth;
    const code = toModal.code;
  
    if (!id || !code || currentMode.cara === undefined || currentMode.position === undefined) return;
  
    const tipoCara = currentMode.cara.tipo;
    const hallazgoConfig = Hallazgos[currentMode.position];
  
    setDientes(prev => {
      const nuevos = { ...prev };
      const idKey: string = String(id);
  
      if (!nuevos[idKey]) nuevos[idKey] = {};
      const hallazgoExistente = nuevos[idKey][code];
  
      const nuevoHallazgo = hallazgoExistente ? JSON.parse(JSON.stringify(hallazgoExistente)) : {
        tipo: hallazgoConfig.tipo,
        abreviatura: hallazgoConfig.abreviatura,
        nombre: hallazgoConfig.denominacion,
        color: hallazgoConfig.color || currentMode.color,
        cara: {}
      };
      
      if (!nuevoHallazgo.cara) nuevoHallazgo.cara = {};
  
      const caraActual = nuevoHallazgo.cara?.[tipoCara];
      const nuevoDetalle = currentMode.cara?.detalle;
  
      if (caraActual) {
        const detalles = caraActual.detalle || [];
        const nuevosDetalles = nuevoDetalle
          ? [...detalles, nuevoDetalle].filter((d, i, arr) =>
              arr.findIndex(x => x.abreviatura === d.abreviatura) === i
            )
          : detalles;
  
        nuevoHallazgo.cara[tipoCara] = {
          ...caraActual,
          color: currentMode.cara?.color,
          detalle: nuevosDetalles
        };
      } else {
        nuevoHallazgo.cara[tipoCara] = {
          tipo: tipoCara,
          abreviatura: currentMode.cara?.abreviatura,
          nombre: currentMode.cara?.nombre,
          color: currentMode.cara?.color,
          ...(nuevoDetalle && { detalle: [nuevoDetalle] })
        };
      }
  
      nuevos[idKey][code] = nuevoHallazgo;
      return nuevos;
    });
  
    setToModal({ selectedTooth: '', code: '', to: '' });
    setCurrentMode(prev => ({ ...prev, cara: undefined }));
  }, [toModal, currentMode]);

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-2 md:p-4">
      {typeTooth === 'Permanent' ? (
        <div className="flex-grow order-2 md:order-1">
        <Stage width={scalaTeeth.x} height={scalaTeeth.y}>
          <Layer>
            <KonvaGroup x={scalaTeeth.moveTeethX} y={scalaTeeth.moveTeethY}>
              {SettingSupperJaw.map((setting, idx) => (
                <ToothA
                  key={`tooth-sup-${setting.number}`}
                  id={idx}
                  dientes={dientes[setting.number] || {}}
                  onClick={() => handleToothClick(setting.number, idx, 'superior')}
                  typeTeeth={setting.typeTooth}
                  rotated={Boolean(setting.rotated)}
                  reflected={Boolean(setting.reflected)}
                  numTooth={setting.number}
                  scale={scalaTooth.scale}
                  separation={scalaTooth.separation}
                  rangoSelect={rangoSeleccion.filter(r => r.jaw === 'superior')}
                  display={toothDisplays}
                />
              ))}
            </KonvaGroup>
            <KonvaGroup x={scalaTeeth.moveTeethX} y={scalaTeeth.moveTeethY+130}>
              {SettingsLowerJaw.map((setting, idx) => (
                <ToothA
                  key={`tooth-inf-${setting.number}`}
                  id={idx}
                  dientes={dientes[setting.number] || {}}
                  onClick={() => handleToothClick(setting.number, idx, 'inferior')}
                  typeTeeth={setting.typeTooth}
                  rotated={Boolean(setting.rotated)}
                  reflected={Boolean(setting.reflected)}
                  numTooth={setting.number}
                  scale={scalaTooth.scale}
                  separation={scalaTooth.separation}
                  rangoSelect={rangoSeleccion.filter(r => r.jaw === 'inferior')}
                  display={toothDisplays}
                />
              ))}
            </KonvaGroup>
          </Layer>
        </Stage>
        </div>       
      ) : (
        <div className="flex-grow order-2 md:order-1">
          <Stage width={scalaTeeth.x} height={scalaTeeth.y}>
            <Layer>
              <KonvaGroup x={scalaTeeth.moveTeethX} y={scalaTeeth.moveTeethY}>
                {SettingSupperJawPrimary.map((setting, idx) => (
                  <ToothB
                    key={`tooth-sup-${setting.number}`}
                    id={idx}
                    dientes={dientes[setting.number] || {}}
                    onClick={() => handleToothClick(setting.number, idx, 'superior')}
                    typeTeeth={setting.typeTooth}
                    rotated={Boolean(setting.rotated)}
                    reflected={Boolean(setting.reflected)}
                    numTooth={setting.number}
                    scale={scalaTooth.scale}
                    separation={scalaTooth.separation}
                    rangoSelect={rangoSeleccion.filter(r => r.jaw === 'superior')}
                    display={toothDisplays}
                  />
                ))}
              </KonvaGroup>
              <KonvaGroup x={scalaTeeth.moveTeethX} y={scalaTeeth.moveTeethY+130}>
                {SettingsLowerJawPrimary.map((setting, idx) => (
                  <ToothB
                    key={`tooth-inf-${setting.number}`}
                    id={idx}
                    dientes={dientes[setting.number] || {}}
                    onClick={() => handleToothClick(setting.number, idx, 'inferior')}
                    typeTeeth={setting.typeTooth}
                    rotated={Boolean(setting.rotated)}
                    reflected={Boolean(setting.reflected)}
                    numTooth={setting.number}
                    scale={scalaTooth.scale}
                    separation={scalaTooth.separation}
                    rangoSelect={rangoSeleccion.filter(r => r.jaw === 'inferior')}
                    display={toothDisplays}
                  />
                ))}
              </KonvaGroup>
            </Layer>
          </Stage>
        </div>        
      )}
      
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
                        else if (label.tipo === 'RD') colorClass = "border-blue-500 text-blue-600 hover:bg-blue-50";
                        else if (label.tipo === 'RT') colorClass = "border-red-500 text-red-600 hover:bg-red-50";
                        
                        return (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentMode({
                              position: Number(key),
                              color: label.color === '' ? '#0880D7' : label.color,
                              detalle: (label.detalle && label.detalle.length > 0) ? 0 : -1,
                              direccion: undefined,
                              cara: undefined,
                            })}
                            className={`h-auto py-1 px-2 ${colorClass} ${currentMode?.position === Number(key) ? (label.tipo === 'LCD' || label.tipo === 'RT' ? 'bg-red-50' : 'bg-blue-50') : ''}`}
                          >
                            {label.denominacion}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  {tiposNormales.length > 0 && (
                    <>
                      {tiposNormales.map(([key, label]) => (
                        <div key={key} className="mb-2">
                          <Button
                            variant="ghost"
                            className={`w-full justify-between h-auto py-2 px-3 text-left ${currentMode?.position === Number(key) ? 'bg-accent text-accent-foreground' : ''}`}
                            onClick={() =>{
                              if (label.tipo === 'GI'){
                                setCurrentMode({
                                  position: Number(key),
                                  color: label.color === '' ? colorHallazgo[key]?colorHallazgo[key]:'#0880D7' : label.color,
                                  detalle: (label.detalle && label.detalle.length > 0) ? 0 : -1,
                                  direccion: 'izquierda',
                                  cara: undefined,
                                })
                              }else{
                                setCurrentMode({
                                  position: Number(key),
                                  color: label.color === '' ? colorHallazgo[key]?colorHallazgo[key]:'#0880D7' : label.color,
                                  detalle: (label.detalle && label.detalle.length > 0) ? 0 : -1,
                                  direccion: undefined,
                                  cara: undefined,
                                })
                              }
                              if(!colorHallazgo[key])  setColorHallazgo(prev => ({ ...prev, [key]: label.color === '' ? currentMode.color : label.color }))
                            }} 
                          >
                            <span>{label.denominacion}</span>
                            {(label.color === '' || (label.detalle && label.detalle.length > 0) || label.tipo === 'GI') && (
                              <span onClick={(e) =>  { e.stopPropagation(); toggleDetails(key);}} className="text-muted-foreground hover:text-foreground">
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
                                  <Button variant={colorHallazgo[key] === '#E40000' ? 'destructive' : 'outline'} size="sm" className="w-full justify-start gap-2" 
                                    onClick={() => {
                                      const newColor = '#E40000';
                                      setColorHallazgo(prev => ({ ...prev, [key]: newColor }));
                                      if(currentMode?.position === Number(key)) {
                                        setCurrentMode(prev => ({ ...prev, color: newColor }));
                                      }
                                    }}
                                  ><div className="w-3 h-3 rounded-full bg-red-500"/>Mal estado</Button>
                                  <Button variant={colorHallazgo[key] === '#0880D7' ? 'default' : 'outline'} size="sm" className="w-full justify-start gap-2" 
                                   onClick={() => {
                                    const newColor = '#0880D7';
                                    setColorHallazgo(prev => ({ ...prev, [key]: newColor }));
                                    if(currentMode?.position === Number(key)) {
                                      setCurrentMode(prev => ({ ...prev, color: newColor }));
                                    }
                                  }}
                                  ><div className="w-3 h-3 rounded-full bg-blue-500"/>Buen estado</Button>
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
                  )}
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
                        <Trash2 size={16} />
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
                    {hallazgo.cara && (
                        <div className="space-y-4 border-t pt-2 mt-2">
                            {Object.entries(hallazgo.cara).map(([FaceName, FaceData]) => (
                              <div key={FaceName} className=" rounded-lg overflow-hidden"> 
                                <div  className="text-xs py-0.5 px-1.5 flex justify-between items-center mb-2 w-full">
                                  <span className="text-sm font-medium text-gray-600">{FaceData.nombre}</span>
                                  <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFace(selectedTooth, code, FaceName);
                                    }}
                                    className="text-xs text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 size={12}/>
                                  </button>
                                </div>
                                <div className="px-3 pb-3 space-y-3">
                                  {FaceData.detalle && FaceData.detalle.length > 0 && (
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap gap-2">
                                        {FaceData.detalle.map((item, idx) => (
                                          <Badge key={idx} variant="secondary" className="text-xs py-0.5 px-1.5 relative group">
                                            <span className="text-sm text-blue-700">{item.abreviatura}</span>
                                            <button
                                               onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFaceDetalle(selectedTooth, code, FaceName, idx);
                                              }}       
                                              className="ml-1 text-gray-400 hover:text-red-500"
                                            >
                                              <X size={14} />
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
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

      {toModal.to === 'toConfirmDelGroup' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Eliminar Hallazgo en Grupo</h2>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Estás seguro de que deseas eliminar el hallazgo &quot;{Hallazgos.find(h => h.tipo === toModal.code)?.denominacion || toModal.code}&quot; de todos los dientes en el grupo seleccionado?
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={()=>setToModal({ selectedTooth: null, code: '', to: '', detalle: undefined, group: undefined })}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmGroupDeletion}>Sí, eliminar</Button>
            </div>
          </div>
        </div>
      )}

      {toModal.to === 'toToothFace' && toModal.selectedTooth !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setToModal({ selectedTooth: '', code: '', to: '' })}
        >
          <div
             onClick={(e) => e.stopPropagation()}
             className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
          >
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-primary">
                  {dientes[toModal.selectedTooth]?.[toModal.code!]?.nombre || Hallazgos.find(h => h.tipo === toModal.code)?.denominacion}
                </h2>
                <p className="text-sm text-muted-foreground">Seleccione la cara afectada y/o el tipo de hallazgo.</p>
              </div>
              
              <div className="p-6 flex-grow overflow-y-auto space-y-4">
                <div className="flex items-center justify-center">
                  <Stage width={150} height={150}>
                    <Layer scaleX={0.75} scaleY={0.75} x={0} y={0}>
                      <InteractiveFace
                        onSelectCara={(hallazgo) =>
                          setCurrentMode((prev) => ({
                            ...prev,
                            cara: {
                              ...hallazgo,
                              color: prev.color,
                            },
                          }))
                        }
                        color={currentMode.color}
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
                          variant={currentMode?.cara?.detalle?.abreviatura === item.tipo? 'default' : 'outline'}
                          size="sm"
                          className="w-full justify-start whitespace-normal h-auto py-2"
                          onClick={() =>
                            setCurrentMode((prev) => ({
                              ...prev,
                              cara: prev.cara
                                ? {
                                    ...prev.cara,
                                    detalle: {
                                      abreviatura: item.tipo,
                                      nombre: item.denominacion,
                                    },
                                  }
                                : undefined,
                            }))
                          }
                        >
                          {item.denominacion} ({item.tipo})
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {(toModal.code === 'RD') && (
                  <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Estado:</label>
                      <div className="flex gap-2">
                          <Button variant={currentMode.color === '#E40000' ? 'destructive' : 'outline'} size="sm" className="flex-1 justify-start gap-2" 
                            onClick={() =>{
                              const nuevoColor = '#E40000';
                              setCurrentMode((prev) => ({
                                ...prev,
                                color: nuevoColor,
                                cara: prev.cara ? { ...prev.cara, color: nuevoColor } : undefined,
                              }));
                            }}
                          ><div className="w-3 h-3 rounded-full bg-red-500"/>Mal estado</Button>
                          <Button variant={currentMode.color === '#0880D7' ? 'default' : 'outline'} size="sm" className="flex-1 justify-start gap-2" 
                            onClick={() =>
                              setCurrentMode((prev) => {
                                const nuevoColor = '#0880D7';
                                return {
                                  ...prev,
                                  color: nuevoColor,
                                  cara: prev.cara ? { ...prev.cara, color: nuevoColor } : undefined,
                                };
                              })
                            }
                          ><div className="w-3 h-3 rounded-full bg-blue-500"/>Buen estado</Button>
                      </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex justify-end space-x-2">
                <Button variant="outline" onClick={() =>{
                  setToModal({ selectedTooth: '', code: '', to: '', detalle: undefined, group: undefined })
                  setCurrentMode(prev => ({
                    ...prev,
                    detalle: -1
                  }));
                }}>Cancelar</Button>
                <Button onClick={handleSaveFaceSelection}>Guardar Selección</Button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default Teeth;

    