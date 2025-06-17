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
  // avatarUrl podría estar aquí si es general para la persona
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