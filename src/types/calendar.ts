
export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  paciente?: string; 
  doctor?: string; 
  tipoCita?: string;
  notas?: string; 
  eventColor?: string;
  allDay?: boolean;
}

export interface AppointmentFormData {
  title: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  paciente?: string;
  doctor?: string;
  tipoCita?: string;
  notas?: string;
  eventColor?: string;
}
