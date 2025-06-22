
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle2,
  Ban,
  Clock,
  User,
  MessageSquare,
  Calendar,
  Trash2,
  ClipboardCheck,
  MoreVertical
} from 'lucide-react';
import type { Appointment, AppointmentState } from '@/types/calendar';
import { format } from 'date-fns';

interface AppointmentPopoverContentProps {
  appointment: Appointment;
  onUpdateState: (newState: AppointmentState) => void;
  onEdit: () => void;
  onReschedule: () => void;
  onDelete: () => void;
  onViewPatient: (patientId: string) => void;
}

export function AppointmentPopoverContent({
  appointment,
  onUpdateState,
  onEdit,
  onReschedule,
  onDelete,
  onViewPatient,
}: AppointmentPopoverContentProps) {
  if (!appointment) return null;

  const stateActions = [
    { state: 'Confirmada', label: 'Confirmado', icon: CheckCircle2, className: 'text-purple-600' },
    { state: 'Cancelada', label: 'Cancelado', icon: Ban, className: 'text-red-600' },
    { state: 'Atendido', label: 'Atendido', icon: ClipboardCheck, className: 'text-green-600' },
  ] as const;

  return (
    <div className="flex flex-col">
      {/* State Management Section */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-1">
           {stateActions.map(({ state, label, icon: Icon, className }) => (
                <Button key={state} variant="ghost" size="sm" className={`flex-col h-auto px-2 py-1 hover:bg-muted ${className}`} onClick={() => onUpdateState(state)} disabled={appointment.estado === state}>
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{label}</span>
                </Button>
            ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem key="Pendiente" onClick={() => onUpdateState('Pendiente')} disabled={appointment.estado === 'Pendiente'}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Pendiente</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Appointment Summary */}
      <button className="text-left w-full hover:bg-muted p-3" onClick={onEdit}>
        <p className="font-semibold text-sm">{appointment.paciente?.persona.nombre} {appointment.paciente?.persona.apellidoPaterno}</p>
        <p className="text-xs text-muted-foreground">
          {format(appointment.start, 'HH:mm')} - {format(appointment.end, 'HH:mm')}
        </p>
        <p className="text-xs text-muted-foreground">Motivo: {appointment.motivoCita?.nombre}</p>
      </button>

      <Separator />

      {/* Action List */}
      <div className="flex flex-col p-1">
        <Button variant="ghost" className="justify-start px-2 text-foreground hover:bg-muted hover:text-foreground" onClick={() => window.open(`https://wa.me/${appointment.paciente?.persona.telefono}`, '_blank')}>
          <MessageSquare className="mr-2 h-4 w-4" /> Enviar recordatorio
        </Button>
        <Button variant="ghost" className="justify-start px-2 text-foreground hover:bg-muted hover:text-foreground" onClick={() => onViewPatient(appointment.idPaciente)}>
          <User className="mr-2 h-4 w-4" /> Datos del paciente
        </Button>
        <Button variant="ghost" className="justify-start px-2 text-foreground hover:bg-muted hover:text-foreground" onClick={onReschedule}>
          <Calendar className="mr-2 h-4 w-4" /> Reprogramar cita
        </Button>
        <Button variant="ghost" className="justify-start px-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar cita
        </Button>
      </div>
    </div>
  );
}
