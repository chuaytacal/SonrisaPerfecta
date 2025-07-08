

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
  email?: string;
  uuid?: string;
  isActive?: boolean;
  createdAt?: any;
}

export type Rol = 'Administrador' | 'Doctor' | 'Secretaria';

export interface Usuario {
  id?: string;
  usuario?: string;
  contrasena?: string;
  rol?: Rol;
  idPersonal?: string;
  email?: string;
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
  q11_motivoConsulta?: string;
}

export type EstadoPresupuesto = 'Creado' | 'Pagado' | 'Cancelado';

// Backend API response types
export interface BackendProcedimiento {
  id: number;
  isActive: boolean;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  denominacion: string;
  descripcion: string;
  precioBase: string;
}

export interface BackendItemPresupuesto {
  id: number;
  isActive: boolean;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  procedure: BackendProcedimiento;
  montoPagado: number;
}

export interface BackendPersona {
  id: number;
  isActive: boolean;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  sexo: Sexo;
  direccion: string;
  telefono: string;
}

export interface BackendEspecialista {
  id: number;
  isActive: boolean;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  fechaIngreso: string;
  persona: BackendPersona;
}

export interface BackendPresupuesto {
  id: number;
  isActive: boolean;
  uuid: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  nombre: string;
  codigo: string;
  estado: EstadoPresupuesto;
  nota: string;
  especialista: BackendEspecialista;
  items: BackendItemPresupuesto[];
}

// Frontend types (existing structure)
export interface ItemPresupuesto {
  id: string;
  procedimiento: Procedimiento;
  cantidad: number;
  comentario?: string;
  montoPagado: number;
}

export interface HistoriaClinica {
  id: string;
  idPaciente: string;
  idApoderado?: string;
}

export interface Presupuesto {
  id: string;
  idHistoriaClinica: string;
  idCita?: string;
  nombre: string;
  fechaCreacion: Date;
  fechaAtencion: Date;
  estado: EstadoPresupuesto;
  items: ItemPresupuesto[];
  montoPagado: number;
  doctorResponsableId?: string;
  nota?: string;
}

export interface HistorialOdontograma {
  id: string;
  fechaCreacion: Date;
  odontogramaPermanente: DientesMap;
  odontogramaPrimaria: DientesMap;
}

export interface Paciente {
  id: string;
  idPersona: string;
  persona: Persona;
  idHistoriaClinica: string;
  fechaIngreso: string; // "DD/MM/YYYY"
  estado: "Activo" | "Inactivo";
  etiquetas: EtiquetaPaciente[];
  avatarUrl?: string;
  notas?: string;
  antecedentesMedicos?: AntecedentesMedicosData;
  idApoderado?: string;
  odontogramaPermanente?: DientesMap;
  odontogramaPrimaria?: DientesMap;
  historialOdontogramas?: HistorialOdontograma[];
}

export interface Procedimiento {
  id: string;
  denominacion: string;
  descripcion: string;
  precioBase: number;
}

export interface MotivoCita {
  id: string;
  name: string;
  description?: string; // Optional field for additional details
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
  isActive?: boolean;
  estado?: "Activo" | "Inactivo";
  uuidUser?: string;
  email?: string;
  avatarUrl?: string; // Específico del rol de personal
  especialidad?: string;
  idUsuario?: string;
  usuario?: Usuario;
  rol?: string;
};

export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Otro';
export type TipoComprobante = 'Boleta' | 'Factura' | 'Otro' | 'Recibo';

export interface Pago {
  id: string;
  fechaPago: Date;
  montoTotal: number;
  metodoPago: MetodoPago;
  tipoComprobante: TipoComprobante;
  doctorResponsableId: string;
  descripcion: string;
  estado: 'activo' | 'desactivo';
  itemsPagados: {
    idPresupuesto: string;
    idItem: string;
    monto: number;
    concepto: string;
  }[];
  uuidPaciente: string;
}
