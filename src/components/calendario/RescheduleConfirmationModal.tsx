
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Appointment, RescheduleData } from '@/types/calendar';
import type { Personal } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, ArrowRight, Trash2 } from 'lucide-react';

interface RescheduleConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onDelete: () => void;
  originalAppointment: Appointment;
  newAppointmentDetails: RescheduleData & { doctor: Personal };
}

const DetailRow = ({ icon, label, value }: { icon: React.ElementType, label: string, value: string }) => {
    const Icon = icon;
    return (
        <div className="flex items-start text-sm">
            <Icon className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
            <div className="flex flex-col">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
        </div>
    );
};

export function RescheduleConfirmationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  onDelete,
  originalAppointment,
  newAppointmentDetails,
}: RescheduleConfirmationModalProps) {

  const { newDate, newTime, doctor: newDoctor } = newAppointmentDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar Reprogramación</DialogTitle>
          <DialogDescription>
            Revise los cambios y confirme la reprogramación de la cita para <span className="font-semibold">{originalAppointment.paciente?.persona.nombre} {originalAppointment.paciente?.persona.apellidoPaterno}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
            {/* Cita Original */}
            <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold text-lg">Cita Original</h3>
                <Separator />
                <DetailRow icon={Calendar} label="Fecha" value={format(originalAppointment.start, "EEEE, d 'de' MMMM", { locale: es })} />
                <DetailRow icon={Clock} label="Hora" value={format(originalAppointment.start, "HH:mm a")} />
                <DetailRow icon={User} label="Doctor" value={`${originalAppointment.doctor?.persona.nombre} ${originalAppointment.doctor?.persona.apellidoPaterno}`} />
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block"/>

            {/* Cita Nueva */}
            <div className="space-y-3 rounded-lg border bg-secondary/50 p-4">
                <h3 className="font-semibold text-lg text-primary">Cita Nueva</h3>
                <Separator />
                <DetailRow icon={Calendar} label="Fecha" value={format(newDate, "EEEE, d 'de' MMMM", { locale: es })} />
                <DetailRow icon={Clock} label="Hora" value={newTime} />
                <DetailRow icon={User} label="Doctor" value={`${newDoctor.persona.nombre} ${newDoctor.persona.apellidoPaterno}`} />
            </div>
        </div>
        
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between pt-4">
          <Button variant="ghost" className="text-destructive hover:text-destructive w-full sm:w-auto justify-start sm:justify-center" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cita Original
          </Button>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onConfirm}>Guardar Cambios</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


    