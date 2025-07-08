
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
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface SelectPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (persona: Persona) => void;
  onCreateNewPersona: () => void;
  existingPersonas: Persona[];
  modalTitle?: string;
  modalDescription?: string;
  createButtonLabel?: string;
}

export function SelectPersonaModal({
  isOpen,
  onClose,
  onSelectPersona,
  onCreateNewPersona,
  existingPersonas,
  modalTitle = "Buscar Persona",
  modalDescription = "Busca una persona existente o crea una nueva para asignarle un rol.",
  createButtonLabel = "Crear Nueva Persona",
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
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {modalDescription}
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
          <div className="overflow-x-auto px-6">
            <Table className="min-w-[500px] sm:min-w-full"><TableHeader className="sticky top-0 bg-muted/50 z-10">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Documento</TableHead>
                  <TableHead className="whitespace-nowrap">Nombre Completo</TableHead>
                  <TableHead className="whitespace-nowrap">Teléfono</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Acción</TableHead>
                </TableRow>
              </TableHeader><TableBody>
                {filteredPersonas.length > 0 ? (
                  filteredPersonas.map((persona) => (
                    <TableRow key={`${persona.id}-${persona.numeroDocumento}`}>
                      <TableCell className="whitespace-nowrap">{persona.tipoDocumento}: {persona.numeroDocumento}</TableCell>
                      <TableCell className="whitespace-nowrap">{`${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {(() => {
                            const phone = persona.telefono;
                            if (!phone) return <span>N/A</span>;
                            try {
                                const phoneNumber = parsePhoneNumberFromString(phone);
                                if (phoneNumber) {
                                    return <span><span className="text-muted-foreground">{`+${phoneNumber.countryCallingCode}`}</span> {phoneNumber.nationalNumber}</span>
                                }
                            } catch (error) {}
                            return <span>{phone}</span>;
                        })()}
                      </TableCell>
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
              </TableBody></Table>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <Button variant="default" onClick={onCreateNewPersona} className="w-full sm:w-auto">
            {createButtonLabel}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
