'use client';

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight,Trash2 } from "lucide-react";
import ToothA from './Tooth';
import type { DientesMap, SettingSupperJaw, SettingsLowerJaw, Hallazgos as HallazgosType, CurrentMode, Hallazgo, ToothDisplays, OpenModeal } from './setting';
import { Hallazgos } from './setting'; // Importar Hallazgos como valor
import {InteractiveFace} from './ToothFace';


export function Teeth() {
  const [openDetails, setOpenDetails] = useState<any>({});
  const [activeView, setActiveView] = useState('agregar');
  const [toModal, setToModal] = useState<OpenModeal>({
    selectedTooth: '',
    code: '',
    to: ''
  });
  const [rangoSeleccion, setRangoSeleccion] = useState<Array<{id: number; numTooth: number; jaw: 'superior' | 'inferior'}>>([]);
  const [selectedTooth, setSelectedTooth] = useState<any>(null);
  // const [findByFace, setfindByFace] = useState<any>([]);

  const [toothDisplays, setToothDisplays] = useState<Record<any,ToothDisplays>>({});
  const [currentMode, setCurrentMode] = useState<CurrentMode>({
    position: -1,
    color: 'red',
    detalle: -1,
  });
  const [dientes, setDientes] = useState<DientesMap>({});

  const toggleDetails = (key: any) => {
    setOpenDetails((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }))
  };
  function handleRemoveToothCode(selectedTooth: any, code:any) {
    const grupo = dientes[selectedTooth]?.[code]?.grupo;

    if (grupo && Array.isArray(grupo) && grupo.length > 0) {
      // Hay un grupo, primero ponemos en state para confirmar
      setToModal({ selectedTooth, code, group: grupo, to: 'toConfirmDelGroup' });
    } else {
      if (dientes[selectedTooth]?.[code]?.detalle) {
        setToothDisplays((prev) => {
          const nuevo = { ...prev };
          delete nuevo[selectedTooth];
          return nuevo;
        });
      }

      // Elimina directamente
      setDientes((prev) => {
        const nuevo = { ...prev };
        if (nuevo[selectedTooth]) {
          delete nuevo[selectedTooth][code];
          if (Object.keys(nuevo[selectedTooth]).length === 0) {
            delete nuevo[selectedTooth];
          }
        }
        return nuevo;
      });
    }
  }

  function confirmarEliminacionGrupo() {
    if (!toModal || !toModal.group || !toModal.code) return;

    const { code, group } = toModal;

    setDientes((prev) => {
      const nuevo = { ...prev };
      for (const diente of group) {
        if (nuevo[diente] && nuevo[diente][code]) {
          delete nuevo[diente][code];
          if (Object.keys(nuevo[diente]).length === 0) {
            delete nuevo[diente];
          }
        }
      }
      return nuevo;
    });

    setToModal({
      selectedTooth: '',
      code: '',
      to: ''
    });
  }

  function cancelarEliminacionGrupo() {
    setToModal({
      selectedTooth: '',
      code: '',
      to: ''
    });
  }

  function handleRemoveToothCodeDetalle(selectedTooth: any, code: any, idx: any) {
    if (dientes[selectedTooth]?.[code]?.detalle?.[idx]?.abreviatura === toothDisplays[selectedTooth]?.abreviatura) {
      const detalleArray = dientes[selectedTooth]?.[code]?.detalle || [];

      let newData = '';

      if (detalleArray[idx - 1]) {
        newData = detalleArray[idx - 1].abreviatura;
      } else if (detalleArray[idx + 1]) {
        newData = detalleArray[idx + 1].abreviatura;
      }

      setToothDisplays((prev) => {
        const nuevo = { ...prev };
        if (nuevo[selectedTooth]) {
         nuevo[selectedTooth].abreviatura = newData;
        }
        return nuevo;
      });
    }

    setDientes((prev) => {
      const nuevo = { ...prev };
      if (nuevo[selectedTooth]?.[code]?.detalle) {
        const newDetalle = [...nuevo[selectedTooth][code].detalle];
        newDetalle.splice(idx, 1);
        nuevo[selectedTooth][code].detalle = newDetalle;

        // Si el array de detalle queda vacío, se podría considerar eliminar la propiedad 'detalle'
        // o incluso la entrada del código si no tiene más información relevante.
        // Por ahora, solo se elimina el item del array.
      }
      return nuevo;
    });

  }

  const handleToothClick = (toothNum: any, id: any, jaw: 'superior' | 'inferior') => {
      if(activeView ==='agregar'){
        if (currentMode.position === -1 || !Hallazgos[currentMode.position]) return; // No hay modo seleccionado

        const { tipo, denominacion, abreviatura, detalle, color } = Hallazgos[currentMode.position];
        const SettingSupperJawVal = SettingSupperJaw; // Asignar a una variable local
        const SettingsLowerJawVal = SettingsLowerJaw; // Asignar a una variable local


        if (tipo === 'AOF' ||
            tipo === 'AOR' ||
            tipo === 'ET' ||
            tipo === 'PDPF' ||
            tipo === 'PDC' ||
            tipo === 'PDPR') {
          // rango de selección
          setRangoSeleccion((prev) => {
            const nuevo = { id, numTooth: toothNum, jaw };
            if (prev.length === 0) return [nuevo];
            // Prevenir duplicados si se clickea el mismo diente dos veces
            if (prev.length === 1 && prev[0].id === nuevo.id && prev[0].numTooth === nuevo.numTooth) return prev;
            return [prev[0], nuevo];
          });

        } else if (tipo === 'D' ||
                  tipo === 'F' ||
                  tipo === 'PDS' ||
                  tipo === 'TD') {
          const dentalArch = jaw === 'superior' ? SettingSupperJawVal : SettingsLowerJawVal;

          // Después vemos primero el siguiente, si existe; si no, el anterior
          const nextId = dentalArch[id + 1] ? id + 1 : (dentalArch[id-1] ? id -1 : -1);
          if (nextId === -1) return; // No hay adyacente
          const nextTooth = dentalArch[nextId]?.number;

          if (nextTooth) {
            setRangoSeleccion([
              { id: id, numTooth: toothNum, jaw },
              { id: nextId, numTooth: nextTooth, jaw }
            ]);
          }

        }
        else {
          setDientes((prev) => {
            const current = prev[toothNum] || {};
            const seleccionado = currentMode.detalle;

            let nuevoDetalleArray: Hallazgo['detalle'] = current[Hallazgos[currentMode.position].tipo]?.detalle || [];

            if (currentMode.detalle !== -1 && detalle && detalle[seleccionado]){
              const yaExiste = nuevoDetalleArray?.some(d => d.abreviatura === detalle[seleccionado].tipo );
              if (!yaExiste) {
                if (!Array.isArray(nuevoDetalleArray)) nuevoDetalleArray = [];
                nuevoDetalleArray.push({abreviatura: detalle[seleccionado].tipo, nombre:detalle[seleccionado].denominacion});
              }
            }
            let nuevoValor: Hallazgo = {
              tipo: tipo,
              color: color === '' ? currentMode.color : color,
              nombre: denominacion,
              abreviatura: abreviatura,
            };

            if (currentMode.detalle !== -1 && detalle && detalle[seleccionado] && !(tipo === 'RT' ||tipo === 'RD' ||tipo === 'LCD')){
              nuevoValor.detalle = nuevoDetalleArray;
              setToothDisplays( (prevDisplays: any)=>{
                return {
                  ...prevDisplays,
                  [toothNum]: {abreviatura: detalle[seleccionado].tipo, color: color === '' ? currentMode.color : color},
                };
              }
              );
            }else if(abreviatura!== ''){
              setToothDisplays( (prevDisplays:any)=>{
                return {
                  ...prevDisplays,
                  [toothNum]: {abreviatura: abreviatura, color: color === '' ? currentMode.color : color},
                };
              })
            }


            if (currentMode?.direccion) nuevoValor.direccion = currentMode?.direccion;


            return {
              ...prev,
              [toothNum]: {
                ...current,
                [tipo]:nuevoValor,
              },
            };
          });

          if(tipo === 'RT' ||tipo === 'RD' ||tipo === 'LCD' ){
            setToModal({ selectedTooth: toothNum, code: tipo, to: 'toToothFace', detalle: detalle});
          }
        }
      }else if(activeView ==='eliminar'){
        setSelectedTooth(toothNum);
      }
  };

  useEffect(() => {
    if (rangoSeleccion.length === 2) {
      const inicio = Math.min(rangoSeleccion[0].id, rangoSeleccion[1].id);
      const fin = Math.max(rangoSeleccion[0].id, rangoSeleccion[1].id);
      if (currentMode.position === -1 || !Hallazgos[currentMode.position]) {
        setRangoSeleccion([]);
        return;
      }
      const { tipo, denominacion, abreviatura, detalle, color } = Hallazgos[currentMode.position];
      const SettingSupperJawVal = SettingSupperJaw; // Asignar a una variable local
      const SettingsLowerJawVal = SettingsLowerJaw; // Asignar a una variable local
      const dentalArch = rangoSeleccion[0].jaw === 'superior' ? SettingSupperJawVal : SettingsLowerJawVal;

      setDientes((prev) => {
        const nuevo = { ...prev };
        const group: number[] = [];

        for (let i = inicio; i <= fin; i++) {
          const tooth = dentalArch[i];
          if (tooth && (!nuevo[tooth.number]?.[tipo] ||
              tipo === 'D' ||
              tipo === 'F' ||
              tipo === 'PDS' ||
              tipo === 'TD')) {
            group.push(tooth.number);
          }
        }
        for (let number of group) {
          nuevo[number] = {
            ...(nuevo[number] || {}),
            [tipo]: {
              tipo: tipo,
              color: color===''? currentMode.color: color,
              nombre: denominacion,
              grupo: group,
              abreviatura: abreviatura,
              detalle: (detalle && currentMode.detalle !== -1 && detalle[currentMode.detalle]) ? [{abreviatura: detalle[currentMode.detalle].tipo, nombre: detalle[currentMode.detalle].denominacion}] : []
            }
          };
        }
        return nuevo;
      });

      setRangoSeleccion([]);

    }
  }, [rangoSeleccion, currentMode.position, currentMode.color, currentMode.detalle, dientes]); // Added dientes to dependency array

  useEffect(() => {
    console.log(dientes);
  }, [dientes]);

  useEffect(() => {
    console.log(toModal);
  }, [toModal]);

  useEffect(() => {
    console.log('curret: ',currentMode);
  }, [currentMode]);

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-2 md:p-4 bg-card rounded-lg shadow">
      <div className="flex-grow order-2 md:order-1">
        <div className="flex justify-center">
          {SettingSupperJaw.map((setting, idx) => {
            return (
              <div
                key={idx}
                onClick={() => setSelectedTooth(setting.number)}
                className="bg-gray-200 m-0.5 p-1 text-center cursor-pointer h-8 w-10 md:h-10 md:w-12 text-xs md:text-sm flex items-center justify-center"
                style={{ color: toothDisplays[setting.number]?.color }}
              >
                {toothDisplays[setting.number]?.abreviatura || setting.number}
              </div>
            )
          })}
        </div>
        <div className='overflow-x-auto'>
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
          {SettingsLowerJaw.map((setting, idx) => {
            return (
              <div
                key={idx}
                onClick={() => setSelectedTooth(setting.number)}
                className="bg-gray-200 m-0.5 p-1 text-center cursor-pointer h-8 w-10 md:h-10 md:w-12 text-xs md:text-sm flex items-center justify-center"
                style={{ color: toothDisplays[setting.number]?.color }}
              >
                {toothDisplays[setting.number]?.abreviatura || setting.number}
              </div>
            )
          })}
        </div>
      </div>
      <div className="w-full md:w-72 lg:w-80 order-1 md:order-2 space-y-3">
        <div className="flex items-center space-x-2 border-b pb-2 mb-2">
          <button
            onClick={() => {
              setActiveView('agregar');
              setSelectedTooth(null);
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeView === 'agregar'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Agregar
          </button>
          <button
            onClick={() => setActiveView('eliminar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeView === 'eliminar'
                ? 'bg-destructive text-destructive-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Eliminar
          </button>
        </div>
        {activeView === 'agregar' ? (
          <div className="text-sm">
            <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-1 space-y-1.5">
              {(() => {
                const tiposEspeciales: any = [];
                const tiposNormales: any = [];

                Object.entries(Hallazgos).forEach(([key, label]) => {
                  if (['RD', 'RT', 'LCD'].includes(label.tipo)) {
                    tiposEspeciales.push([key, label])
                  } else {
                    tiposNormales.push([key, label])
                  }
                })
                return (
                  <>
                    {tiposEspeciales.length > 0 && (
                   <div className="mb-3 p-2 border border-dashed border-border rounded-md">
                     <p className="text-xs text-muted-foreground mb-1.5">Condiciones de Cara/Superficie:</p>
                     <div className="flex flex-wrap gap-1.5">
                       {tiposEspeciales.map(([key, label]: [string, HallazgoType]) => {
                         let colorClass = "";
                         if (label.tipo === 'LCD') colorClass = "text-red-600 border-red-500 hover:bg-red-50 focus:bg-red-100";
                         else if (label.tipo === 'RD') colorClass = "text-blue-600 border-blue-500 hover:bg-blue-50 focus:bg-blue-100";
                         else if (label.tipo === 'RT') colorClass = "text-green-600 border-green-500 hover:bg-green-50 focus:bg-green-100";

                         return (
                           <button
                             key={key}
                             onClick={() => setCurrentMode({
                               position: Number(key),
                               color: label.color === '' ? (label.tipo === 'RD' ? '#0880D7' : '#E40000') : label.color,
                               detalle: label.detalle && label.detalle.length > 0 ? 0 : -1
                             })}
                             className={`px-2 py-1 rounded border text-xs font-medium transition-all
                               ${colorClass}
                               ${currentMode?.position === Number(key) ? (label.tipo === 'LCD' ? 'bg-red-50 ring-1 ring-red-500' : (label.tipo === 'RD' ? 'bg-blue-50 ring-1 ring-blue-500' : 'bg-green-50 ring-1 ring-green-500')) : 'bg-background'}`}
                           >
                             {label.denominacion}
                           </button>
                         );
                       })}
                     </div>
                   </div>
                    )}

                    {tiposNormales.length > 0 && (
                      <div className="space-y-1.5">
                        {tiposNormales.map(([key, label]: [string, HallazgoType]) => (
                          <div key={key} className="bg-card border border-border rounded-md text-xs">
                            <div
                              className={`flex items-center p-1.5 cursor-pointer hover:bg-muted/50 rounded-t-md transition-colors ${currentMode?.position === Number(key) ? 'bg-muted' : ''}`}
                              onClick={() => setCurrentMode({ position: Number(key), color: label.color === '' ? '#0880D7' : label.color, detalle: label.detalle && label.detalle.length > 0 ? 0 : -1 })}
                            >
                              <span className="font-medium text-foreground flex-1">{label.denominacion}</span>
                              {(label.color === '' || (label.detalle && label.detalle.length > 0) || label.tipo === 'GI') && (
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
                                {label.tipo === 'GI' && (
                                  <div className="flex items-center justify-around gap-1 my-1">
                                    <button
                                      onClick={() => setCurrentMode((prev) => ({ ...prev, direccion: 'izquierda' }))}
                                      className={`p-1 rounded-md transition-colors hover:bg-accent focus:bg-accent ${currentMode?.direccion === 'izquierda' && currentMode.position === Number(key) ? 'bg-accent text-accent-foreground ring-1 ring-primary' : 'text-muted-foreground'}`}
                                      title="Giroversión Izquierda"
                                    > <ArrowLeft size={16} /> </button>
                                    <button
                                      onClick={() => setCurrentMode((prev) => ({ ...prev, direccion: 'derecha' }))}
                                      className={`p-1 rounded-md transition-colors hover:bg-accent focus:bg-accent ${currentMode?.direccion === 'derecha' && currentMode.position === Number(key) ? 'bg-accent text-accent-foreground ring-1 ring-primary' : 'text-muted-foreground'}`}
                                      title="Giroversión Derecha"
                                    > <ArrowRight size={16} /> </button>
                                  </div>
                                )}

                                {label.color === '' && (
                                  <div className="flex flex-col gap-1 my-1">
                                    <button
                                      onClick={() => setCurrentMode((prev) => ({ position: prev.position, color: '#E40000', detalle: prev.detalle }))}
                                      className={`flex items-center p-1 rounded-md text-xs transition-colors hover:bg-red-100/50 ${currentMode?.color === '#E40000' && currentMode.position === Number(key) ? 'bg-red-100 text-red-700 ring-1 ring-red-500' : 'text-muted-foreground'}`}
                                      title="Mal estado"
                                    > <div className="w-3 h-3 mr-1.5 rounded-full bg-red-500 border border-red-600"></div> Mal Estado </button>
                                    <button
                                      onClick={() => setCurrentMode((prev) => ({ position: prev.position, color: '#0880D7', detalle: prev.detalle }))}
                                      className={`flex items-center p-1 rounded-md text-xs transition-colors hover:bg-blue-100/50 ${currentMode?.color === '#0880D7' && currentMode.position === Number(key) ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500' : 'text-muted-foreground'}`}
                                      title="Buen estado"
                                    > <div className="w-3 h-3 mr-1.5 rounded-full bg-blue-500 border border-blue-600"></div> Buen Estado </button>
                                  </div>
                                )}

                                {label.detalle && label.detalle.length > 0 && (
                                  <div className="flex flex-wrap gap-1 my-1">
                                    {label.detalle.map((item, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentMode({ position: Number(key), color:label.color === '' ? currentMode.color : label.color, detalle:idx })}
                                        className={`px-1.5 py-0.5 rounded border text-[10px] leading-tight transition-colors
                                          ${currentMode?.detalle === idx && currentMode.position === Number(key) ? (label.color === '' ? (currentMode.color === '#0880D7' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-1 ring-blue-400' : 'bg-red-100 border-red-500 text-red-700 ring-1 ring-red-400') : (label.color === '#0880D7' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-1 ring-blue-400' : 'bg-red-100 border-red-500 text-red-700 ring-1 ring-red-400'))) : 'bg-background hover:bg-muted border-border text-foreground/80'}`}
                                      > {item.abreviatura || item.tipo} </button>
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
                )
              })()}
            </div>
          </div>
        ):
        (
        <div className="h-full">
          {selectedTooth ? (
            <div className="p-1 space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {Object.keys(dientes[selectedTooth] || {}).length > 0 ? (
                 Object.keys(dientes[selectedTooth]).map((code) => (
                  <div key={code} className="p-1.5 bg-card border border-border rounded-md shadow-sm text-xs">
                    <div
                      onClick={() => handleRemoveToothCode(selectedTooth, code)}
                      className="flex items-center justify-between p-1 font-medium text-foreground rounded-t-md cursor-pointer hover:bg-destructive/10 transition-colors"
                      title="Click para eliminar toda la condición"
                    >
                      <span>{dientes[selectedTooth][code]?.nombre}</span>
                      <Trash2 size={14} className="text-destructive/70 hover:text-destructive" />
                    </div>

                    {dientes[selectedTooth][code]?.detalle?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-border">
                        {dientes[selectedTooth][code].detalle?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center p-0.5 pl-1.5 bg-muted rounded border border-border text-foreground/90"
                          >
                            <span>{item.abreviatura || item.nombre}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveToothCodeDetalle(selectedTooth, code, idx); }}
                              aria-label="Eliminar detalle específico"
                              title="Eliminar este detalle"
                              className="ml-1 p-0.5 rounded hover:bg-destructive/20 text-destructive/80 hover:text-destructive"
                            > <Trash2 size={12} /> </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Diente sin hallazgos.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm h-full flex items-center justify-center">
              Seleccione un diente para ver o eliminar hallazgos.
            </div>
          )}
        </div>
        )}
      </div>
      {toModal.to === 'toConfirmDelGroup' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Eliminar Hallazgo en Grupo
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de eliminar el hallazgo <strong className="text-foreground">{Hallazgos.find(h => h.tipo === toModal.code)?.denominacion || toModal.code}</strong> para todos los dientes en el grupo seleccionado?
            </p>
            <div className="flex justify-end space-x-2">
            <button
              onClick={cancelarEliminacionGrupo}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminacionGrupo}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar
            </button>
            </div>
          </div>
        </div>
      )}
      {toModal.to === 'toToothFace' && dientes[toModal.selectedTooth]?.[toModal.code] && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary">{dientes[toModal.selectedTooth][toModal.code].nombre}</h2>
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
                            cara: {
                            ...hallazgo,
                            color: prev.color,
                            },
                        }))
                        }
                    />
                    </Layer>
                    </Stage>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Detalles del Hallazgo</p>
                {toModal.detalle && toModal.detalle.length > 0 ? (
                   <div className="space-y-1">
                    {toModal.detalle.map((item, idx) => (
                      <button key={idx}
                        // onClick={() => /* Logic to select detail if needed */}
                        className="w-full text-left px-2 py-1 text-xs rounded-md border border-input bg-background hover:bg-muted focus:bg-accent focus:text-accent-foreground"
                      >
                        {item.denominacion} ({item.abreviatura || item.tipo})
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sin detalles específicos.</p>
                )}
                {Hallazgos[currentMode.position]?.tipo === 'RD' && (
                  <div className="pt-2 space-y-1">
                     <p className="text-xs font-medium text-muted-foreground">Estado de Restauración:</p>
                    <button
                      onClick={() => setCurrentMode((prev) => ({ ...prev, color: '#E40000' }))}
                      className={`w-full flex items-center px-2 py-1 text-xs rounded-md border transition-colors ${currentMode.color === '#E40000' ? 'bg-red-100 border-red-500 text-red-700 ring-1 ring-red-400' : 'bg-background hover:bg-red-50 border-input'}`}
                    > <div className="w-2.5 h-2.5 mr-1.5 rounded-full bg-red-500 border border-red-600"></div> Mal Estado </button>
                    <button
                      onClick={() => setCurrentMode((prev) => ({ ...prev, color: '#0880D7' }))}
                      className={`w-full flex items-center px-2 py-1 text-xs rounded-md border transition-colors ${currentMode.color === '#0880D7' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-1 ring-blue-400' : 'bg-background hover:bg-blue-50 border-input'}`}
                    > <div className="w-2.5 h-2.5 mr-1.5 rounded-full bg-blue-500 border border-blue-600"></div> Buen Estado </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end space-x-2">
              <button
                onClick={() => setToModal({selectedTooth: '', code: '', to: ''})}
                className="px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              > Cerrar </button>
              <button
                // onClick={handleSaveFaceSelection} // Implementar lógica de guardado
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              > Guardar Caras </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teeth;

    