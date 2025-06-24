
import type { DientesMap } from "@/components/odontograma/setting";

export type TipoDocumento = "DNI" | "EXTRANJERIA" | "PASAPORTE";
export type Sexo = "M" | "F";

export interface Persona {
  id: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: Date;
  sexo: Sexo;
  direccion: string;
  telefono: string;
  email: string;
}

export type EtiquetaPaciente = string;

export interface AntecedentesMedicosData {
  q1_hospitalizado?: "Sí" | "No" | string;
  q1_porque?: string;
  q1_donde?: string;
  q2_atencionMedica?: "Sí" | "No" | string;
  q2_porque?: string;
  q2_donde?: string;
  q3_alergico?: "Sí" | "No" | string;
  q3_cuales?: string;
  q4_hemorragia?: "Sí" | "No" | string;
  q5_enfermedades?: string[];
  q6_otraEnfermedad?: "Sí" | "No" | string;
  q6_cual?: string;
  q7_medicacionActual?: "Sí" | "No" | string;
  q7_cual?: string;
  q8_embarazada?: "Sí" | "No" | string;
  q8_semanas?: string;
  q9_hipertenso?: "Sí" | "No" | string;
  q10_ultimaConsultaDental?: string;
}

export type EstadoPresupuesto = 'Creado' | 'Aprobado' | 'Rechazado' | 'Terminado';

export interface ItemPresupuesto {
  id: string;
  procedimiento: Procedimiento;
  cantidad: number;
  comentario?: string;
}

export interface Presupuesto {
  id: string;
  idPaciente: string;
  nombre: string;
  fechaCreacion: Date;
  estado: EstadoPresupuesto;
  items: ItemPresupuesto[];
  montoPagado: number;
}


export interface Paciente {
  id: string;
  idPersona: string;
  persona: Persona;
  fechaIngreso: string; // "DD/MM/YYYY"
  estado: "Activo" | "Inactivo";
  etiquetas: EtiquetaPaciente[];
  notas?: string;
  antecedentesMedicos?: AntecedentesMedicosData;
  idApoderado?: string;
  odontogramaPermanente?: DientesMap;
  odontogramaPrimaria?: DientesMap;
  presupuestos?: Presupuesto[];
}

export interface Procedimiento {
  id: string;
  denominacion: string;
  descripcion: string;
  precioBase: number;
}

export interface MotivoCita {
  id: string;
  nombre: string;
}


export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price?: string;
  icon?: React.ElementType;
}

export type ServiceCategory = 'Preventivo' | 'Restaurador' | 'Cosmético';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  bio: string;
}

export interface TimeSlot {
  id: string;
  time: string; // e.g., "09:00 AM"
}

// Representa la tabla 'especialista' que es el Personal
export type Personal = {
  id: string; // ID del registro de Personal/Especialista
  idPersona: string; // FK a la tabla Persona
  persona: Persona; // Datos de la persona anidados
  fechaIngreso: string; // "DD/MM/YYYY" - Fecha de ingreso como personal
  estado: "Activo" | "Inactivo";
  avatarUrl?: string; // Específico del rol de personal
};
