import type { 
  BackendPresupuesto, 
  BackendItemPresupuesto, 
  BackendProcedimiento,
  BackendEspecialista,
  Presupuesto, 
  ItemPresupuesto, 
  Procedimiento,
  Personal,
  Persona
} from '@/types';

export function transformBackendProcedimientoToFrontend(backendProc: BackendProcedimiento): Procedimiento {
  return {
    id: backendProc.uuid,
    denominacion: backendProc.denominacion,
    descripcion: backendProc.descripcion,
    precioBase: parseFloat(backendProc.precioBase)
  };
}

export function transformBackendItemToFrontend(backendItem: BackendItemPresupuesto): ItemPresupuesto {
  return {
    id: backendItem.uuid,
    procedimiento: transformBackendProcedimientoToFrontend(backendItem.procedure),
    cantidad: backendItem.cantidad,
    montoPagado: backendItem.montoPagado
  };
}

export function transformBackendEspecialistaToPersonal(backendEspecialista: BackendEspecialista): Personal {
  const persona: Persona = {
    id: backendEspecialista.persona.uuid,
    tipoDocumento: backendEspecialista.persona.tipoDocumento,
    numeroDocumento: backendEspecialista.persona.numeroDocumento,
    nombre: backendEspecialista.persona.nombre,
    apellidoPaterno: backendEspecialista.persona.apellidoPaterno,
    apellidoMaterno: backendEspecialista.persona.apellidoMaterno,
    fechaNacimiento: new Date(backendEspecialista.persona.fechaNacimiento),
    sexo: backendEspecialista.persona.sexo,
    direccion: backendEspecialista.persona.direccion,
    telefono: backendEspecialista.persona.telefono,
    email: '' // Not provided in backend response
  };

  return {
    id: backendEspecialista.uuid,
    idPersona: backendEspecialista.persona.uuid,
    persona: persona,
    fechaIngreso: backendEspecialista.fechaIngreso,
    estado: "Activo" // Assuming active since isActive is true
  };
}

export function transformBackendPresupuestoToFrontend(backendPresupuesto: BackendPresupuesto): Presupuesto {
  const transformedItems = backendPresupuesto.items.map(transformBackendItemToFrontend);
  const montoPagado = transformedItems.reduce((total, item) => total + item.montoPagado, 0);

  return {
    id: backendPresupuesto.uuid,
    idHistoriaClinica: '', // This might need to be provided by parent component or API
    nombre: backendPresupuesto.nombre,
    fechaCreacion: new Date(backendPresupuesto.createdAt),
    fechaAtencion: new Date(backendPresupuesto.createdAt), // Using createdAt as fechaAtencion since not provided
    estado: backendPresupuesto.estado,
    items: transformedItems,
    montoPagado: montoPagado,
    doctorResponsableId: backendPresupuesto.especialista.uuid,
    nota: backendPresupuesto.nota
  };
}
