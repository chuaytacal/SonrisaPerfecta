
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { mockPacientesData } from '@/lib/data';
import type { Paciente as PacienteType, Persona, EtiquetaPaciente } from '@/types';
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DientesMap } from '@/components/odontograma/setting';
import { useToast } from '@/hooks/use-toast';

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

type OdontogramType = 'Permanente' | 'Primaria';

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
  const [activeTab, setActiveTab] = useState<OdontogramType>('Permanente');

  useEffect(() => {
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    if (foundPaciente) {
      setPaciente(foundPaciente);
      setPersona(foundPaciente.persona);
      setPermanenteData(foundPaciente.odontogramaPermanente || {});
      setPrimariaData(foundPaciente.odontogramaPrimaria || {});
    } else {
      setPaciente(null);
      setPersona(null);
    }
    setLoading(false);
  }, [patientId]);
  
  const handleOdontogramaChange = (newData: DientesMap) => {
    if (activeTab === 'Permanente') {
      setPermanenteData(newData);
    } else {
      setPrimariaData(newData);
    }
  };

  const handleSaveChanges = () => {
    // Simulate saving the data back to our mock database
    const patientIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (patientIndex > -1) {
      mockPacientesData[patientIndex].odontogramaPermanente = permanenteData;
      mockPacientesData[patientIndex].odontogramaPrimaria = primariaData;
      
      // Update the local paciente state as well to be consistent
      setPaciente(prev => prev ? ({...prev, odontogramaPermanente: permanenteData, odontogramaPrimaria: primariaData}) : null);

      toast({
        title: "Odontograma Guardado",
        description: "Los cambios en el odontograma han sido guardados.",
      });
    } else {
       toast({
        title: "Error al Guardar",
        description: "No se pudo encontrar al paciente para guardar los cambios.",
        variant: "destructive"
      });
    }
  };


  // Dummy callbacks for EtiquetasNotasSalud
  const handleDummySaveNotes = (notes: string) => { console.log("Save notes (dummy):", notes); };
  const handleDummyAddTag = (tag: EtiquetaPaciente): boolean => { console.log("Add tag (dummy):", tag); return true; };

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
  
  const displayedAlergias = paciente.antecedentesMedicos?.q3_cuales && paciente.antecedentesMedicos?.q3_alergico === "Sí" ? paciente.antecedentesMedicos.q3_cuales.split(',').map(s => s.trim()).filter(Boolean) : [];
  const displayedEnfermedades = paciente.antecedentesMedicos?.q5_enfermedades || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-background min-h-screen">
      <ResumenPaciente paciente={paciente} persona={persona} onBack={() => router.push('/gestion-usuario/pacientes')} />
      <div className="flex-1 space-y-6">
        <EtiquetasNotasSalud
          etiquetas={paciente.etiquetas || []}
          notas={paciente.notas || "Sin notas registradas."}
          alergias={displayedAlergias}
          enfermedades={displayedEnfermedades}
          onSaveNotes={handleDummySaveNotes}
          onAddTag={handleDummyAddTag}
          patientId={patientId}
        />
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Odontograma</CardTitle>
              <CardDescription>Registre los hallazgos dentales del paciente.</CardDescription>
            </div>
            <Button onClick={handleSaveChanges} size="sm">
              <Save className="mr-2 h-4 w-4"/>
              Guardar Cambios
            </Button>
          </CardHeader>
          <CardContent>
             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OdontogramType)} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="Permanente">Permanente</TabsTrigger>
                <TabsTrigger value="Primaria">Primaria (Decidua)</TabsTrigger>
              </TabsList>
              <TabsContent value="Permanente">
                 <OdontogramComponent 
                    dientesData={permanenteData} 
                    onDientesChange={handleOdontogramaChange} 
                    odontogramType="Permanent"
                 />
              </TabsContent>
              <TabsContent value="Primaria">
                 <OdontogramComponent 
                    dientesData={primariaData} 
                    onDientesChange={handleOdontogramaChange} 
                    odontogramType="Primary"
                 />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
