import type { MotivoCita, Procedimiento, Paciente, Personal } from '@/types';

export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  
  // Linked data
  paciente?: Paciente;
  doctor?: Personal;
  motivoCita?: MotivoCita;
  procedimientos?: Procedimiento[];

  // Raw data, can also be stored for reference
  idPaciente: string;
  idDoctor: string;
  idMotivoCita: string;

  // Additional fields
  estado?: 'Confirmada' | 'Pendiente' | 'Cancelada';
  notas?: string;
  eventColor?: string;
}

export interface AppointmentFormData {
  idPaciente: string;
  idDoctor: string;
  idMotivoCita: string;
  
  fecha: Date;
  horaInicio: string; // e.g., "09:30"
  duracion: number; // in minutes

  procedimientos: Procedimiento[];
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
  notas: string;
}
