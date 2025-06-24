
import type { MotivoCita, Procedimiento, Persona, Paciente, Personal, AntecedentesMedicosData, Presupuesto, ItemPresupuesto, Pago } from '@/types';
import type { Appointment } from '@/types/calendar';
import { addDays, setHours, setMinutes } from 'date-fns';
import type { DientesMap } from '@/components/odontograma/setting';

// Mock data for Personas (can be shared or fetched)
export const mockPersonasData: Persona[] = [ 
  { id: "persona-1", tipoDocumento: "DNI", numeroDocumento: "73124568", nombre: "Joe", apellidoPaterno: "Schilder", apellidoMaterno: "Mann", fechaNacimiento: new Date("1985-05-15"), sexo: "M", direccion: "Av. Siempre Viva 123", telefono: "+51943567821", email: "joe.schilder@example.com" },
  { id: "persona-2", tipoDocumento: "DNI", numeroDocumento: "18273645", nombre: "Phoebe", apellidoPaterno: "Venturi", apellidoMaterno: "Ross", fechaNacimiento: new Date("1990-08-22"), sexo: "F", direccion: "Calle Falsa 456", telefono: "+51981234670", email: "phoebe.venturi@example.com" },
  { id: "persona-3", tipoDocumento: "DNI", numeroDocumento: "49205873", nombre: "Caroline", apellidoPaterno: "Pandolfi", apellidoMaterno: "Geller", fechaNacimiento: new Date("1988-11-30"), sexo: "F", direccion: "Jr. Desconocido 789", telefono: "+51967891234", email: "caroline.pandolfi@example.com" },
  { id: "persona-4", tipoDocumento: "DNI", numeroDocumento: "50938472", nombre: "Ricardo", apellidoPaterno: "Marchetti", apellidoMaterno: "Tribbiani", fechaNacimiento: new Date("1992-03-10"), sexo: "M", direccion: "Pje. Oculto 101", telefono: "+51935648290", email: "ricardo.marchetti@example.com" },
  { id: "persona-5", tipoDocumento: "EXTRANJERIA", numeroDocumento: "X6349275", nombre: "Dorothy", apellidoPaterno: "Hussain", apellidoMaterno: "Bing", fechaNacimiento: new Date("1980-07-01"), sexo: "F", direccion: "Av. Central 202", telefono: "+14155552671", email: "dorothy.hussain@example.com" },
  { id: "persona-6", tipoDocumento: "PASAPORTE", numeroDocumento: "P2107384", nombre: "Eleanor", apellidoPaterno: "Mann", apellidoMaterno: "Buffay", fechaNacimiento: new Date("1995-01-20"), sexo: "F", direccion: "Calle Sol 303", telefono: "+442079460958", email: "eleanor.mann@example.com" },
  { id: "persona-7", tipoDocumento: "DNI", numeroDocumento: "85017429", nombre: "Nina", apellidoPaterno: "Francini", apellidoMaterno: "Green", fechaNacimiento: new Date("1989-09-05"), sexo: "F", direccion: "Av. Luna 404", telefono: "+51975320461", email: "nina.francini@example.com" },
  { id: "persona-8", tipoDocumento: "DNI", numeroDocumento: "76309152", nombre: "Caroline", apellidoPaterno: "Mallet", apellidoMaterno: "Peralta", fechaNacimiento: new Date("1993-12-12"), sexo: "F", direccion: "Jr. Estrella 505", telefono: "+51928547103", email: "caroline.mallet@example.com" },
  { id: "persona-p1", tipoDocumento: "DNI", numeroDocumento: "76543210", nombre: "Mario", apellidoPaterno: "Bros", apellidoMaterno: "Nintendo", fechaNacimiento: new Date("1983-07-09"), sexo: "M", direccion: "Mushroom Kingdom", telefono: "+51912345678", email: "mario@example.com" },
  { id: "persona-p2", tipoDocumento: "EXTRANJERIA", numeroDocumento: "X1234567", nombre: "Luigi", apellidoPaterno: "Bros", apellidoMaterno: "Nintendo", fechaNacimiento: new Date("2015-04-10"), sexo: "M", direccion: "Mushroom Kingdom", telefono: "+51987654321", email: "luigi@example.com" },
  { id: "persona-g1", tipoDocumento: "DNI", numeroDocumento: "29876543", nombre: "Peach", apellidoPaterno: "Toadstool", apellidoMaterno: "Mushroom", fechaNacimiento: new Date("1985-11-18"), sexo: "F", direccion: "Mushroom Castle", telefono: "+51999888777", email: "peach@example.com" },
];

export let mockPersonalData: Personal[] = [
  {
    id: "personal-1",
    idPersona: "persona-1",
    persona: mockPersonasData.find(p => p.id === "persona-1")!,
    fechaIngreso: "17/02/2023",
    estado: "Inactivo",
    avatarUrl: "https://placehold.co/40x40.png?text=JS",
  },
  {
    id: "personal-2",
    idPersona: "persona-2",
    persona: mockPersonasData.find(p => p.id === "persona-2")!,
    fechaIngreso: "05/07/2023",
    estado: "Activo",
    avatarUrl: "https://placehold.co/40x40.png?text=PV",
  },
  {
    id: "personal-3",
    idPersona: "persona-3",
    persona: mockPersonasData.find(p => p.id === "persona-3")!,
    fechaIngreso: "11/10/2023",
    estado: "Activo",
    avatarUrl: "https://placehold.co/40x40.png?text=CP",
  },
];

export const initialAntecedentesExample: AntecedentesMedicosData = {
  q1_hospitalizado: "No", q1_porque: "N/A", q1_donde: "N/A",
  q2_atencionMedica: "Sí", q2_porque: "Control de rutina", q2_donde: "Clínica Local",
  q3_alergico: "Sí", q3_cuales: "Penicilina",
  q4_hemorragia: "No",
  q5_enfermedades: ["Hipertensión arterial"],
  q6_otraEnfermedad: "No", q6_cual: "N/A",
  q7_medicacionActual: "Sí", q7_cual: "Losartán para la presión",
  q8_embarazada: "No", q8_semanas: "N/A",
  q9_hipertenso: "Sí",
  q10_ultimaConsultaDental: "Hace 6 meses",
};

const sampleOdontogramaPermanente: DientesMap = {
  18: {
    'FD': { tipo: 'FD', nombre: 'Fractura Dental', color: '#E40000', abreviatura: '' }
  },
  16: {
    'C': { tipo: 'C', nombre: 'Corona', color: '#0880D7', abreviatura: '', detalle: [{ abreviatura: 'CM', nombre: 'Corona Metálica' }] }
  },
  26: {
    'PDA': { tipo: 'PDA', nombre: 'Pieza Dentaria Ausente', color: '#0880D7', abreviatura: '' }
  }
};

export const mockMotivosCita: MotivoCita[] = [
  { id: 'mc-1', nombre: 'Primera consulta' },
  { id: 'mc-2', nombre: 'Tratamiento en curso' },
  { id: 'mc-3', nombre: 'Control ortodoncia' },
  { id: 'mc-4', nombre: 'Control de limpieza' },
  { id: 'mc-5', nombre: 'Endodoncia' },
  { id: 'mc-6', nombre: 'Revisión general' },
  { id: 'mc-7', nombre: 'Urgencia' },
];

export let mockProcedimientos: Procedimiento[] = [
  { id: 'proc-1', denominacion: 'Limpieza Dental Completa', descripcion: 'Profilaxis y destartraje supragingival.', precioBase: 150 },
  { id: 'proc-2', denominacion: 'Blanqueamiento Dental', descripcion: 'Tratamiento para aclarar el tono de los dientes.', precioBase: 500 },
  { id: 'proc-3', denominacion: 'Resina Compuesta (1 cara)', descripcion: 'Restauración de una superficie dental.', precioBase: 180 },
  { id: 'proc-4', denominacion: 'Resina Compuesta (2 caras)', descripcion: 'Restauración de dos superficies dentales.', precioBase: 250 },
  { id: 'proc-5', denominacion: 'Extracción Simple', descripcion: 'Extracción de pieza dental sin cirugía.', precioBase: 120 },
  { id: 'proc-6', denominacion: 'Endodoncia Unirradicular', descripcion: 'Tratamiento de conducto para diente de una raíz.', precioBase: 450 },
  { id: 'proc-7', denominacion: 'Corona de Porcelana', descripcion: 'Funda dental estética.', precioBase: 1200 },
  { id: 'proc-8', denominacion: 'Ortodoncia cuota inicial', descripcion: 'Pago inicial para tratamiento de ortodoncia.', precioBase: 800 },
  { id: 'proc-9', denominacion: 'Ortodoncia cuota mensual', descripcion: 'Pago mensual para tratamiento de ortodoncia.', precioBase: 200 },
];

export const mockEtiquetas: string[] = [
    "Alergia a Penicilina", "Diabético", "Menor de Edad", "Fumador", "Hipertenso", "Covid+", "Postquirúrgico", "Anciano", "Nuevo Tag Ejemplo"
];

export let mockPagosData: Pago[] = [
  {
    id: 'pago-inicial-1',
    idPaciente: 'paciente-1',
    fechaPago: new Date('2024-05-15T10:00:00Z'),
    montoTotal: 20,
    metodoPago: 'Efectivo',
    tipoComprobante: 'Boleta',
    doctorResponsableId: 'personal-2',
    descripcion: '(1) Limpieza Dental Completa',
    itemsPagados: [{
      idPresupuesto: 'presupuesto-1',
      idItem: 'item-1',
      monto: 20,
      concepto: 'Limpieza Dental Completa'
    }]
  },
  {
    id: 'pago-2',
    idPaciente: 'paciente-1',
    fechaPago: new Date('2024-06-20T11:00:00Z'),
    montoTotal: 120,
    metodoPago: 'Tarjeta',
    tipoComprobante: 'Factura',
    doctorResponsableId: 'personal-3',
    descripcion: '(1) Extracción Simple',
    itemsPagados: [{
      idPresupuesto: 'presupuesto-2',
      idItem: 'item-3',
      monto: 120,
      concepto: 'Extracción Simple'
    }]
  }
];

export let mockPresupuestosData: Presupuesto[] = [
    {
      id: 'presupuesto-1',
      idPaciente: 'paciente-1',
      nombre: 'Tratamiento Inicial',
      fechaCreacion: new Date('2024-05-15'),
      estado: 'Creado',
      montoPagado: 20,
      items: [
        { id: 'item-1', procedimiento: mockProcedimientos.find(p => p.id === 'proc-1')!, cantidad: 1, montoPagado: 20 },
        { id: 'item-2', procedimiento: mockProcedimientos.find(p => p.id === 'proc-3')!, cantidad: 1, montoPagado: 0 },
      ],
      doctorResponsableId: 'personal-2',
      nota: 'Presupuesto inicial para revisión y limpieza.',
    },
    {
      id: 'presupuesto-2',
      idPaciente: 'paciente-1',
      nombre: 'Control General',
      fechaCreacion: new Date('2024-06-20'),
      estado: 'Terminado',
      montoPagado: 120,
      items: [
        { id: 'item-3', procedimiento: mockProcedimientos.find(p => p.id === 'proc-5')!, cantidad: 1, montoPagado: 120 },
      ],
      doctorResponsableId: 'personal-3',
    },
];

export let mockPacientesData: Paciente[] = [ 
  {
    id: "paciente-1",
    idPersona: "persona-p1",
    persona: mockPersonasData.find(p => p.id === "persona-p1")!,
    fechaIngreso: "10/01/2024",
    estado: "Activo",
    etiquetas: ["Diabético", "Hipertenso"],
    notas: "Paciente refiere sensibilidad dental al frío. Programar revisión.",
    antecedentesMedicos: initialAntecedentesExample,
    odontogramaPermanente: sampleOdontogramaPermanente,
    odontogramaPrimaria: {},
    presupuestos: mockPresupuestosData.filter(p => p.idPaciente === "paciente-1"),
  },
  {
    id: "paciente-2",
    idPersona: "persona-p2",
    persona: mockPersonasData.find(p => p.id === "persona-p2")!,
    fechaIngreso: "15/03/2024",
    estado: "Activo",
    etiquetas: ["Menor de Edad"],
    notas: "Acompañado por su madre. Buena higiene bucal.",
    antecedentesMedicos: { ...initialAntecedentesExample, q3_alergico: "No", q3_cuales: "", q5_enfermedades: [] },
    idApoderado: "persona-g1",
    odontogramaPermanente: {},
    odontogramaPrimaria: {},
    presupuestos: [],
  },
  {
    id: "paciente-3",
    idPersona: "persona-3", 
    persona: mockPersonasData.find(p => p.id === "persona-3")!,
    fechaIngreso: "20/05/2023",
    estado: "Inactivo",
    etiquetas: ["Fumador", "Postquirúrgico"],
    notas: "Control post-extracción molar. Cita de seguimiento pendiente.",
    antecedentesMedicos: { ...initialAntecedentesExample, q8_embarazada: "Sí", q8_semanas: "12" },
    odontogramaPermanente: {},
    odontogramaPrimaria: {},
    presupuestos: [],
  }
];

// Moved from `calendario/page.tsx`
const generateInitialAppointments = (): Appointment[] => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const paciente1 = mockPacientesData[0];
  const doctor1 = mockPersonalData[1];
  const motivo1 = mockMotivosCita[0];

  const paciente2 = mockPacientesData[1];
  const doctor2 = mockPersonalData[2];
  const motivo2 = mockMotivosCita[2];
  
  return [
    {
      id: crypto.randomUUID(),
      title: `${motivo1.nombre} - ${paciente1.persona.nombre}`,
      start: setMinutes(setHours(today, 10), 0),
      end: setMinutes(setHours(today, 11), 0),
      idPaciente: paciente1.id,
      idDoctor: doctor1.id,
      paciente: paciente1,
      doctor: doctor1,
      idMotivoCita: motivo1.id,
      motivoCita: motivo1,
      estado: 'Confirmada',
      eventColor: 'hsl(var(--chart-1))',
      procedimientos: [mockProcedimientos[0]]
    },
    {
      id: crypto.randomUUID(),
      title: `${motivo2.nombre} - ${paciente2.persona.nombre}`,
      start: setMinutes(setHours(tomorrow, 14), 0),
      end: setMinutes(setHours(tomorrow, 15), 30),
      idPaciente: paciente2.id,
      idDoctor: doctor2.id,
      paciente: paciente2,
      doctor: doctor2,
      idMotivoCita: motivo2.id,
      motivoCita: motivo2,
      estado: 'Pendiente',
      eventColor: 'hsl(var(--chart-2))',
    }
  ];
};

// Export a mutable array to simulate a database
export let mockAppointmentsData: Appointment[] = generateInitialAppointments();
