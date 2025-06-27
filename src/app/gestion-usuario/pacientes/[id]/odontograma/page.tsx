
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockPacientesData } from '@/lib/data';
import type { Paciente as PacienteType, Persona, EtiquetaPaciente, HistorialOdontograma } from '@/types';
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DientesMap, OdontogramDataItem } from '@/components/odontograma/setting';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Define ToothIconCustomSvg locally for error display or import from a shared location if available
const ToothIconCustomSvg = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.36 3.55A2 2 0 0 1 10.77 3h2.46a2 2 0 0 1 1.41.55L17 6h-2.53a2 2 0 0 0-1.64.88L12 8.34l-.83-1.46A2 2 0 0 0 9.53 6H7l2.36-2.45Z"/>
      <path d="M19 10c0 2-2 4-2 4H7s-2-2-2-4a5 5 0 0 1 8-4h2a5 5 0 0 1 4 4Z"/>
      <path d="M17.61 14a5.22 5.22 0 0 1-1.11 1.39 3.82 3.82 0 0 1-2.29.98c-.43.04-.81.18-1.21.22a4 4 0 0 1-2.5-.26 3.8 3.8 0 0 1-2.28-1 5.2 5.2 0 0 1-1.15-1.38"/>
      <path d="M7.25 16.5c.64.92 1.57 1.5 2.58 1.5h4.34c1.01 0 1.94-.58 2.58-1.5"/>
    </svg>
  );

const OdontogramComponent = dynamic(() => import('@/components/odontograma/Odontogram').then(mod => mod.Odontogram), {
  ssr: false,
  loading: () => <p className="text-center py-10">Cargando Odontograma...</p>
});

const ResumenOdontogramaCell = ({ row }: { row: { original: HistorialOdontograma } }) => {
  const historial = row.original;
  const hallazgos: { diente: string; hallazgo: string; servicios: any[] | undefined }[] = [];

  const processMap = (map: DientesMap, type: string) => {
    if (!map) return;
    Object.entries(map).forEach(([diente, data]) => {
      Object.values(data).forEach(hallazgo => {
        hallazgos.push({
          diente: `${diente} (${type})`,
          hallazgo: hallazgo.nombre,
          servicios: hallazgo.servicios,
        });
      });
    });
  };

  processMap(historial.odontogramaPermanente, 'P');
  processMap(historial.odontogramaPrimaria, 'D');

  if (hallazgos.length === 0) {
    return <span className="text-muted-foreground">Sin hallazgos</span>;
  }

  return (
    <div className="max-w-sm space-y-1">
      {hallazgos.map((h, index) => (
        <div key={index} className="text-xs">
          <p className="truncate"><strong>Diente {h.diente}:</strong> {h.hallazgo}</p>
          {h.servicios && h.servicios.length > 0 && (
            <p className="pl-2 text-muted-foreground truncate"><strong>Servicios:</strong> {h.servicios.map(s => s.denominacion).join(', ')}</p>
          )}
        </div>
      ))}
    </div>
  );
};


type OdontogramType = 'Permanente' | 'Primaria' | 'Historial';

export default function OdontogramaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [permanenteData, setPermanenteData] = useState<DientesMap>({});
  const [primariaData, setPrimariaData] = useState<DientesMap>({});
  const [odontogramData, setOdontogramData] = useState<OdontogramDataItem[]>([]); 
  const [activeTab, setActiveTab] = useState<OdontogramType>('Permanente');

  const [isNewConfirmOpen, setIsNewConfirmOpen] = useState(false);

  const [displayedNotas, setDisplayedNotas] = useState<string>("Sin notas registradas.");
  const [displayedEtiquetas, setDisplayedEtiquetas] = useState<EtiquetaPaciente[]>([]);
  const [displayedAlergias, setDisplayedAlergias] = useState<string[]>([]);
  const [displayedEnfermedades, setDisplayedEnfermedades] = useState<string[]>([]);

  useEffect(() => {
    console.log(odontogramData);
  }, [odontogramData]);

  const handleOdontogramaDataChange = useCallback((newData: OdontogramDataItem[]) => {
    setOdontogramData(newData);
  }, []);

  const deriveAlergiasFromAntecedentes = (antecedentes?: PacienteType['antecedentesMedicos']): string[] => {
    if (antecedentes && antecedentes.q3_cuales && antecedentes.q3_alergico === "Sí") {
      return antecedentes.q3_cuales.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const deriveEnfermedadesFromAntecedentes = (antecedentes?: PacienteType['antecedentesMedicos']): string[] => {
    return antecedentes?.q5_enfermedades || [];
  };

  useEffect(() => {
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    if (foundPaciente) {
      setPaciente(foundPaciente);
      setPersona(foundPaciente.persona);
      const latestHistory = foundPaciente.historialOdontogramas?.[0];
      if (latestHistory) {
        setPermanenteData(latestHistory.odontogramaPermanente || {});
        setPrimariaData(latestHistory.odontogramaPrimaria || {});
      } else {
        setPermanenteData({});
        setPrimariaData({});
      }
      setDisplayedNotas(foundPaciente.notas || "Sin notas registradas.");
      setDisplayedEtiquetas(foundPaciente.etiquetas || []);
      setDisplayedAlergias(deriveAlergiasFromAntecedentes(foundPaciente.antecedentesMedicos));
      setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(foundPaciente.antecedentesMedicos));
    } else {
      setPaciente(null);
      setPersona(null);
    }
    setLoading(false);
  }, [patientId]);
  
  // This "autosave" function directly modifies the latest historical record.
  const handleOdontogramaChange = useCallback((newData: DientesMap) => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex === -1) return;

    const updatedPatient = { ...mockPacientesData[pacienteIndex] };
    if (!updatedPatient.historialOdontogramas || updatedPatient.historialOdontogramas.length === 0) {
      return; // Should not happen
    }
    
    if (activeTab === 'Permanente') {
      updatedPatient.historialOdontogramas[0].odontogramaPermanente = newData;
      setPermanenteData(newData);
    } else {
      updatedPatient.historialOdontogramas[0].odontogramaPrimaria = newData;
      setPrimariaData(newData);
    }
    
    mockPacientesData[pacienteIndex] = updatedPatient;
    setPaciente(updatedPatient);
  }, [activeTab, patientId]);
  
  const handleNewOdontogram = () => setIsNewConfirmOpen(true);
  
  const confirmNewOdontogram = () => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex === -1) return;

    const newHistoryEntry: HistorialOdontograma = {
      id: `historial-${crypto.randomUUID()}`,
      fechaCreacion: new Date(),
      odontogramaPermanente: {},
      odontogramaPrimaria: {},
    };
    
    const updatedPatient = { ...mockPacientesData[pacienteIndex] };
    updatedPatient.historialOdontogramas?.unshift(newHistoryEntry);
    
    mockPacientesData[pacienteIndex] = updatedPatient;
    setPaciente(updatedPatient); // Update local state to re-render history table and odontogram
    
    setPermanenteData({});
    setPrimariaData({});
    setActiveTab('Permanente');
    toast({ title: "Nuevo Odontograma Creado", description: "Se ha archivado el odontograma anterior y ahora estás en uno nuevo." });
    setIsNewConfirmOpen(false);
  };
  
  const handleViewHistorical = (historialToView: HistorialOdontograma) => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex === -1) return;

    const updatedPatient = { ...mockPacientesData[pacienteIndex] };
    if (!updatedPatient.historialOdontogramas) return;

    const viewIndex = updatedPatient.historialOdontogramas.findIndex(h => h.id === historialToView.id);
    if (viewIndex === -1 || viewIndex === 0) return; // Already current or not found

    // Move the viewed item to the front of the array to make it the "current" one
    const [itemToView] = updatedPatient.historialOdontogramas.splice(viewIndex, 1);
    updatedPatient.historialOdontogramas.unshift(itemToView);
    
    mockPacientesData[pacienteIndex] = updatedPatient;

    // Update state to trigger re-render
    setPaciente(updatedPatient);
    setPermanenteData(itemToView.odontogramaPermanente || {});
    setPrimariaData(itemToView.odontogramaPrimaria || {});
    setActiveTab('Permanente');
    toast({ title: "Historial Cargado", description: "El odontograma seleccionado ahora es el actual." });
  };

  const columns: ColumnDef<HistorialOdontograma>[] = [
    {
      accessorKey: "fechaCreacion",
      header: "Fecha de Creación",
      cell: ({ row }) => format(new Date(row.original.fechaCreacion), "dd MMM yyyy, HH:mm", { locale: es }),
    },
    {
      id: "resumen",
      header: "Resumen de Hallazgos y Servicios",
      cell: ResumenOdontogramaCell,
      filterFn: (row, id, value) => {
        const searchTerm = String(value).toLowerCase();
        if (!searchTerm) return true;

        const historial = row.original;
        let matchFound = false;

        const checkMap = (map: DientesMap) => {
            if (matchFound || !map) return;
            for (const diente in map) {
                for (const hallazgo of Object.values(map[diente])) {
                    if (hallazgo.nombre.toLowerCase().includes(searchTerm)) {
                        matchFound = true;
                        return;
                    }
                    if (hallazgo.servicios) {
                        for (const servicio of hallazgo.servicios) {
                            if (servicio.denominacion.toLowerCase().includes(searchTerm)) {
                                matchFound = true;
                                return;
                            }
                        }
                    }
                }
                if (matchFound) return;
            }
        };

        checkMap(historial.odontogramaPermanente);
        if (matchFound) return true;

        checkMap(historial.odontogramaPrimaria);
        return matchFound;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => handleViewHistorical(row.original)}>Ver Odontograma</Button>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Cargando datos del odontograma...</p></div>;
  if (!paciente || !persona) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <ToothIconCustomSvg className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Paciente no Encontrado</h1>
        <p className="text-muted-foreground mb-6">No pudimos encontrar los detalles para el paciente solicitado.</p>
        <Button onClick={() => router.push('/gestion-usuario/pacientes')}><ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista</Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 bg-background min-h-screen">
        <ResumenPaciente paciente={paciente} persona={persona} onBack={() => router.push('/gestion-usuario/pacientes')} />
        <div className="flex-1 space-y-6">
          <EtiquetasNotasSalud
            etiquetas={displayedEtiquetas}
            notas={displayedNotas}
            alergias={displayedAlergias}
            enfermedades={displayedEnfermedades}
            onSaveNotes={() => {}}
            onAddTag={() => true}
            patientId={patientId}
          />
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Odontograma</CardTitle>
                  <CardDescription>Registre los hallazgos dentales del paciente.</CardDescription>
                </div>
                <Button onClick={handleNewOdontogram}>Nuevo Odontograma</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OdontogramType)} className="w-full">
                <TabsList className="mb-4 grid grid-cols-3">
                  <TabsTrigger value="Permanente">Permanente</TabsTrigger>
                  <TabsTrigger value="Primaria">Primaria (Decidua)</TabsTrigger>
                  <TabsTrigger value="Historial">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="Permanente">
                  <OdontogramComponent 
                      dientesData={permanenteData} 
                      onDientesChange={handleOdontogramaChange}
                      onOdontogramDataChange={handleOdontogramaDataChange} 
                      odontogramType="Permanent"
                  />
                </TabsContent>
                <TabsContent value="Primaria">
                  <OdontogramComponent 
                      dientesData={primariaData} 
                      onDientesChange={handleOdontogramaChange} 
                      onOdontogramDataChange={handleOdontogramaDataChange}
                      odontogramType="Primary"
                  />
                </TabsContent>
                <TabsContent value="Historial">
                  <DataTable
                    columns={columns}
                    data={paciente.historialOdontogramas || []}
                    searchPlaceholder='Buscar por hallazgo o servicio...'
                    searchColumnId="resumen"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isNewConfirmOpen}
        onOpenChange={setIsNewConfirmOpen}
        onConfirm={confirmNewOdontogram}
        title="Crear Nuevo Odontograma"
        description="¿Está seguro de que desea crear un nuevo odontograma? El odontograma actual con sus hallazgos se guardará en el historial del paciente."
        confirmButtonText="Sí, crear nuevo"
      />
    </>
  );
}
