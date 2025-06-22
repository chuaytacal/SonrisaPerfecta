'use client';
import React, { useState, useRef, useEffect } from 'react';
import { DientesMap, Hallazgo } from './setting';

interface Props {
  dientesMap: DientesMap;
}

type PlanTratamientoItem = {
  id: string;
  diente: number | number[];
  hallazgo: Omit<Hallazgo, 'grupo'>;
  nota: string;
  servicio: string;
};

const TreatmentPlanTable: React.FC<Props> = ({ dientesMap }) => {
  const [planTratamiento, setPlanTratamiento] = useState<PlanTratamientoItem[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [inputNota, setInputNota] = useState<string>('');
  const [modalPos, setModalPos] = useState<{ top: number; left: number } | null>(null);
  const [modalServicio, SetModalServicio] = useState<{ key: string; servicio: string } | null>(null);
  const botonRefs = useRef<{ [id: string]: HTMLButtonElement | null }>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalServicioRef = useRef<HTMLDivElement | null>(null);

  const servicios = [{ definicion: 'Obturar caries' }, { definicion: 'Manejar fusión' }];

  const formatGrupoDientes = (diente: number | number[]): string => {
    if (Array.isArray(diente)) {
      return diente.length > 1 ? `${diente[0]}-${diente[diente.length - 1]}` : diente[0].toString();
    }
    return diente.toString();
  };

  const procesarDatos = (): Array<{ id: string; diente: number | number[]; hallazgo: Omit<Hallazgo, 'grupo'> }> => {
    const resultados: Array<{ id: string; diente: number | number[]; hallazgo: Omit<Hallazgo, 'grupo'> }> = [];
    const idsAgregados = new Set<string>();

    for (const [dienteStr, hallazgos] of Object.entries(dientesMap)) {
      const numeroDiente = parseInt(dienteStr);
      for (const hallazgo of Object.values(hallazgos)) {
        const esGrupo = hallazgo.grupo?.length > 1;
        const esMultiCara = typeof hallazgo.cara === 'object' && !Array.isArray(hallazgo.cara) && hallazgo.cara !== null;

        if (esMultiCara) {
          for (const [claveCara, dataCara] of Object.entries(hallazgo.cara)) {
            const id = `${numeroDiente}-${hallazgo.tipo}-cara-${claveCara}`;
            if (!idsAgregados.has(id)) {
              const { grupo, ...hallazgoSinGrupo } = hallazgo;
              resultados.push({
                id,
                diente: numeroDiente,
                hallazgo: { ...hallazgoSinGrupo, cara: dataCara }
              });
              idsAgregados.add(id);
            }
          }
        } else {
          const id = esGrupo ? `${hallazgo.grupo!.join('-')}-${hallazgo.tipo}` : `${numeroDiente}-${hallazgo.tipo}`;
          if (!idsAgregados.has(id)) {
            const { grupo, ...hallazgoSinGrupo } = hallazgo;
            resultados.push({
              id,
              diente: esGrupo ? hallazgo.grupo! : numeroDiente,
              hallazgo: hallazgoSinGrupo
            });
            idsAgregados.add(id);
          }
        }
      }
    }

    return resultados.sort((a, b) => {
      const aNum = Array.isArray(a.diente) ? a.diente[0] : a.diente;
      const bNum = Array.isArray(b.diente) ? b.diente[0] : b.diente;
      return aNum - bNum;
    });
  };

  useEffect(() => {
    const inicial = procesarDatos();
    setPlanTratamiento((prev) => {
      const mapPrev = new Map(prev.map((item) => [item.id, item]));
      return inicial.map((item) => {
        const existente = mapPrev.get(item.id);
        return {
          ...item,
          nota: existente?.nota || '',
          servicio: existente?.servicio || '',
        };
      });
    });
  }, [dientesMap]);

  const abrirModal = (id: string) => {
    const ref = botonRefs.current[id];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      setModalPos({ top: rect.bottom + 8, left: rect.left });
      setEditandoId(id);
      const nota = planTratamiento.find((i) => i.id === id)?.nota || '';
      setInputNota(nota);
    }
  };

  const guardarNota = (id: string) => {
    setPlanTratamiento((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nota: inputNota } : item))
    );
    cerrarModal();
  };

  const cerrarModal = () => {
    setEditandoId(null);
    setInputNota('');
    setModalPos(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) cerrarModal();
    };
    if (editandoId) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editandoId]);

  useEffect(() => {
    const handleClickOutsideServicio = (e: MouseEvent) => {
      if (modalServicioRef.current && !modalServicioRef.current.contains(e.target as Node)) {
        SetModalServicio(null);
      }
    };
    if (modalServicio) {
      document.addEventListener('mousedown', handleClickOutsideServicio);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideServicio);
    };
  }, [modalServicio]);
  useEffect(() => {
    console.log(planTratamiento);
  }, [planTratamiento]);

  return (
    <div className="relative shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Diente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hallazgo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {planTratamiento.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span className="text-blue-600">{formatGrupoDientes(item.diente)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: item.hallazgo.cara?.color || item.hallazgo.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.hallazgo.nombre}</div>
                    {item.hallazgo.abreviatura && (
                      <div className="text-xs text-gray-500">{item.hallazgo.abreviatura}</div>
                    )}
                    {item.hallazgo.cara && (
                      <div className="text-xs text-gray-500">{item.hallazgo.cara.nombre}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.servicio ? (
                  <div onClick={() => SetModalServicio({ key: item.id, servicio: item.servicio })} className="cursor-pointer">
                    {item.servicio}
                  </div>
                ) : (
                  <div onClick={() => SetModalServicio({ key: item.id, servicio: '' })} className="cursor-pointer text-blue-500 underline">
                    agregar un servicio
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap relative">
                <div className="flex flex-wrap items-center gap-1">
                  {(item.hallazgo.detalle || item.hallazgo.cara?.detalle)?.map((detalle, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {detalle.abreviatura}
                    </span>
                  ))}
                  {item.nota && (
                    <span
                      title={item.nota}
                      className="inline-flex items-center max-w-[500px] truncate px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {item.nota}
                    </span>
                  )}
                  <button
                    ref={(el) => (botonRefs.current[item.id] = el)}
                    onClick={() => abrirModal(item.id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    + Agregar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editandoId && modalPos && (
        <div
          ref={modalRef}
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg p-2 z-50"
          style={{ top: modalPos.top, left: modalPos.left }}
        >
          <textarea
            value={inputNota}
            onChange={(e) => setInputNota(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs w-52 mb-1 resize-none"
            placeholder="Escribe una nota"
          />
          <div className="flex justify-end">
            <button
              onClick={() => guardarNota(editandoId!)}
              className="text-xs px-3 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {modalServicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div
            ref={modalServicioRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg w-[640px] max-h-[95vh] overflow-y-auto p-6"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Seleccionar Servicio</h2>
            {(() => {
              const item = planTratamiento.find(p => p.id === modalServicio.key);
              if (!item) return null;
              const color = item.hallazgo.cara?.color || item.hallazgo.color;
              return (
                <div className="w-full max-w-[640px] mx-auto mb-6 px-6 py-4 rounded-xl">
                  <div className="text-center mb-4">
                    <div className="flex justify-center items-center gap-3">
                      <h2 className="text-3xl font-bold text-gray-800 leading-tight tracking-wide">
                        {item.hallazgo.nombre}
                      </h2>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 shadow-inner"
                        style={{ backgroundColor: color }}
                        title="Color del hallazgo"
                      />
                    </div>

                    {item.hallazgo.cara?.nombre && (
                      <p className="text-base italic text-gray-600 mt-1">
                        Cara: {item.hallazgo.cara.nombre}
                      </p>
                    )}
                  </div>

                  {item.hallazgo.abreviatura && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">Abreviatura:</span>{' '}
                        {item.hallazgo.abreviatura}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
            <select
              value={modalServicio.servicio}
              onChange={(e) => SetModalServicio((prev) => prev ? { ...prev, servicio: e.target.value } : null)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Seleccionar</option>
              {servicios.map((s, i) => (
                <option key={i} value={s.definicion}>{s.definicion}</option>
              ))}
            </select>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => {
                  if (modalServicio) {
                    setPlanTratamiento((prev) =>
                      prev.map((item) =>
                        item.id === modalServicio.key ? { ...item, servicio: modalServicio.servicio } : item
                      )
                    );
                    SetModalServicio(null);
                  }
                }}
                className="px-6 py-3 font-semibold text-white rounded-lg shadow-md transition transform hover:translate-y-[-2px] bg-[#0880D7] hover:bg-[#066BB0]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlanTable;
