// src/components/pacientes/EtiquetasNotasSalud.tsx
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PlusCircle, AlertTriangle, FileText, Tags, Save, X } from 'lucide-react';
import { mockPacientesData } from '@/app/gestion-usuario/pacientes/page';
import type { Paciente as PacienteType, Persona, AntecedentesMedicosData, EtiquetaPaciente } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EtiquetasNotasSaludProps {
  etiquetas: EtiquetaPaciente[];
  enfermedades: string[];
  alergias: string[];
}

const predefinedEtiquetas: EtiquetaPaciente[] = [
    "Alergia a Penicilina", "Diabético", "Menor de Edad", "Fumador", "Hipertenso", "Covid+", "Postquirúrgico", "Anciano", "Nuevo Tag Ejemplo"
  ];  

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

export default function EtiquetasNotasSalud({
  etiquetas,
  enfermedades,
  alergias
}: EtiquetasNotasSaludProps) {
    const params = useParams();
    const patientId = params.id as string;
    const { toast } = useToast();

    const [paciente, setPaciente] = useState<PacienteType | null>(null);
    const [persona, setPersona] = useState<Persona | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentNotes, setCurrentNotes] = useState<string>("");
    const [editingNotesText, setEditingNotesText] = useState<string>("");
    const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

    const [antecedentesForm, setAntecedentesForm] = useState<AntecedentesMedicosData>(initialAntecedentesState);
    const [displayedAlergias, setDisplayedAlergias] = useState<string[]>([]);
    const [displayedEnfermedades, setDisplayedEnfermedades] = useState<string[]>([]);
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
  return (
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-start">
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium text-muted-foreground"><Tags className="mr-2 h-4 w-4" />Etiquetas</Label>
              <div className="flex flex-wrap gap-1">
                {etiquetas.length > 0 ? etiquetas.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>) : <Badge variant="outline">Sin etiquetas</Badge>}
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
                                {predefinedEtiquetas.filter(tag => !etiquetas.includes(tag)).map(tag => (
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
                {enfermedades.length > 0 ? enfermedades.map(enf => <Badge key={enf} variant="outline" className="border-orange-500 text-orange-600 mr-1 mb-1">{enf}</Badge>) : <Badge variant="outline" className="font-normal">Sin enfermedades registradas</Badge>}
              </div>
              <div className="mt-2">
                <h4 className="font-medium text-xs text-foreground mb-1">Alergias:</h4>
                {alergias.length > 0 ? alergias.map(alergia => <Badge key={alergia} variant="outline" className="border-red-500 text-red-600 mr-1 mb-1">{alergia}</Badge>) : <Badge variant="outline" className="font-normal">Sin alergias registradas</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
  );
}
