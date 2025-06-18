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
  email: string; // Email remains in Persona, but might not be shown in all forms
}

export type EtiquetaPaciente =
  | "Alergia a Penicilina"
  | "Diabético"
  | "Menor de Edad"
  | "Fumador"
  | "Hipertenso"
  | "Covid+"
  | "Postquirúrgico"
  | "Anciano";

export interface Paciente {
  id: string; // ID del registro de Paciente
  idPersona: string; // FK a la tabla Persona
  persona: Persona; // Datos de la persona anidados
  fechaIngreso: string; // "DD/MM/YYYY" - Fecha de ingreso como paciente
  estado: "Activo" | "Inactivo";
  etiquetas: EtiquetaPaciente[];
  // avatarUrl?: string; // Pacientes typically don't have a separate avatar from Persona
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
