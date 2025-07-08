"use client";
import React, { useState, useRef, useEffect } from "react";
import { DientesMap, Hallazgo, OdontogramDataItem } from "./setting";
import type { Procedimiento } from "@/types";
import { mockProcedimientos } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Link2, PlusCircle, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Props {
  dientesMap: DientesMap;
  odontogramType: "Permanent" | "Primary";
  onOdontogramDataChange: (odontogramData: OdontogramDataItem[]) => void;
  onUpdateDientesMap: (newMap: DientesMap) => void;
}

const TreatmentPlanTable: React.FC<Props> = ({
  dientesMap,
  odontogramType,
  onOdontogramDataChange,
  onUpdateDientesMap,
}) => {
  const [planTratamiento, setPlanTratamiento] = useState<OdontogramDataItem[]>(
    []
  );
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [inputNota, setInputNota] = useState<string>("");
  const [modalPos, setModalPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [modalServicio, setModalServicio] = useState<{
    index: number;
    item: OdontogramDataItem;
  } | null>(null);
  const [serviciosEnModal, setServiciosEnModal] = useState<Procedimiento[]>([]);

  const botonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const procedimientoOptions: ComboboxOption[] = mockProcedimientos.map(
    (p) => ({
      value: p.id,
      label: `${p.denominacion} - S/ ${p.precioBase.toFixed(2)}`,
    })
  );

  const formatGrupoDientes = (diente: number | number[]): string => {
    if (Array.isArray(diente)) {
      return diente.length > 1
        ? `${diente[0]}-${diente[diente.length - 1]}`
        : diente[0].toString();
    }
    return diente.toString();
  };

  const procesarDatos = (
    currentDientesMap: DientesMap
  ): OdontogramDataItem[] => {
    const resultados: OdontogramDataItem[] = [];
    const idsAgregados = new Set<string>();

    const permanentToothRanges = [
      [11, 18],
      [21, 28],
      [31, 38],
      [41, 48],
    ];
    const primaryToothRanges = [
      [51, 55],
      [61, 65],
      [71, 75],
      [81, 85],
    ];

    const isPermanentTooth = (num: number) =>
      permanentToothRanges.some(([start, end]) => num >= start && num <= end);
    const isPrimaryTooth = (num: number) =>
      primaryToothRanges.some(([start, end]) => num >= start && num <= end);

    for (const [dienteStr, hallazgos] of Object.entries(currentDientesMap)) {
      const numeroDiente = parseInt(dienteStr);

      if (odontogramType === "Permanent" && !isPermanentTooth(numeroDiente))
        continue;
      if (odontogramType === "Primary" && !isPrimaryTooth(numeroDiente))
        continue;

      for (const hallazgo of Object.values(hallazgos)) {
        const esGrupo = hallazgo.grupo?.length > 1;
        const id = esGrupo
          ? `${hallazgo.grupo!.join("-")}-${hallazgo.tipo}`
          : `${numeroDiente}-${hallazgo.tipo}`;
        if (!idsAgregados.has(id)) {
          const { grupo, ...hallazgoSinGrupo } = hallazgo;
          resultados.push({
            diente: esGrupo ? hallazgo.grupo! : numeroDiente,
            hallazgo: hallazgoSinGrupo,
            nota: "", // Nota se manejará en el estado local `planTratamiento`
            servicios: hallazgo.servicios || [],
          });
          idsAgregados.add(id);
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
    const nuevosDatos = procesarDatos(dientesMap);

    // Sincronizar el plan de tratamiento, preservando las notas existentes
    setPlanTratamiento((prevPlan) => {
      const planActualizado = nuevosDatos.map((item) => {
        // Encontrar si este item (por diente y tipo de hallazgo) ya existía
        const itemPrevio = prevPlan.find(
          (p) =>
            JSON.stringify(p.diente) === JSON.stringify(item.diente) &&
            p.hallazgo.tipo === item.hallazgo.tipo
        );
        return {
          ...item,
          nota: itemPrevio?.nota || "",
          servicios: item.servicios || [], // Asegurarse de que los servicios se actualicen desde `dientesMap`
        };
      });
      return planActualizado;
    });

    onOdontogramDataChange(planTratamiento);
  }, [dientesMap, odontogramType]);

  const guardarNota = (index: number) => {
    setPlanTratamiento((prev) =>
      prev.map((item, i) => (i === index ? { ...item, nota: inputNota } : item))
    );
    cerrarModalNotas();
  };

  const cerrarModalNotas = () => {
    setEditandoIndex(null);
    setInputNota("");
    setModalPos(null);
  };

  const abrirModalServicios = (index: number, item: OdontogramDataItem) => {
    setModalServicio({ index, item });
    setServiciosEnModal(item.servicios || []);
  };

  const guardarServicios = () => {
    if (modalServicio === null) return;

    const newDientesMap = JSON.parse(JSON.stringify(dientesMap));
    const dienteIds = Array.isArray(modalServicio.item.diente)
      ? modalServicio.item.diente
      : [modalServicio.item.diente];
    const hallazgoTipo = modalServicio.item.hallazgo.tipo;

    dienteIds.forEach((dienteId) => {
      if (newDientesMap[dienteId] && newDientesMap[dienteId][hallazgoTipo]) {
        newDientesMap[dienteId][hallazgoTipo].servicios = serviciosEnModal;
      }
    });

    onUpdateDientesMap(newDientesMap); // Propagate changes up to parent
    toast({
      title: "Servicios Vinculados",
      description:
        "Los servicios han sido vinculados al hallazgo correctamente.",
    });
    setModalServicio(null);
    setServiciosEnModal([]);
  };

  const handleAddServicio = (procedimientoId: string) => {
    const procedimientoToAdd = mockProcedimientos.find(
      (p) => p.id === procedimientoId
    );
    if (
      procedimientoToAdd &&
      !serviciosEnModal.some((p) => p.id === procedimientoId)
    ) {
      setServiciosEnModal((prev) => [...prev, procedimientoToAdd]);
    }
  };

  const handleRemoveServicio = (procedimientoId: string) => {
    setServiciosEnModal((prev) => prev.filter((p) => p.id !== procedimientoId));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node))
        cerrarModalNotas();
    };
    if (editandoIndex !== null)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editandoIndex]);

  const caraNombres: Record<string, string> = {
    M: "Mesial",
    D: "Distal",
    O: "Oclusal/Incisal",
    C: "Cervical",
    V: "Vestibular/Lingual",
  };

  const getAbreviaturas = (
    hallazgo: Omit<Hallazgo, "grupo" | "servicios">
  ): { abreviatura: string; color: string }[] => {
    const fromDetails =
      hallazgo.detalle?.map((d) => ({
        abreviatura: d.abreviatura,
        color: hallazgo.color,
      })) || [];
    const fromCaras = hallazgo.cara
      ? Object.values(hallazgo.cara)
          .filter((c) => c.detalle)
          .map((c) => ({
            abreviatura: c.detalle!.abreviatura,
            color: c.color || hallazgo.color,
          }))
      : [];
    const allDetailAbrevs = [...fromDetails, ...fromCaras];
    if (allDetailAbrevs.length > 0) return allDetailAbrevs;
    if (hallazgo.abreviatura)
      return [{ abreviatura: hallazgo.abreviatura, color: hallazgo.color }];
    return [];
  };

  const filteredProcedimientoOptions = procedimientoOptions.filter(
    (opt) => !serviciosEnModal.some((s) => s.id === opt.value)
  );

  return (
    <div className="relative overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nº Diente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hallazgo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Servicios
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notas
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {planTratamiento.length > 0 ? (
            planTratamiento.map((item, index) => {
              const abreviaturas = getAbreviaturas(item.hallazgo);
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="text-blue-600">
                      {formatGrupoDientes(item.diente)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: item.hallazgo.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.hallazgo.nombre}
                        </div>
                        {item.hallazgo.cara &&
                          Object.keys(item.hallazgo.cara).length > 0 && (
                            <div className="text-xs text-gray-500">
                              {Object.entries(item.hallazgo.cara)
                                .map(
                                  ([key, cara]) =>
                                    `${caraNombres[key] || key}${
                                      cara.detalle
                                        ? ` (${cara.detalle.abreviatura})`
                                        : ""
                                    }`
                                )
                                .join(", ")}
                            </div>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.servicios && item.servicios.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.servicios.map((s) => (
                            <Badge
                              key={s.id}
                              variant="secondary"
                              className="font-normal"
                            >
                              {s.denominacion}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => abrirModalServicios(index, item)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:bg-primary hover:text-primary-foreground px-2"
                        onClick={() => abrirModalServicios(index, item)}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Vincular
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <div className="flex flex-wrap items-center gap-1">
                      {abreviaturas.map((detalle, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            detalle.color === "#E40000"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {detalle.abreviatura}
                        </span>
                      ))}
                      {item.nota && (
                        <span
                          title={item.nota}
                          className="inline-flex items-center max-w-[200px] truncate px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {item.nota}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-10 text-center text-sm text-gray-500"
              >
                No hay hallazgos registrados para el plan de tratamiento.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editandoIndex !== null && modalPos && (
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
              onClick={() => guardarNota(editandoIndex)}
              className="text-xs px-3 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {modalServicio && (
        <Dialog
          open={!!modalServicio}
          onOpenChange={(open) => !open && setModalServicio(null)}
        >
          <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle>Vincular Servicio</DialogTitle>
              <DialogDescription>
                Vincula un hallazgo clínico con uno o más servicios.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="px-6 py-4 space-y-4">
                <div className="w-full mx-auto mb-4 px-4 py-3 rounded-lg bg-muted/50 border">
                  <div className="flex justify-center items-center gap-3">
                    <h3 className="text-xl font-bold text-foreground leading-tight tracking-wide">
                      {modalServicio.item.hallazgo.nombre}
                    </h3>
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-inner shrink-0"
                      style={{
                        backgroundColor: modalServicio.item.hallazgo.color,
                      }}
                      title="Color del hallazgo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    ¿Qué servicios propondrías ante este hallazgo clínico?
                    Agrega al menos un servicio.
                  </p>
                  <Combobox
                    options={filteredProcedimientoOptions}
                    onChange={handleAddServicio}
                    placeholder="Buscar y agregar servicio..."
                    searchPlaceholder="Buscar servicio..."
                    emptyPlaceholder="No hay más servicios para agregar."
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Servicios a vincular:
                  </p>
                  {serviciosEnModal.length > 0 ? (
                    <div className="flex flex-wrap gap-2 border p-3 rounded-md min-h-[4rem]">
                      {serviciosEnModal.map((proc) => (
                        <Badge
                          key={proc.id}
                          variant="default"
                          className="flex items-center gap-1 text-sm py-1"
                        >
                          {proc.denominacion}
                          <button
                            onClick={() => handleRemoveServicio(proc.id)}
                            className="rounded-full hover:bg-white/20 p-0.5"
                          >
                            <XIcon className="h-3 w-3" />
                            <span className="sr-only">
                              Quitar {proc.denominacion}
                            </span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-center text-muted-foreground italic border rounded-md p-3 min-h-[4rem] flex items-center justify-center">
                      Ningún servicio seleccionado.
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalServicio(null)}>
                Cancelar
              </Button>
              <Button onClick={guardarServicios}>Guardar Vínculos</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TreatmentPlanTable;
