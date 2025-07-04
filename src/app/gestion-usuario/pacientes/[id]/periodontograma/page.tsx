
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockPacientesData } from '@/lib/data';
import type { Paciente as PacienteType, Persona, EtiquetaPaciente } from '@/types';
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ToothIconCustom = (props: React.SVGProps<SVGSVGElement>) => (
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

export default function PeriodontogramaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

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


  if (loading) return <div className="flex justify-center items-center h-screen"><p>Cargando datos del periodontograma...</p></div>;
  if (!paciente || !persona) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <ToothIconCustom className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Paciente no Encontrado</h1>
        <p className="text-muted-foreground mb-6">No pudimos encontrar los detalles para el paciente solicitado.</p>
        <Button onClick={() => router.push('/gestion-usuario/pacientes')}><ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-background min-h-screen">
      <ResumenPaciente paciente={paciente} persona={persona} onBack={() => router.push('/gestion-usuario/pacientes')} />
      <div className="flex-1">
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
            <CardTitle>Periodontograma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Construyendo la sección de Periodontograma...</p>
            {/* Future content for Periodontograma will go here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
