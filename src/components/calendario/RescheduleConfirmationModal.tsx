
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RescheduleConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  originalAppointment: Appointment;
  newAppointmentDetails: RescheduleData & { doctor: Personal };
  shouldDelete: boolean;
  onShouldDeleteChange: (checked: boolean) => void;
}

const DetailRow = ({ icon, label, value, isStrikethrough = false }: { icon: React.ElementType, label: string, value: string, isStrikethrough?: boolean }) => {
    const Icon = icon;
    return (
        <div className="flex items-start text-sm">
            <Icon className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
            <div className="flex flex-col items-start">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-medium ${isStrikethrough ? 'line-through' : ''}`}>{value}</span>
            </div>
        </div>
    );
};

export function RescheduleConfirmationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  originalAppointment,
  newAppointmentDetails,
  shouldDelete,
  onShouldDeleteChange,
}: RescheduleConfirmationModalProps) {

  const { newDate, newTime, doctor: newDoctor } = newAppointmentDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Confirmar Reprogramación</DialogTitle>
          <DialogDescription>
            Revise los cambios y confirme la reprogramación de la cita para <span className="font-semibold">{originalAppointment.paciente?.persona.nombre} {originalAppointment.paciente?.persona.apellidoPaterno}</span>.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="my-4 px-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-stretch gap-4">
              {/* Cita Original */}
              <div className="flex flex-col space-y-3 rounded-lg border p-4">
                  <h3 className="font-semibold text-lg text-center">Cita Original</h3>
                  <Separator />
                  <div className="space-y-3 text-left">
                    <Badge variant="outline">Reprogramada</Badge>
                    <DetailRow icon={Calendar} label="Fecha" value={format(originalAppointment.start, "EEEE, d 'de' MMMM", { locale: es })} isStrikethrough />
                    <DetailRow icon={Clock} label="Hora" value={format(originalAppointment.start, "HH:mm a")} isStrikethrough />
                    <DetailRow icon={User} label="Doctor" value={`${originalAppointment.doctor?.persona.nombre} ${originalAppointment.doctor?.persona.apellidoPaterno}`} isStrikethrough />
                  </div>
                   <div className="!mt-auto pt-4 flex items-center space-x-2">
                      <Switch id="delete-original-switch" checked={shouldDelete} onCheckedChange={onShouldDeleteChange} />
                      <Label htmlFor="delete-original-switch" className="text-sm font-medium text-foreground">Cancelar cita original</Label>
                  </div>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block self-center"/>

              {/* Cita Nueva */}
              <div className="flex flex-col space-y-3 rounded-lg border bg-secondary/50 p-4">
                  <h3 className="font-semibold text-lg text-primary text-center">Cita Nueva</h3>
                  <Separator />
                  <div className="space-y-3 text-left">
                    <Badge>Pendiente</Badge>
                    <DetailRow icon={Calendar} label="Fecha" value={format(newDate, "EEEE, d 'de' MMMM", { locale: es })} />
                    <DetailRow icon={Clock} label="Hora" value={newTime} />
                    <DetailRow icon={User} label="Doctor" value={`${newDoctor.persona.nombre} ${newDoctor.persona.apellidoPaterno}`} />
                  </div>
              </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t flex-col-reverse sm:flex-row sm:justify-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={onConfirm} variant={shouldDelete ? 'destructive' : 'default'}>
                {shouldDelete ? 'Confirmar Cancelación' : 'Guardar Cambios'}
              </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
