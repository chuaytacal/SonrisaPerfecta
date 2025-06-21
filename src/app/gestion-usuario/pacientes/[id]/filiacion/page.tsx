
"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone, ArrowLeft, Edit, PlusCircle, Users, CalendarDays as CalendarIconLucide, AlertTriangle, FileText, Tags, Save, X, UserSquare, User } from 'lucide-react';
import { mockPacientesData, mockPersonasData } from '@/app/gestion-usuario/pacientes/page'; // Import shared mock data
import type { Paciente as PacienteType, Persona, AntecedentesMedicosData, EtiquetaPaciente } from '@/types';
import { format, differenceInYears, parse as parseDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types/calendar';
import { generateInitialAppointments } from '@/app/calendario/page';
import { useToast } from '@/hooks/use-toast';
import { AddPacienteForm } from '@/components/pacientes/AddPacienteForm';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud';


const enfermedadesOptions = [
  "Cardiopatía", "Fiebre Reumática", "Artritis", "Tuberculosis", "Anemia",
  "Epilepsia", "Lesiones cardíacas", "Hepatitis", "Tratamiento psíquico",
  "Marcapasos", "Tratamiento oncológico", "Hipertensión arterial", "Diabetes",
  "Apoplejía", "Accidentes vasculares", "Pérdida de peso"
];

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

const getPatientAppointments = (pacienteNombre: string | undefined): Appointment[] => {
    if (!pacienteNombre) return [];
    const allAppointments = generateInitialAppointments();
    return allAppointments.filter(appt => appt.paciente && appt.paciente.toLowerCase().includes(pacienteNombre.split(' ')[0].toLowerCase())).slice(0, 5);
};


const initialAntecedentesState: AntecedentesMedicosData = {
  q1_hospitalizado: "No", q1_porque: "N/A", q1_donde: "N/A",
  q2_atencionMedica: "Sí", q2_porque: "Control de rutina", q2_donde: "Clínica Local",
  q3_alergico: "Sí", q3_cuales: "Penicilina",
  q4_hemorragia: "No",
  q5_enfermedades: ["Hipertensión arterial"],
  q6_otraEnfermedad: "No", q6_cual: "N/A",
  q7_medicacionActual: "Sí", q7_cual: "Losartán para la presión",
  q8_embarazada: "No", q8_semanas: "N/A",
  q9_hipertenso: "Sí",
  q10_ultimaConsultaDental: "Hace 6 meses",
};

export default function FiliacionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [apoderado, setApoderado] = useState<Persona | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const [age, setAge] = useState<string | number>('Calculando...');
  const [createdDate, setCreatedDate] = useState<string>('Calculando...');
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [antecedentesForm, setAntecedentesForm] = useState<AntecedentesMedicosData>(initialAntecedentesState);
  const [isAddPacienteFormOpen, setIsAddPacienteFormOpen] = useState(false);

  // States for EtiquetasNotasSalud to receive as props
  const [displayedNotas, setDisplayedNotas] = useState<string>("Sin notas registradas.");
  const [displayedEtiquetas, setDisplayedEtiquetas] = useState<EtiquetaPaciente[]>([]);
  const [displayedAlergias, setDisplayedAlergias] = useState<string[]>([]);
  const [displayedEnfermedades, setDisplayedEnfermedades] = useState<string[]>([]);

  const deriveAlergiasFromAntecedentes = (antecedentes?: AntecedentesMedicosData): string[] => {
    if (antecedentes && antecedentes.q3_cuales && antecedentes.q3_alergico === "Sí") {
      return antecedentes.q3_cuales.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const deriveEnfermedadesFromAntecedentes = (antecedentes?: AntecedentesMedicosData): string[] => {
    return antecedentes?.q5_enfermedades || [];
  };


  useEffect(() => {
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    if (foundPaciente) {
      setPaciente(foundPaciente);
      setPersona(foundPaciente.persona);

      const calculatedAge = foundPaciente.persona.fechaNacimiento ? differenceInYears(new Date(), new Date(foundPaciente.persona.fechaNacimiento)) : NaN;
      setIsMinor(!isNaN(calculatedAge) && calculatedAge < 18);

      if (foundPaciente.idApoderado) {
          const foundApoderado = mockPersonasData.find(p => p.id === foundPaciente.idApoderado);
          setApoderado(foundApoderado || null);
      }

      const initialFormStateFromData = {
        ...initialAntecedentesState,
        ...(foundPaciente.antecedentesMedicos || {}),
      };
      if (!Array.isArray(initialFormStateFromData.q5_enfermedades)) {
        initialFormStateFromData.q5_enfermedades = foundPaciente.antecedentesMedicos?.q5_enfermedades ? [foundPaciente.antecedentesMedicos.q5_enfermedades as unknown as string] : [];
      }
      setAntecedentesForm(initialFormStateFromData);
      
      setDisplayedNotas(foundPaciente.notas || "Sin notas registradas.");
      setDisplayedEtiquetas(foundPaciente.etiquetas || []);
      setDisplayedAlergias(deriveAlergiasFromAntecedentes(foundPaciente.antecedentesMedicos));
      setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(foundPaciente.antecedentesMedicos));

    } else {
      setPaciente(null);
      setPersona(null);
      setApoderado(null);
      setDisplayedNotas("Sin notas registradas.");
      setDisplayedEtiquetas([]);
      setDisplayedAlergias([]);
      setDisplayedEnfermedades([]);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    if (persona) {
      const calculatedAge = persona.fechaNacimiento ? differenceInYears(new Date(), new Date(persona.fechaNacimiento)) : 'N/A';
      setAge(calculatedAge);
      setPatientAppointments(getPatientAppointments(persona.nombre));
    }
    if (paciente && paciente.fechaIngreso) {
      try {
          let parsedDate = parseDate(paciente.fechaIngreso, 'dd/MM/yyyy', new Date());
          if (isNaN(parsedDate.getTime()) && typeof paciente.fechaIngreso === 'string' && paciente.fechaIngreso.includes('T')) {
              parsedDate = new Date(paciente.fechaIngreso);
          }
          if (!isNaN(parsedDate.getTime())) {
            setCreatedDate(format(parsedDate, 'dd MMM yyyy', { locale: es }));
          } else {
            setCreatedDate('Fecha inválida');
          }
      } catch (error) {
          setCreatedDate('Fecha inválida');
      }
    } else if (paciente) {
        setCreatedDate('N/A');
    }
  }, [persona, paciente]);

  const handleAntecedentesChange = (field: keyof AntecedentesMedicosData, value: string | string[] | boolean) => {
    setAntecedentesForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAntecedentes = () => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1 && paciente) {
        const updatedAntecedentes = { ...antecedentesForm };
        const updatedPatient = {
            ...paciente,
            antecedentesMedicos: updatedAntecedentes
        };
        mockPacientesData[pacienteIndex] = updatedPatient;
        setPaciente(updatedPatient); // Update local paciente state
        
        setDisplayedAlergias(deriveAlergiasFromAntecedentes(updatedAntecedentes));
        setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(updatedAntecedentes));
    }

    toast({
      title: "Antecedentes Actualizados",
      description: "Los antecedentes médicos del paciente han sido guardados.",
      variant: "default"
    });
  };
  
  const handleUpdateNotesInDetalles = (newNotes: string) => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1 && paciente) {
        const updatedPatient = { ...paciente, notas: newNotes };
        mockPacientesData[pacienteIndex] = updatedPatient;
        setPaciente(updatedPatient); // Crucial: update local state
        setDisplayedNotas(newNotes); // And state passed to child
        toast({ title: "Notas Guardadas", description: "Las notas del paciente han sido actualizadas."});
    }
  };

  const handleAddTagInDetalles = (newTag: EtiquetaPaciente): boolean => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1 && paciente) {
        if (paciente.etiquetas && paciente.etiquetas.includes(newTag)) {
            toast({ title: "Etiqueta Duplicada", description: "Esta etiqueta ya existe para el paciente.", variant: "destructive"});
            return false;
        }
        const newTags = [...(paciente.etiquetas || []), newTag];
        const updatedPatient = { ...paciente, etiquetas: newTags };
        mockPacientesData[pacienteIndex] = updatedPatient;
        setPaciente(updatedPatient); // Crucial: update local state
        setDisplayedEtiquetas(newTags); // And state passed to child
        toast({ title: "Etiqueta Agregada", description: `Etiqueta "${newTag}" agregada al paciente.`});
        return true;
    }
    return false;
  };


  const handleSavePacienteDetails = (updatedPacienteFromForm: PacienteType, updatedApoderado?: Persona) => {
    // Update Apoderado in our mock "DB"
    if (updatedApoderado) {
        const apoderadoIndex = mockPersonasData.findIndex(p => p.id === updatedApoderado.id);
        if(apoderadoIndex > -1) {
            mockPersonasData[apoderadoIndex] = updatedApoderado;
        }
        setApoderado(updatedApoderado); // Update local state for immediate view
    } else {
        setApoderado(null); // Clear apoderado if they are no longer needed
    }

    // Update Paciente and their Persona in our mock "DB"
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === updatedPacienteFromForm.id);
    if (pacienteIndex > -1) {
        const personaIndex = mockPersonasData.findIndex(p => p.id === updatedPacienteFromForm.idPersona);
        if(personaIndex > -1) {
            mockPersonasData[personaIndex] = updatedPacienteFromForm.persona;
        }
        
        mockPacientesData[pacienteIndex] = updatedPacienteFromForm;
      
        // Update local state to reflect changes immediately
        setPaciente(updatedPacienteFromForm); 
        setPersona(updatedPacienteFromForm.persona);
        
        // Re-calculate age and minority status and update state
        const calculatedAge = updatedPacienteFromForm.persona.fechaNacimiento 
            ? differenceInYears(new Date(), new Date(updatedPacienteFromForm.persona.fechaNacimiento)) 
            : NaN;
        setIsMinor(!isNaN(calculatedAge) && calculatedAge < 18);

        // Update derived state for EtiquetasNotasSalud for consistency
        setDisplayedNotas(updatedPacienteFromForm.notas || "Sin notas registradas.");
        setDisplayedEtiquetas(updatedPacienteFromForm.etiquetas || []);
        setDisplayedAlergias(deriveAlergiasFromAntecedentes(updatedPacienteFromForm.antecedentesMedicos));
        setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(updatedPacienteFromForm.antecedentesMedicos));
    }

    setIsAddPacienteFormOpen(false);
    toast({
      title: "Paciente Actualizado",
      description: "Los datos del paciente han sido actualizados.",
    });
  };


  if (loading) return <div className="flex justify-center items-center h-screen"><p>Cargando datos de filiación...</p></div>;
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

  const renderAntecedentesMedicos = () => (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q1_hospitalizado">1. ¿Hospitalizado últimos años?</Label>
            <Select value={antecedentesForm.q1_hospitalizado || "No"} onValueChange={(val) => handleAntecedentesChange('q1_hospitalizado', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q1_porque">¿Por qué?</Label><Input id="q1_porque" value={antecedentesForm.q1_porque || ""} onChange={(e) => handleAntecedentesChange('q1_porque', e.target.value)} /></div>
        <div className="md:col-span-3"><Label htmlFor="q1_donde">¿Dónde?</Label><Textarea id="q1_donde" value={antecedentesForm.q1_donde || ""} onChange={(e) => handleAntecedentesChange('q1_donde', e.target.value)} /></div>
      </div>
      <Separator />
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q2_atencionMedica">2. ¿Atención médica últimos años?</Label>
            <Select value={antecedentesForm.q2_atencionMedica || "No"} onValueChange={(val) => handleAntecedentesChange('q2_atencionMedica', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q2_porque">¿Por qué?</Label><Input id="q2_porque" value={antecedentesForm.q2_porque || ""} onChange={(e) => handleAntecedentesChange('q2_porque', e.target.value)} /></div>
        <div className="md:col-span-3"><Label htmlFor="q2_donde">¿Dónde?</Label><Textarea id="q2_donde" value={antecedentesForm.q2_donde || ""} onChange={(e) => handleAntecedentesChange('q2_donde', e.target.value)} /></div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q3_alergico">3. ¿Alérgico a droga/anestesia/antibiótico?</Label>
            <Select value={antecedentesForm.q3_alergico || "No"} onValueChange={(val) => handleAntecedentesChange('q3_alergico', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q3_cuales">¿Cuáles?</Label><Input id="q3_cuales" value={antecedentesForm.q3_cuales || ""} onChange={(e) => handleAntecedentesChange('q3_cuales', e.target.value)} placeholder="Ej: Penicilina, Aspirina"/></div>
      </div>
      <Separator />
      <div>
        <Label htmlFor="q4_hemorragia">4. ¿Hemorragia tratada?</Label>
        <Select value={antecedentesForm.q4_hemorragia || "No"} onValueChange={(val) => handleAntecedentesChange('q4_hemorragia', val)}>
            <SelectTrigger className="w-full md:w-1/3"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
        </Select>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>5. Si ha tenido alguna de estas enfermedades, márquela:</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {enfermedadesOptions.map(enf => (
            <div key={enf} className="flex items-center space-x-2">
              <Checkbox 
                id={`enf-${enf.replace(/\s+/g, '-')}`} 
                checked={(antecedentesForm.q5_enfermedades || []).includes(enf)}
                onCheckedChange={(checked) => {
                    const currentEnfermedades = antecedentesForm.q5_enfermedades || [];
                    if (checked) {
                        handleAntecedentesChange('q5_enfermedades', [...currentEnfermedades, enf]);
                    } else {
                        handleAntecedentesChange('q5_enfermedades', currentEnfermedades.filter(item => item !== enf));
                    }
                }}
              />
              <Label htmlFor={`enf-${enf.replace(/\s+/g, '-')}`} className="font-normal">{enf}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q6_otraEnfermedad">6. ¿Alguna otra enfermedad?</Label>
             <Select value={antecedentesForm.q6_otraEnfermedad || "No"} onValueChange={(val) => handleAntecedentesChange('q6_otraEnfermedad', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q6_cual">¿Cuál?</Label><Input id="q6_cual" value={antecedentesForm.q6_cual || ""} onChange={(e) => handleAntecedentesChange('q6_cual', e.target.value)} /></div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q7_medicacionActual">7. ¿Medicación actualmente?</Label>
            <Select value={antecedentesForm.q7_medicacionActual || "No"} onValueChange={(val) => handleAntecedentesChange('q7_medicacionActual', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q7_cual">¿Cuál?</Label><Input id="q7_cual" value={antecedentesForm.q7_cual || ""} onChange={(e) => handleAntecedentesChange('q7_cual', e.target.value)} /></div>
      </div>
      <Separator />
      {persona?.sexo === 'F' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
                <Label htmlFor="q8_embarazada">8. ¿Está embarazada?</Label>
                <Select value={antecedentesForm.q8_embarazada || "No"} onValueChange={(val) => handleAntecedentesChange('q8_embarazada', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
            </div>
            <div className="md:col-span-2"><Label htmlFor="q8_semanas">¿Cuántas semanas?</Label><Input id="q8_semanas" value={antecedentesForm.q8_semanas || ""} onChange={(e) => handleAntecedentesChange('q8_semanas', e.target.value)} /></div>
        </div>
        <Separator />
        </>
      )}
      <div>
        <Label htmlFor="q9_hipertenso">9. ¿Hipertenso o presión alta?</Label>
         <Select value={antecedentesForm.q9_hipertenso || "No"} onValueChange={(val) => handleAntecedentesChange('q9_hipertenso', val)}>
            <SelectTrigger className="w-full md:w-1/3"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
        </Select>
      </div>
      <Separator />
      <div><Label htmlFor="q10_ultimaConsultaDental">10. Última consulta dental:</Label><Input id="q10_ultimaConsultaDental" value={antecedentesForm.q10_ultimaConsultaDental || ""} onChange={(e) => handleAntecedentesChange('q10_ultimaConsultaDental', e.target.value)} /></div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveAntecedentes}><Save className="mr-2 h-4 w-4"/> Guardar Cambios</Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-background min-h-screen">
      <ResumenPaciente paciente={paciente} persona={persona} onBack={() => router.push('/gestion-usuario/pacientes')} />

      <div className="flex-1">
        <EtiquetasNotasSalud 
          etiquetas={displayedEtiquetas}
          notas={displayedNotas}
          alergias={displayedAlergias}
          enfermedades={displayedEnfermedades}
          onSaveNotes={handleUpdateNotesInDetalles}
          onAddTag={handleAddTagInDetalles}
          patientId={patientId}
          />

        <Tabs defaultValue="datosPersonales" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="datosPersonales">Datos Personales</TabsTrigger>
            <TabsTrigger value="antecedentesMedicos">Antecedentes Médicos</TabsTrigger>
            <TabsTrigger value="historialCitas">Historial de Citas</TabsTrigger>
          </TabsList>
          <TabsContent value="datosPersonales">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    Información del Paciente
                </CardTitle>
                <CardDescription>Detalles personales y de contacto del paciente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div><Label className="text-xs text-muted-foreground">Nombres</Label><p className="font-medium">{persona.nombre}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Apellidos</Label><p className="font-medium">{`${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Tipo Documento</Label><p className="font-medium">{persona.tipoDocumento}</p></div>
                  <div><Label className="text-xs text-muted-foreground">N° Documento</Label><p className="font-medium">{persona.numeroDocumento}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Sexo</Label><p className="font-medium">{persona.sexo === "M" ? "Masculino" : "Femenino"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Teléfono Celular</Label><p className="font-medium">{persona.telefono}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label><p className="font-medium">{persona.fechaNacimiento ? format(new Date(persona.fechaNacimiento), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Dirección</Label><p className="font-medium">{persona.direccion}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Fecha de Ingreso (Paciente)</Label><p className="font-medium">{createdDate}</p></div>
                  <div><Label className="text-xs text-muted-foreground">N° Historia Clínica</Label><p className="font-medium">{paciente.id.substring(paciente.id.length-6).toUpperCase()}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Estado (Paciente)</Label><div className="font-medium"><Badge variant={paciente.estado === 'Activo' ? 'default' : 'destructive'}>{paciente.estado}</Badge></div></div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="outline" size="sm" onClick={() => setIsAddPacienteFormOpen(true)}><Edit className="mr-1 h-3 w-3"/> Editar Campos</Button>
                </div>
              </CardContent>
            </Card>

            {isMinor && apoderado && (
              <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center"><UserSquare className="mr-2 h-5 w-5 text-primary" />Información del Apoderado</CardTitle>
                    <CardDescription>Detalles personales y de contacto del apoderado.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div><Label className="text-xs text-muted-foreground">Nombres</Label><p className="font-medium">{apoderado.nombre}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Apellidos</Label><p className="font-medium">{`${apoderado.apellidoPaterno} ${apoderado.apellidoMaterno}`}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Tipo Documento</Label><p className="font-medium">{apoderado.tipoDocumento}</p></div>
                      <div><Label className="text-xs text-muted-foreground">N° Documento</Label><p className="font-medium">{apoderado.numeroDocumento}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Sexo</Label><p className="font-medium">{apoderado.sexo === "M" ? "Masculino" : "Femenino"}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Teléfono Celular</Label><p className="font-medium">{apoderado.telefono}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label><p className="font-medium">{apoderado.fechaNacimiento ? format(new Date(apoderado.fechaNacimiento), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Dirección</Label><p className="font-medium">{apoderado.direccion}</p></div>
                    </div>
                  </CardContent>
              </Card>
            )}

          </TabsContent>
          <TabsContent value="antecedentesMedicos"><Card><CardHeader><CardTitle>Cuestionario de Salud (Antecedentes)</CardTitle><CardDescription>Respuestas del paciente al cuestionario de salud.</CardDescription></CardHeader><CardContent>{renderAntecedentesMedicos()}</CardContent></Card></TabsContent>
          <TabsContent value="historialCitas">
            <Card>
              <CardHeader><CardTitle>Resumen de Historial de Citas</CardTitle><CardDescription>Listado de las últimas citas del paciente.</CardDescription></CardHeader>
              <CardContent>
                {patientAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Hora</TableHead><TableHead>Profesional</TableHead><TableHead>Servicio/Motivo</TableHead><TableHead className="text-right">Estado</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {patientAppointments.map(cita => (
                          <TableRow key={cita.id}>
                            <TableCell>{cita.start ? format(cita.start, 'dd/MM/yyyy', { locale: es }) : 'N/A'}</TableCell>
                            <TableCell>{cita.start ? format(cita.start, 'HH:mm a', { locale: es }) : 'N/A'}</TableCell>
                            <TableCell>{cita.doctor || 'N/A'}</TableCell>
                            <TableCell>{cita.title}</TableCell>
                            <TableCell className="text-right"><Badge variant={cita.end && new Date(cita.end) < new Date() ? 'outline' : (cita.tipoCita === 'consulta' || cita.tipoCita === 'control') ? 'default' : (cita.tipoCita === 'tratamiento') ? 'secondary' : 'outline' }>{cita.end && new Date(cita.end) < new Date() ? 'Completada' : (cita.tipoCita ? cita.tipoCita.charAt(0).toUpperCase() + cita.tipoCita.slice(1) : 'Pendiente') }</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : <p className="text-muted-foreground text-center py-4">No hay citas registradas para este paciente.</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {paciente && (
        <AddPacienteForm
            open={isAddPacienteFormOpen}
            onOpenChange={setIsAddPacienteFormOpen}
            initialPacienteData={paciente} // Pass the full paciente object
            initialApoderadoData={apoderado}
            onPacienteSaved={handleSavePacienteDetails}
        />
      )}
    </div>
  );
}
