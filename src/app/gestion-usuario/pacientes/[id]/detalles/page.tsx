
"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone, ArrowLeft, Edit, PlusCircle, Users, CalendarDays as CalendarIconLucide, AlertTriangle, FileText, Tags, Save, X } from 'lucide-react';
import { mockPacientesData } from '@/app/gestion-usuario/pacientes/page';
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


const enfermedadesOptions = [
  "Cardiopatía", "Fiebre Reumática", "Artritis", "Tuberculosis", "Anemia",
  "Epilepsia", "Lesiones cardíacas", "Hepatitis", "Tratamiento psíquico",
  "Marcapasos", "Tratamiento oncológico", "Hipertensión arterial", "Diabetes",
  "Apoplejía", "Accidentes vasculares", "Pérdida de peso"
];

const predefinedEtiquetas: EtiquetaPaciente[] = [
  "Alergia a Penicilina", "Diabético", "Menor de Edad", "Fumador", "Hipertenso", "Covid+", "Postquirúrgico", "Anciano", "Nuevo Tag Ejemplo"
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
  q8_embarazada: "No", q8_semanas: "N/A", // Default based on initial mock, adjust if needed
  q9_hipertenso: "Sí",
  q10_ultimaConsultaDental: "Hace 6 meses",
};

export default function DetallePacientePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [age, setAge] = useState<string | number>('Calculando...');
  const [createdDate, setCreatedDate] = useState<string>('Calculando...');
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [editingNotesText, setEditingNotesText] = useState<string>("");
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  const [antecedentesForm, setAntecedentesForm] = useState<AntecedentesMedicosData>(initialAntecedentesState);
  const [displayedAlergias, setDisplayedAlergias] = useState<string[]>([]);
  const [displayedEnfermedades, setDisplayedEnfermedades] = useState<string[]>([]);
  const [isAddPacienteFormOpen, setIsAddPacienteFormOpen] = useState(false);
  const [currentPatientTags, setCurrentPatientTags] = useState<EtiquetaPaciente[]>([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedTagToAdd, setSelectedTagToAdd] = useState<EtiquetaPaciente | "">("");


  useEffect(() => {
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    if (foundPaciente) {
      setPaciente(foundPaciente);
      setPersona(foundPaciente.persona);
      setCurrentNotes(foundPaciente.notas || "Sin notas registradas.");
      setEditingNotesText(foundPaciente.notas || "");
      setCurrentPatientTags(foundPaciente.etiquetas || []);
      const initialFormState = {
        ...initialAntecedentesState, // Start with general defaults
        ...(foundPaciente.antecedentesMedicos || {}), // Override with patient-specific if they exist
      };
      // Ensure q5_enfermedades is always an array
      if (!Array.isArray(initialFormState.q5_enfermedades)) {
        initialFormState.q5_enfermedades = foundPaciente.antecedentesMedicos?.q5_enfermedades ? [foundPaciente.antecedentesMedicos.q5_enfermedades as unknown as string] : [];
      }


      setAntecedentesForm(initialFormState);

      // Initialize displayed alergias/enfermedades from the form state
      setDisplayedAlergias(initialFormState.q3_cuales && initialFormState.q3_alergico === "Sí" ? initialFormState.q3_cuales.split(',').map(s => s.trim()).filter(Boolean) : []);
      setDisplayedEnfermedades(initialFormState.q5_enfermedades || []);

    } else {
      setPaciente(null);
      setPersona(null);
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
          const parsedDate = parseDate(paciente.fechaIngreso, 'dd/MM/yyyy', new Date());
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
    // Here you would typically send data to a backend
    // For now, we'll just update the "displayed" alergias/enfermedades
    const alergiasArray = antecedentesForm.q3_cuales && antecedentesForm.q3_alergico === "Sí"
        ? antecedentesForm.q3_cuales.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    setDisplayedAlergias(alergiasArray);
    setDisplayedEnfermedades(antecedentesForm.q5_enfermedades || []);

    // Update mockPacientesData (simulating save)
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1) {
        mockPacientesData[pacienteIndex] = {
            ...mockPacientesData[pacienteIndex],
            antecedentesMedicos: { ...antecedentesForm }
        };
    }

    toast({
      title: "Antecedentes Actualizados",
      description: "Los antecedentes médicos del paciente han sido guardados.",
      variant: "default"
    });
  };

  const handleSaveNotes = () => {
    setCurrentNotes(editingNotesText);
    // Simulate saving to backend/mock data
     const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1) {
        mockPacientesData[pacienteIndex].notas = editingNotesText;
    }
    setIsEditingNotes(false);
    toast({ title: "Notas Guardadas", description: "Las notas del paciente han sido actualizadas."});
  };

  const handleCancelEditNotes = () => {
    setEditingNotesText(currentNotes === "Sin notas registradas." ? "" : currentNotes);
    setIsEditingNotes(false);
  };
  
  const handleSavePacienteDetails = (updatedPaciente: PacienteType) => {
    // Update the main paciente state
    setPaciente(updatedPaciente);
    if(updatedPaciente.persona) {
      setPersona(updatedPaciente.persona);
    }
    // Update the mock data array (important for persistence across navigations in this mock setup)
    const index = mockPacientesData.findIndex(p => p.id === updatedPaciente.id);
    if (index !== -1) {
      mockPacientesData[index] = updatedPaciente;
    }
    setIsAddPacienteFormOpen(false);
    toast({
      title: "Paciente Actualizado",
      description: "Los datos del paciente han sido actualizados.",
    });
  };

  const handleAddTag = () => {
    if (selectedTagToAdd && !currentPatientTags.includes(selectedTagToAdd)) {
      const newTags = [...currentPatientTags, selectedTagToAdd];
      setCurrentPatientTags(newTags);
      // Simulate saving to backend/mock data
      const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
      if (pacienteIndex > -1) {
          mockPacientesData[pacienteIndex].etiquetas = newTags;
      }
      toast({ title: "Etiqueta Agregada", description: `Etiqueta "${selectedTagToAdd}" agregada al paciente.`});
      setSelectedTagToAdd(""); // Reset selection
      setIsTagModalOpen(false);
    } else if (currentPatientTags.includes(selectedTagToAdd as EtiquetaPaciente)) {
        toast({ title: "Etiqueta Duplicada", description: "Esta etiqueta ya existe para el paciente.", variant: "destructive"});
    }
  };


  if (loading) return <div className="flex justify-center items-center h-screen"><p>Cargando datos del paciente...</p></div>;
  if (!paciente || !persona) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <ToothIconCustom className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Paciente no Encontrado</h1>
        <p className="text-muted-foreground mb-6">No pudimos encontrar los detalles para el paciente solicitado.</p>
        <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
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
      <Card className="w-full lg:w-[320px] lg:max-w-xs shrink-0 self-start sticky top-6">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Button variant="ghost" onClick={() => router.back()} className="self-start mb-2 -ml-2"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${persona.nombre[0]}${persona.apellidoPaterno[0]}`} alt={`${persona.nombre} ${persona.apellidoPaterno}`} data-ai-hint="person portrait"/>
            <AvatarFallback>{persona.nombre[0]}{persona.apellidoPaterno[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{`${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</h2>
          <p className="text-sm text-muted-foreground">{age} años</p>
          <p className="text-xs text-muted-foreground mt-1">Paciente desde: {createdDate}</p>
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" size="icon" asChild><a href={`https://wa.me/${persona.telefono.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageSquare className="h-4 w-4" /></a></Button>
            <Button variant="outline" size="icon" asChild><a href={`mailto:${persona.email}`} aria-label="Email"><Mail className="h-4 w-4" /></a></Button>
            <Button variant="outline" size="icon" onClick={() => alert(`Llamar a ${persona.telefono}`)} aria-label="Llamar"><Phone className="h-4 w-4" /></Button>
          </div>
          <Separator className="my-6" />
          <div className="w-full space-y-1 text-left">
            <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10"><Users className="mr-2 h-4 w-4" /> Filiación</Button>
            <Button variant="ghost" className="w-full justify-start"><CalendarIconLucide className="mr-2 h-4 w-4" /> Historia clínica</Button>
             <Button variant="ghost" className="w-full justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12.546 2.303a1 1 0 0 0-1.092 0L2.803 8.349a1 1 0 0 0-.355.705V19a1 1 0 0 0 1 1h17.104a1 1 0 0 0 1-1V9.054a1 1 0 0 0-.355-.705Z"/><path d="M12 21V11l-5 2.5V16Z"/><path d="M12 11l5 2.5V16Z"/><path d="M18.5 14.5V10l-6-3-6 3v4.5L12 18Z"/><path d="M2 8h20"/></svg> Odontograma
            </Button>
          </div>
          <Button className="mt-6 w-full" onClick={() => alert("Funcionalidad 'Comienza aquí' no implementada")}>¡Comienza aquí!</Button>
        </CardContent>
      </Card>

      <div className="flex-1">
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-start">
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium text-muted-foreground"><Tags className="mr-2 h-4 w-4" />Etiquetas</Label>
              <div className="flex flex-wrap gap-1">
                {currentPatientTags.length > 0 ? currentPatientTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>) : <Badge variant="outline">Sin etiquetas</Badge>}
              </div>
               <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto mt-1"><PlusCircle className="mr-1 h-3 w-3"/> Agregar Etiqueta</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader><DialogTitle>Agregar Etiqueta</DialogTitle><DialogDescription>Seleccione una etiqueta para agregar al paciente.</DialogDescription></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Select value={selectedTagToAdd} onValueChange={(value) => setSelectedTagToAdd(value as EtiquetaPaciente)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione una etiqueta..." /></SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Etiquetas Disponibles</SelectLabel>
                                {predefinedEtiquetas.filter(tag => !currentPatientTags.includes(tag)).map(tag => (
                                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTagModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" onClick={handleAddTag} disabled={!selectedTagToAdd}>Agregar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas-paciente" className="flex items-center text-sm font-medium text-muted-foreground"><FileText className="mr-2 h-4 w-4" />Notas</Label>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea id="notas-paciente-edit" placeholder="Escribe aquí..." value={editingNotesText} onChange={(e) => setEditingNotesText(e.target.value)} rows={4} className="text-sm"/>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelEditNotes}><X className="mr-1 h-3 w-3"/>Cancelar</Button>
                    <Button size="sm" onClick={handleSaveNotes}><Save className="mr-1 h-3 w-3"/>Guardar</Button>
                  </div>
                </div>
              ) : (
                <Card onClick={() => { setEditingNotesText(currentNotes === "Sin notas registradas." ? "" : currentNotes); setIsEditingNotes(true);}} className="p-3 min-h-[80px] cursor-pointer hover:bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{currentNotes || "Clic para agregar notas..."}</p>
                </Card>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium text-muted-foreground"><AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />Salud General</Label>
              <div>
                <h4 className="font-medium text-xs text-foreground mb-1">Enfermedades:</h4>
                {displayedEnfermedades.length > 0 ? displayedEnfermedades.map(enf => <Badge key={enf} variant="outline" className="border-orange-500 text-orange-600 mr-1 mb-1">{enf}</Badge>) : <Badge variant="outline" className="font-normal">Sin enfermedades registradas</Badge>}
              </div>
              <div className="mt-2">
                <h4 className="font-medium text-xs text-foreground mb-1">Alergias:</h4>
                {displayedAlergias.length > 0 ? displayedAlergias.map(alergia => <Badge key={alergia} variant="outline" className="border-red-500 text-red-600 mr-1 mb-1">{alergia}</Badge>) : <Badge variant="outline" className="font-normal">Sin alergias registradas</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="datosPersonales" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="datosPersonales">Datos Personales</TabsTrigger>
            <TabsTrigger value="antecedentesMedicos">Antecedentes Médicos</TabsTrigger>
            <TabsTrigger value="historialCitas">Historial de Citas</TabsTrigger>
          </TabsList>
          <TabsContent value="datosPersonales">
            <Card>
              <CardHeader><CardTitle>Información del Paciente</CardTitle><CardDescription>Detalles personales y de contacto del paciente.</CardDescription></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div><Label className="text-xs text-muted-foreground">Nombres</Label><p className="font-medium">{persona.nombre}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Apellidos</Label><p className="font-medium">{`${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Nacionalidad</Label><p className="font-medium">Peruana</p></div>
                  <div><Label className="text-xs text-muted-foreground">Teléfono Celular</Label><p className="font-medium">{persona.telefono}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label><p className="font-medium">{persona.fechaNacimiento ? format(new Date(persona.fechaNacimiento), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Tipo Documento</Label><p className="font-medium">{persona.tipoDocumento}</p></div>
                  <div><Label className="text-xs text-muted-foreground">N° Documento</Label><p className="font-medium">{persona.numeroDocumento}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Fecha de Ingreso (Paciente)</Label><p className="font-medium">{createdDate}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Estado (Paciente)</Label><p className="font-medium"><Badge variant={paciente.estado === 'Activo' ? 'default' : 'destructive'}>{paciente.estado}</Badge></p></div>
                  <div><Label className="text-xs text-muted-foreground">N° Historia Clínica</Label><p className="font-medium">{paciente.id.substring(paciente.id.length-6).toUpperCase()}</p></div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="outline" size="sm" onClick={() => setIsAddPacienteFormOpen(true)}><Edit className="mr-1 h-3 w-3"/> Editar Campos</Button>
                </div>
              </CardContent>
            </Card>
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
                            <TableCell>{format(cita.start, 'dd/MM/yyyy', { locale: es })}</TableCell>
                            <TableCell>{format(cita.start, 'HH:mm a', { locale: es })}</TableCell>
                            <TableCell>{cita.doctor || 'N/A'}</TableCell>
                            <TableCell>{cita.title}</TableCell>
                            <TableCell className="text-right"><Badge variant={new Date(cita.end) < new Date() ? 'outline' : (cita.tipoCita === 'consulta' || cita.tipoCita === 'control') ? 'default' : (cita.tipoCita === 'tratamiento') ? 'secondary' : 'outline' }>{new Date(cita.end) < new Date() ? 'Completada' : (cita.tipoCita ? cita.tipoCita.charAt(0).toUpperCase() + cita.tipoCita.slice(1) : 'Pendiente') }</Badge></TableCell>
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
            initialPacienteData={paciente}
            onPacienteSaved={handleSavePacienteDetails}
        />
      )}
    </div>
  );
}

