"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Persona } from '@/types';
import { Search } from 'lucide-react';

interface SelectPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (persona: Persona) => void;
  onCreateNewPersona: () => void;
  existingPersonas: Persona[];
}

export function SelectPersonaModal({
  isOpen,
  onClose,
  onSelectPersona,
  onCreateNewPersona,
  existingPersonas,
}: SelectPersonaModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersonas = useMemo(() => {
    if (!searchTerm) {
      return existingPersonas;
    }
    return existingPersonas.filter(persona =>
      `${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [existingPersonas, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Buscar Persona</DialogTitle>
          <DialogDescription>
            Busca una persona por DNI o nombre completo para asignarle un rol de personal, o crea una nueva.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
        <ScrollArea className="h-[40vh] md:h-[50vh] border-t border-b">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonas.length > 0 ? (
                filteredPersonas.map((persona) => (
                  <TableRow key={persona.id}>
                    <TableCell>{persona.tipoDocumento}: {persona.numeroDocumento}</TableCell>
                    <TableCell>{`${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</TableCell>
                    <TableCell>{persona.telefono}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => onSelectPersona(persona)}>
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No se encontraron personas. Puede crear una nueva.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter className="p-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <Button variant="outline" onClick={onCreateNewPersona} className="w-full sm:w-auto">
            Crear Persona y Asignar como Personal
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}