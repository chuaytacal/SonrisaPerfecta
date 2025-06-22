'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Stage, Layer, Group as KonvaGroup } from 'react-konva'; // Renamed Group to KonvaGroup to avoid conflict if any
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight,Trash2, X } from "lucide-react";
import {ToothA, ToothB} from './Tooth';
import { Badge } from '@/components/ui/badge';
import { DientesMap, SettingSupperJaw, SettingsLowerJaw,SettingSupperJawPrimary, SettingsLowerJawPrimary, Hallazgos, CurrentMode, Hallazgo as HallazgoType, ToothDisplays, OpenModeal, DetalleHallazgo } from './setting';
import { InteractiveFace } from './ToothFace';
import { Button } from '@/components/ui/button'; // For modal buttons
type Props = {
  scalaTeeth: { x: number; y: number; moveTeethX: number; moveTeethY: number };
  scalaTooth: { scale: number; separation: number };
  typeTooth: string;
  onChangeDientes: (nuevo: DientesMap) => void; 
};

export function Teeth({ scalaTeeth, scalaTooth, typeTooth,onChangeDientes  }: Props) {
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'agregar' | 'eliminar'>('agregar');
  const [toModal, setToModal] = useState<OpenModeal>({
    selectedTooth: null, // Changed from string to number | null
    code: '',
    to: '',
    detalle: undefined, // Make sure this is aligned with OpenModeal type
    group: undefined,   // Make sure this is aligned with OpenModeal type
  });
  const [colorHallazgo, setColorHallazgo] = useState<Record<any, string>>({});
  const [rangoSeleccion, setRangoSeleccion] = useState<Array<{ id: number; numTooth: number; jaw: 'superior' | 'inferior' }>>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null); // For delete view

  const [toothDisplays, setToothDisplays] = useState<Record<number, ToothDisplays[]>>({});
  const [currentMode, setCurrentMode] = useState<CurrentMode>({
    position: -1,
    color: '#0880D7', // Default to a neutral/blue color
    detalle: -1,
    direccion: undefined,
    cara: undefined,
  });
  const [dientes, setDientes] = useState<DientesMap>({});

  //otros
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

 //Eliminar hallazgos
 const handleRemoveToothCode = useCallback((currentSelectedTooth: number | null, code: string) => {
  if (currentSelectedTooth === null) return;

  const hallazgoEnDiente = dientes[currentSelectedTooth]?.[code];
  const grupo = hallazgoEnDiente?.grupo;

  if (grupo && Array.isArray(grupo) && grupo.length > 0) {
    setToModal({ selectedTooth: currentSelectedTooth, code, group: grupo, to: 'toConfirmDelGroup', detalle: undefined });
  } else {
    const diente = hallazgoEnDiente || {};

    // Obtener abreviaturas desde detalle
    let abreviaturasAEliminar: string[] = [];

    if (Array.isArray(diente.detalle)) {
      abreviaturasAEliminar = diente.detalle.map((det) => det.abreviatura);
    } else if (diente.abreviatura) {
      abreviaturasAEliminar = [diente.abreviatura];
    }

    // Si tiene caras, obtener abreviaturas desde ahí
    if (diente.cara) {
      const abreviaturasDesdeCara: string[] = [];
      Object.values(diente.cara).forEach((caraObj: any) => {
        if (Array.isArray(caraObj.detalle)) {
          caraObj.detalle.forEach((det: any) => {
            if (det.abreviatura) abreviaturasDesdeCara.push(det.abreviatura);
          });
        }
      });

      setToothDisplays((prev) => {
        const current = prev[currentSelectedTooth] || [];
        const filtrados = current.filter(
          (item) => !abreviaturasDesdeCara.includes(item.abreviatura)
        );

        return {
          ...prev,
          [currentSelectedTooth]: filtrados
        };
      });

    } else {
      setToothDisplays((prev) => {
        const current = prev[currentSelectedTooth] || [];
        const filtrados = current.filter(
          (item) => !abreviaturasAEliminar.includes(item.abreviatura)
        );

        return {
          ...prev,
          [currentSelectedTooth]: filtrados
        };
      });
    }

    // Eliminar del estado de dientes
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
}, [dientes, toothDisplays]);


  const handleRemoveToothCodeDetalle = useCallback((currentSelectedTooth: number | null, code: string, idx: number) => { // cambiar
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

  const handleRemoveFace = (toothNumber: any, code: any, caraName: any) => {
    const clonedDientes = JSON.parse(JSON.stringify(dientes));
    const detalle = clonedDientes[toothNumber]?.[code]?.cara?.[caraName]?.detalle;
  
    const abreviaturasAEliminar = Array.isArray(detalle)
      ? detalle.map(d => d.abreviatura)
      : [];
  
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
  
    setToothDisplays(prev => {
      const prevDisplays = prev[toothNumber] || [];
      const updatedDisplays = prevDisplays.filter(
        d => !abreviaturasAEliminar.includes(d.abreviatura)
      );
  
      return {
        ...prev,
        [toothNumber]: updatedDisplays
      };
    });
  };
  
  
  const handleRemoveFaceDetalle = (toothNumber: number, code: string, caraName: string,index: number) => {
    // 1. Actualizar `dientes` eliminando el `detalle[index]` de esa cara
    setDientes(prevDientes => {
      const newDientes = JSON.parse(JSON.stringify(prevDientes));
  
      const detalles = newDientes[toothNumber]?.[code]?.cara?.[caraName]?.detalle;
  
      if (Array.isArray(detalles)) {
        detalles.splice(index, 1); // eliminar el elemento por índice
  
        // Si ya no hay detalles, se puede eliminar la propiedad `detalle`
        if (detalles.length === 0) {
          delete newDientes[toothNumber][code].cara[caraName].detalle;
        }
      }
  
      return newDientes;
    });
  
    // 2. También actualizar `toothDisplays` para eliminar ese detalle por abreviatura
    setToothDisplays(prev => {
      const prevDisplays = prev[toothNumber] || [];
  
      // Tomar la abreviatura a eliminar (puedes acceder desde `dientes` original también)
      const abreviaturaAEliminar = dientes[toothNumber]?.[code]?.cara?.[caraName]?.detalle?.[index]?.abreviatura;
  
      const filteredDisplays = prevDisplays.filter(
        (d) => d.abreviatura !== abreviaturaAEliminar
      );
  
      return {
        ...prev,
        [toothNumber]: filteredDisplays
      };
    });
  };

  //agregar hallazgos
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
        if (tipo === 'RT' || tipo === 'RD' || tipo === 'LCD') {
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
      
            // Armar nuevo hallazgo
            const nuevoHallazgo: HallazgoType = {
              tipo,
              color: colorFinal,
              nombre: denominacion,
              abreviatura,
              ...(nuevosDetalles.length > 0 && { detalle: nuevosDetalles }),
              ...(currentMode.direccion && { direccion: currentMode.direccion }),
              ...(currentMode.cara && { cara: [currentMode.cara] })
            };
      
            // Actualizar toothDisplays
            const abreviaturaDisplay = detalleSeleccionado
              ? detalleSeleccionado.tipo
              : currentMode.cara
              ? currentMode.cara.abreviatura
              : abreviatura;
      
            if (abreviaturaDisplay && abreviaturaDisplay !== '') {
              const nuevoDisplay: ToothDisplays = {
                abreviatura: abreviaturaDisplay,
                color: colorFinal
              };
      
              setToothDisplays(prev => {
                const existentes = prev[toothNum] || [];
      
                const yaExiste = existentes.some(d => d.abreviatura === nuevoDisplay.abreviatura);
                if (yaExiste) return prev;
      
                return {
                  ...prev,
                  [toothNum]: [...existentes, nuevoDisplay]
                };
              });
            }
      
            return {
              ...prevDientes,
              [toothNum]: {
                ...dienteActual,
                [tipo]: nuevoHallazgo
              }
            };
          });
      
          setCurrentMode(prev => ({
            ...prev,
            cara: undefined
          }));
        }
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
          const tooth = dentalArch[i];
          if (!tooth) continue;
        
          const esTipoEspecial = ['D', 'F', 'PDS', 'TD'].includes(tipo);
        
          if (esTipoEspecial) {
            const esSeleccionado = i === rangoSeleccion[0].id || i === rangoSeleccion[1].id;
            if (esSeleccionado) {
              grupoAfectado.push(tooth.number);
            }
          } else {
            const yaTieneHallazgo = newState[tooth.number]?.[tipo];
            if (!yaTieneHallazgo) {
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
                // if (abreviatura) {
                //     setToothDisplays(prevDisp => ({ ...prevDisp, [numDiente]: { abreviatura, color: colorFinal }}));
                // }
            });
        }
        return newState;
      });
      setRangoSeleccion([]);
    }
  }, [rangoSeleccion]);

  const handleSaveFaceSelection = useCallback(() => {
    const id = toModal.selectedTooth;
    const code = toModal.code;
  
    // Validación de condiciones esenciales
    if (!id || !code || currentMode.cara === undefined || currentMode.position === undefined) return;
  
    const tipoCara = currentMode.cara.tipo;
    const hallazgoConfig = Hallazgos[currentMode.position];
  
    // Actualización del estado 'dientes'
    setDientes(prev => {
      const nuevos = { ...prev };
      const idKey: string = String(id);
  
      // Inicializar estructuras si no existen
      if (!nuevos[idKey]) nuevos[idKey] = {};
      if (!nuevos[idKey][code]) {
        nuevos[idKey][code] = {
          tipo: hallazgoConfig.tipo,
          abreviatura: hallazgoConfig.abreviatura,
          nombre: hallazgoConfig.denominacion,
          cara: {}
        };
      }
  
      const hallazgo = nuevos[idKey][code];
      const anterior = prev[idKey]?.[code];
  
      // Preservar atributos anteriores
      if (anterior?.grupo) hallazgo.grupo = anterior.grupo;
      if (anterior?.direccion) hallazgo.direccion = anterior.direccion;
      if (anterior?.detalle) hallazgo.detalle = anterior.detalle;
  
      // Manejo de actualización o creación de cara
      const caraActual = hallazgo.cara?.[tipoCara];
      const nuevoDetalle = currentMode.cara?.detalle;
  
      if (caraActual) {
        const detalles = caraActual.detalle || [];
        const nuevosDetalles = nuevoDetalle
          ? [...detalles, nuevoDetalle].filter((d, i, arr) =>
              arr.findIndex(x => x.abreviatura === d.abreviatura) === i
            )
          : detalles;
  
        hallazgo.cara[tipoCara] = {
          ...caraActual,
          color: currentMode.cara?.color,
          detalle: nuevosDetalles
        };
      } else {
        hallazgo.cara[tipoCara] = {
          tipo: tipoCara,
          abreviatura: currentMode.cara?.abreviatura,
          nombre: currentMode.cara?.nombre,
          color: currentMode.cara?.color,
          ...(nuevoDetalle && { detalle: [nuevoDetalle] })
        };
      }
  
      return nuevos;
    });
  
    // Actualización del estado 'toothDisplays' si hay detalle válido
    const displayAbreviatura = currentMode.cara?.detalle?.abreviatura;
    if (displayAbreviatura) {
      setToothDisplays(prev => {
        const actuales = prev[id] || [];
        const yaExiste = actuales.some(d => d.abreviatura === displayAbreviatura);
        if (yaExiste) return prev;
  
        return {
          ...prev,
          [id]: [...actuales, { abreviatura: displayAbreviatura, color: currentMode.cara.color }]
        };
      });
    }
  
    // Reset de estados temporales
    setToModal({ selectedTooth: '', code: '', to: '' });
    setCurrentMode(prev => ({ ...prev, cara: undefined }));
  }, [toModal, currentMode, Hallazgos]);
  
    
  
  //control
  useEffect(() => {
    console.log(dientes);
    onChangeDientes(dientes);
  }, [dientes]);

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-2 md:p-4">
      {typeTooth === 'Permanent' && (
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
      )}
      {typeTooth === 'Primary' && (
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
                        else if (label.tipo === 'RD') colorClass = "border-blue-500 text-blue-600 hover:bg-blue-50";
                        else if (label.tipo === 'RT') colorClass = "border-red-500 text-red-600 hover:bg-red-50";
                        
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
                              let newMode;
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
                            }
                            } 
                          >
                            <span>{label.denominacion}</span>
                            {(label.color === '' || (label.detalle && label.detalle.length > 0) || label.tipo === 'GI') && (
                              <span onClick={() =>  toggleDetails(key)} className="text-muted-foreground hover:text-foreground">
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
                                      const isSameKey = currentMode?.position === Number(key);
                                    
                                      // Si el hallazgo no tiene color predeterminado
                                      let finalColor: string;
                                      if (label.color === '') {
                                        finalColor = isSameKey
                                          ? '#E40000' // Si es el mismo, forzar color base al volver a hacer clic
                                          : (colorHallazgo[key] || '#E40000'); // Si es otro, usa color guardado si hay
                                      } else {
                                        finalColor = label.color;
                                      }
                                    
                                      // Guardamos en el estado compartido de colores por hallazgo
                                      setColorHallazgo(prev => ({ ...prev, [key]: finalColor }));
                                    
                                      // Actualizamos el modo activo
                                      setCurrentMode(prev => ({ ...prev, color: finalColor }));
                                    }}
                                    
                                  ><div className="w-3 h-3 rounded-full bg-red-500"/>Mal estado</Button>
                                  <Button variant={colorHallazgo[key] === '#0880D7' ? 'default' : 'outline'} size="sm" className="w-full justify-start gap-2" 
                                   onClick={() => {
                                    const isSameKey = currentMode?.position === Number(key);
                                  
                                    // Si el hallazgo no tiene color predeterminado
                                    let finalColor: string;
                                    if (label.color === '') {
                                      finalColor = isSameKey
                                        ? '#0880D7' // Si es el mismo, forzar color base al volver a hacer clic
                                        : (colorHallazgo[key] || '#0880D7'); // Si es otro, usa color guardado si hay
                                    } else {
                                      finalColor = label.color;
                                    }
                                  
                                    // Guardamos en el estado compartido de colores por hallazgo
                                    setColorHallazgo(prev => ({ ...prev, [key]: finalColor }));
                                  
                                    // Actualizamos el modo activo
                                    setCurrentMode(prev => ({ ...prev, color: finalColor }));
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
                        <Trash2 size={16} onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveToothCode(selectedTooth, code);
                        }}/>
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
                        <div className="space-y-4 border-t pt-2">
                            {Object.entries(hallazgo.cara).map(([FaceName, FaceData]) => (
                              <div key={code} className=" rounded-lg overflow-hidden"> 
                                <div  className="text-xs py-0.5 px-1.5 border-blue-500 text-blue-600 flex justify-between items-center mb-2 w-full">
                                  <span className="text-sm font-medium text-gray-600">{FaceData.nombre}</span>
                                  <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFace(selectedTooth, code, FaceName);
                                    }}
                                    className="text-xs text-gray-400 hover:text-red-500"
                                  >
                                    Eliminar cara
                                  </button>
                                </div>
                                <div className="px-3 pb-3 space-y-3">
                                  {FaceData.detalle &&  FaceData?.detalle?.length > 0 && (
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

      {/* Modals */}
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
        >
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
                          variant={currentMode?.cara?.detalle?.abreviatura == item.tipo? 'default' : 'outline'}
                          size="sm"
                          className="w-full justify-start"
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
                              setCurrentMode((prev) => {
                                const nuevoColor = '#E40000';
                                return {
                                  ...prev,
                                  color: nuevoColor,
                                  cara: prev.cara ? { ...prev.cara, color: nuevoColor } : undefined,
                                };
                              })
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
        </div>
      )}
    </div>
  );
}

export default Teeth;
