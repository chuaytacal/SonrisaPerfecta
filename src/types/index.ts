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

export type EtiquetaPaciente =
  | "Alergia a Penicilina"
  | "Diabético"
  | "Menor de Edad"
  | "Fumador"
  | "Hipertenso"
  | "Covid+"
  | "Postquirúrgico"
  | "Anciano"
  | "Nuevo Tag Ejemplo"; // Added for testing tag functionality

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
export interface Paciente {
  id: string;
  idPersona: string;
  persona: Persona;
  fechaIngreso: string; // "DD/MM/YYYY"
  estado: "Activo" | "Inactivo";
  etiquetas: EtiquetaPaciente[];
  notas?: string;
  antecedentesMedicos?: AntecedentesMedicosData;
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
