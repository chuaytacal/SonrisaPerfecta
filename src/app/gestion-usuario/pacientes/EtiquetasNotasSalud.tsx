// src/components/pacientes/EtiquetasNotasSalud.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertTriangle, FileText, Tags, Save, X } from 'lucide-react';
import type { EtiquetaPaciente } from '@/types';
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
  } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { mockEtiquetas } from '@/lib/data';

interface EtiquetasNotasSaludProps {
  etiquetas: EtiquetaPaciente[];
  notas: string;
  alergias: string[];
  enfermedades: string[];
  onSaveNotes: (newNotes: string) => void;
  onAddTag: (newTag: EtiquetaPaciente) => boolean; // Returns true on success, false if duplicate
  patientId: string; // Keep for keying elements or specific logic if needed locally
}

export default function EtiquetasNotasSalud({
  etiquetas,
  notas,
  alergias,
  enfermedades,
  onSaveNotes,
  onAddTag,
  patientId,
}: EtiquetasNotasSaludProps) {
    const { toast } = useToast();

    const [editingNotesText, setEditingNotesText] = useState<string>(notas);
    const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [selectedTagToAdd, setSelectedTagToAdd] = useState<EtiquetaPaciente | "">("");

    useEffect(() => {
      setEditingNotesText(notas === "Sin notas registradas." ? "" : notas);
    }, [notas]);
    
    const handleInternalSaveNotes = () => {
        onSaveNotes(editingNotesText);
        setIsEditingNotes(false);
        // Toast is now handled by parent
    };
    
    const handleInternalCancelEditNotes = () => {
        setEditingNotesText(notas === "Sin notas registradas." ? "" : notas);
        setIsEditingNotes(false);
    };

    const handleInternalAddTag = () => {
        if (selectedTagToAdd) {
            const success = onAddTag(selectedTagToAdd);
            if (success) {
                setSelectedTagToAdd(""); 
                setIsTagModalOpen(false);
            }
            // Toast is handled by parent or onAddTag callback
        }
      };

  return (
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-start">
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium text-muted-foreground"><Tags className="mr-2 h-4 w-4" />Etiquetas</Label>
              <div className="flex flex-wrap gap-1">
                {etiquetas && etiquetas.length > 0 ? etiquetas.map(tag => <Badge key={`${patientId}-tag-${tag}`} variant="secondary">{tag}</Badge>) : <Badge variant="outline">Sin etiquetas</Badge>}
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
                                {mockEtiquetas.filter(tag => !(etiquetas || []).includes(tag)).map(tag => (
                                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTagModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" onClick={handleInternalAddTag} disabled={!selectedTagToAdd}>Agregar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`notas-paciente-${patientId}`} className="flex items-center text-sm font-medium text-muted-foreground"><FileText className="mr-2 h-4 w-4" />Notas</Label>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea id={`notas-paciente-edit-${patientId}`} placeholder="Escribe aquí..." value={editingNotesText} onChange={(e) => setEditingNotesText(e.target.value)} rows={4} className="text-sm"/>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleInternalCancelEditNotes}><X className="mr-1 h-3 w-3"/>Cancelar</Button>
                    <Button size="sm" onClick={handleInternalSaveNotes}><Save className="mr-1 h-3 w-3"/>Guardar</Button>
                  </div>
                </div>
              ) : (
                <Card onClick={() => { setEditingNotesText(notas === "Sin notas registradas." ? "" : notas); setIsEditingNotes(true);}} className="p-3 min-h-[80px] cursor-pointer hover:bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{notas || "Clic para agregar notas..."}</p>
                </Card>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium text-muted-foreground"><AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />Salud General</Label>
              <div>
                <h4 className="font-medium text-xs text-foreground mb-1">Enfermedades:</h4>
                {enfermedades && enfermedades.length > 0 ? enfermedades.map(enf => <Badge key={`${patientId}-enf-${enf}`} variant="outline" className="border-orange-500 text-orange-600 mr-1 mb-1">{enf}</Badge>) : <Badge variant="outline" className="font-normal">Sin enfermedades registradas</Badge>}
              </div>
              <div className="mt-2">
                <h4 className="font-medium text-xs text-foreground mb-1">Alergias:</h4>
                {alergias && alergias.length > 0 ? alergias.map(alergia => <Badge key={`${patientId}-alergia-${alergia}`} variant="outline" className="border-red-500 text-red-600 mr-1 mb-1">{alergia}</Badge>) : <Badge variant="outline" className="font-normal">Sin alergias registradas</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
  );
}
