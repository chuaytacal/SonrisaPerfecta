
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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

  const [displayedNotas, setDisplayedNotas] = useState<string>("Sin notas registradas.");
  const [displayedEtiquetas, setDisplayedEtiquetas] = useState<EtiquetaPaciente[]>([]);
  const [displayedAlergias, setDisplayedAlergias] = useState<string[]>([]);
  const [displayedEnfermedades, setDisplayedEnfermedades] = useState<string[]>([]);

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
      setPermanenteData(foundPaciente.odontogramaPermanente || {});
      setPrimariaData(foundPaciente.odontogramaPrimaria || {});
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
  
  // Helper to count top-level findings.
  const countTopLevelFindings = (data: DientesMap) => {
    if (!data) return 0;
    return Object.values(data).reduce((acc, tooth) => acc + Object.keys(tooth).length, 0);
  };

  const handleOdontogramaChange = useCallback((newData: DientesMap) => {
    const oldData = activeTab === 'Permanente' ? permanenteData : primariaData;
    
    if (JSON.stringify(oldData) === JSON.stringify(newData)) {
        return;
    }

    const oldCount = countTopLevelFindings(oldData);
    const newCount = countTopLevelFindings(newData);
    
    let actionOccurred = true;
    let toastMessage = "Hallazgo modificado con éxito.";

    if (newCount > oldCount) {
        toastMessage = "Hallazgo agregado con éxito.";
    } else if (newCount < oldCount) {
        toastMessage = "Hallazgo eliminado con éxito.";
    } else if (oldCount === 0 && newCount === 0) {
        actionOccurred = false;
    }

    if (activeTab === 'Permanente') {
      setPermanenteData(newData);
    } else {
      setPrimariaData(newData);
    }

    const patientIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (patientIndex > -1) {
      if (activeTab === 'Permanente') {
        mockPacientesData[patientIndex].odontogramaPermanente = newData;
      } else {
        mockPacientesData[patientIndex].odontogramaPrimaria = newData;
      }
      
      if (actionOccurred) {
        // Toast notifications disabled by user request to prevent loops
        // toast({
        //   title: "Guardado Automático",
        //   description: toastMessage,
        // });
      }
    }
  }, [activeTab, permanenteData, primariaData, patientId]);


  const handleUpdateNotes = (newNotes: string) => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1 && paciente) {
        const updatedPatient = { ...paciente, notas: newNotes };
        mockPacientesData[pacienteIndex] = updatedPatient;
        setPaciente(updatedPatient); 
        setDisplayedNotas(newNotes);
        toast({ title: "Notas Guardadas", description: "Las notas del paciente han sido actualizadas."});
    }
  };

  const handleAddTag = (newTag: EtiquetaPaciente): boolean => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1 && paciente) {
        if (paciente.etiquetas && paciente.etiquetas.includes(newTag)) {
            toast({ title: "Etiqueta Duplicada", description: "Esta etiqueta ya existe para el paciente.", variant: "destructive"});
            return false;
        }
        const newTags = [...(paciente.etiquetas || []), newTag];
        const updatedPatient = { ...paciente, etiquetas: newTags };
        mockPacientesData[pacienteIndex] = updatedPatient;
        setPaciente(updatedPatient);
        setDisplayedEtiquetas(newTags);
        toast({ title: "Etiqueta Agregada", description: `Etiqueta "${newTag}" agregada al paciente.`});
        return true;
    }
    return false;
  };

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
    <div className="flex flex-col lg:flex-row gap-6 bg-background min-h-screen">
      <ResumenPaciente paciente={paciente} persona={persona} onBack={() => router.push('/gestion-usuario/pacientes')} />
      <div className="flex-1 space-y-6">
        <EtiquetasNotasSalud
          etiquetas={displayedEtiquetas}
          notas={displayedNotas}
          alergias={displayedAlergias}
          enfermedades={displayedEnfermedades}
          onSaveNotes={handleUpdateNotes}
          onAddTag={handleAddTag}
          patientId={patientId}
        />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Odontograma</CardTitle>
              <CardDescription>Registre los hallazgos dentales del paciente. Los cambios se guardan automáticamente.</CardDescription>
            </div>
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
