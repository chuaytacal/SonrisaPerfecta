import type { Procedimiento } from "@/types";

export type DientesMap = {
  [diente: string]: {
    [superficie: string]: {
      nombre: string;
      color?: string;
      servicios?: any[];
    };
  };
};

export type OdontogramDataItem = {
  diente: number | number[];
  hallazgo: Omit<Hallazgo, "grupo" | "servicios">;
  nota: string;
  servicios: Procedimiento[];
};

export type Hallazgo = {
  tipo: any;
  abreviatura: any;
  color: string;
  nombre: string;
  cara?: Record<string, HallazgoCaraCurrent>; // Changed to Record
  detalle?: DetalleHallazgo[];
  grupo?: number[];
  direccion?: any;
  servicios?: Procedimiento[];
};

export type DetalleHallazgo = {
  abreviatura: any;
  nombre: string;
};

export type HallazgosPorDiente = {
  [tipo: string]: Hallazgo;
};

export type HallazgoCaraCurrent = {
  tipo: any;
  abreviatura: any;
  color: string;
  nombre: string;
  detalle?: DetalleHallazgo;
};
export type CurrentMode = {
  position: number;
  color: string;
  detalle: number;
  direccion?: any;
  caras: Record<string, HallazgoCaraCurrent>; // Changed from 'cara'
  activeDetail: DetalleHallazgo | null; // Added for brush functionality
};

export type ToothDisplays = {
  abreviatura: any;
  color: any;
};

export type OpenModeal = {
  selectedTooth: any;
  code: any;
  group?: any[];
  detalle?: any[];
  to: "toConfirmDelGroup" | "toToothFace" | "";
};

export const Hallazgos = [
  {
    tipo: "AOF",
    abreviatura: "",
    nombre: "Aparato Ortodóntico Fijo",
    color: "",
    detalle: [],
  },
  {
    tipo: "AOR",
    abreviatura: "",
    nombre: "Aparato Ortodóntico Removible",
    color: "",
    detalle: [],
  },
  {
    tipo: "C",
    abreviatura: "",
    nombre: "Corona",
    color: "",
    detalle: [
      { tipo: "CM", nombre: "Corona Metálica" },
      { tipo: "CF", nombre: "Corona Fenestrada" },
      { tipo: "CMC", nombre: "Corona Metal Cerámica" },
      { tipo: "CV", nombre: "Corona Veneer" },
      { tipo: "CLM", nombre: "Corona Line de Metal" },
    ],
  },
  {
    tipo: "CT",
    abreviatura: "CT",
    nombre: "Corona Temporal",
    color: "#E40000",
    detalle: [],
  },
  {
    tipo: "DDE",
    abreviatura: "DDE",
    nombre: "Defectos de Desarrollo del Esmalte",
    color: "#E40000",
    detalle: [
      { tipo: "O", nombre: "Opacidades del esmalte" },
      { tipo: "PE", nombre: "Pigmentacion del Esmalte" },
      { tipo: "F", nombre: "Fluorosis" },
    ],
  },
  {
    tipo: "D",
    abreviatura: "",
    nombre: "Diastema",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "ET",
    abreviatura: "",
    nombre: "Edentulo Total",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "M",
    abreviatura: "",
    nombre: "Espigo/Muñon",
    color: "",
    detalle: [],
  },
  {
    tipo: "FFP",
    abreviatura: "FFP",
    nombre: "Fosas y Fisuras Profundas",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "FD",
    abreviatura: "",
    nombre: "Fractura Dental",
    color: "#E40000",
    detalle: [],
  },
  {
    tipo: "F",
    abreviatura: "",
    nombre: "Fusion",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "GE",
    abreviatura: "",
    nombre: "Geminacion",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "GI",
    abreviatura: "",
    nombre: "Giroversion",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "I",
    abreviatura: "I",
    nombre: "Impactacion",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "ID",
    abreviatura: "IMP",
    nombre: "Implante Dental",
    color: "",
    detalle: [],
  },
  {
    tipo: "LCD",
    abreviatura: "",
    nombre: "Caries",
    color: "#E40000",
    detalle: [
      { tipo: "MB", nombre: "Mancha Blanca" },
      { tipo: "CE", nombre: "Lesion de Caries Dental a Nivel del Esmalte" },
      { tipo: "CD", nombre: "Lesion de Caries Dental a Nivel del Dentina" },
      {
        tipo: "CDP",
        nombre:
          "Lesion de Caries Dental a Nivel del Dentina/compromiso de la pulpa",
      },
    ],
  },
  {
    tipo: "MA",
    abreviatura: "MAC",
    nombre: "Macrodoncia",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "MI",
    abreviatura: "MIC",
    nombre: "Microdoncia",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "MP",
    abreviatura: "M",
    nombre: "Movilidad Patologica",
    color: "#E40000",
    detalle: [],
  },
  {
    tipo: "PDA",
    abreviatura: "",
    nombre: "Pieza Dentaria Ausente",
    color: "#0880D7",
    detalle: [
      { tipo: "DNE", nombre: "Diente no Erupcionado" },
      {
        tipo: "DEX",
        nombre: "Diente ausente por extracion debido a experiencia",
      },
      {
        tipo: "DAO",
        nombre:
          "Diente ausente por otras razones que no tienen relacion a experiencia",
      },
    ],
  },
  {
    tipo: "PDCL",
    abreviatura: "",
    nombre: "Pieza Dentaria en Clavija",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "E",
    abreviatura: "E",
    nombre: "Pieza Dentaria Ectopica",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "PDE",
    abreviatura: "",
    nombre: "Pieza Dentaria Erupcion",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "PDEX",
    abreviatura: "",
    nombre: "Pieza Dentaria Extruida",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "PDI",
    abreviatura: "",
    nombre: "Pieza Dentaria Intruida",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "PDS",
    abreviatura: "",
    nombre: "Pieza Dentaria Supernumeraria",
    color: "#0880D7",
    detalle: [],
  },
  {
    tipo: "PP",
    abreviatura: "PP",
    nombre: "Pulpotomia",
    color: "",
    detalle: [],
  },
  {
    tipo: "PAD",
    abreviatura: "",
    nombre: "Posicion Anormal Dentaria",
    color: "#0880D7",
    detalle: [
      { tipo: "M", nombre: "Mesializado" },
      { tipo: "D", nombre: "Distalizado" },
      { tipo: "V", nombre: "Vestibularizado" },
      { tipo: "P", nombre: "Palatinizado" },
      { tipo: "L", nombre: "Lingualizado" },
    ],
  },
  {
    tipo: "PDPF",
    abreviatura: "",
    nombre: "Proteis Dental Parcial Fija",
    color: "",
    detalle: [],
  },
  {
    tipo: "PDC",
    abreviatura: "",
    nombre: "Proteis Dental Completa",
    color: "",
    detalle: [],
  },
  {
    tipo: "PDPR",
    abreviatura: "",
    nombre: "Proteis Dental Parcial Removible",
    color: "",
    detalle: [],
  },
  {
    tipo: "RR",
    abreviatura: "RR",
    nombre: "Remanente Radicular",
    color: "#E40000",
    detalle: [],
  },
  {
    tipo: "RD",
    abreviatura: "",
    nombre: "Restauracion Definitiva",
    color: "",
    detalle: [
      { tipo: "AM", nombre: "Amalgama Dental" },
      { tipo: "R", nombre: "Resina" },
      { tipo: "IV", nombre: "Ionomero de Vidrio" },
      { tipo: "IM", nombre: "Incrustacion Metalica" },
      { tipo: "IE", nombre: "Incrustacion Estetica" },
      { tipo: "C", nombre: "Carilla" },
    ],
  },
  {
    tipo: "RT",
    abreviatura: "",
    nombre: "Restauracion Temporal",
    color: "#E40000",
    detalle: [],
  },
  { tipo: "S", abreviatura: "S", nombre: "Sellantes", color: "", detalle: [] },
  {
    tipo: "SD",
    abreviatura: "DES",
    nombre: "Superficie Desgastada",
    color: "#E40000",
    detalle: [],
  },
  {
    tipo: "TC",
    abreviatura: "",
    nombre: "Tratamiento de Conducto",
    color: "",
    detalle: [
      { tipo: "TC", nombre: "Tratamiento de Conductos" },
      { tipo: "PC", nombre: "Pulpectomia" },
    ],
  },
  {
    tipo: "TD",
    abreviatura: "",
    nombre: "Transposicion Dentaria",
    color: "#0880D7",
    detalle: [],
  },
];

export const SettingSupperJaw = [
  {
    number: 18,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0,
  },
  {
    number: 17,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0,
  },
  {
    number: 16,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0,
  },
  {
    number: 15,
    rotated: 0,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0,
  },
  {
    number: 14,
    rotated: 0,
    reflected: 0,
    typeTooth: 3,
    selectMode: 0,
  },
  {
    number: 13,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 12,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 11,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 21,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 22,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 23,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 24,
    rotated: 0,
    reflected: 1,
    typeTooth: 3,
    selectMode: 0,
  },
  {
    number: 25,
    rotated: 0,
    reflected: 1,
    typeTooth: 2,
    selectMode: 0,
  },
  {
    number: 26,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0,
  },
  {
    number: 27,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0,
  },
  {
    number: 28,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0,
  },
];

export const SettingsLowerJaw = [
  {
    number: 48,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
  {
    number: 47,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
  {
    number: 46,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
  {
    number: 45,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0,
  },
  {
    number: 44,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0,
  },
  {
    number: 43,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 42,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 41,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 31,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 32,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 33,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 34,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0,
  },
  {
    number: 35,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0,
  },
  {
    number: 36,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
  {
    number: 37,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
  {
    number: 38,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
];

export const SettingSupperJawPrimary = [
  {
    number: 55, // Segundo molar temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 1, // Tipo de diente (puedes ajustar según tu sistema)
    selectMode: 0,
  },
  {
    number: 54, // Primer molar temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 6,
    selectMode: 0,
  },
  {
    number: 53, // Canino temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 52, // Incisivo lateral temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 51, // Incisivo central temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 61, // Incisivo central temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 62, // Incisivo lateral temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 63, // Canino temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 64, // Primer molar temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 6,
    selectMode: 0,
  },
  {
    number: 65, // Segundo molar temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0,
  },
];

export const SettingsLowerJawPrimary = [
  {
    number: 85, // Segundo molar temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 7,
    selectMode: 0,
  },
  {
    number: 84, // Primer molar temporal inferior izquierdo
    rotated: 5,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
  {
    number: 83, // Canino temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 82, // Incisivo lateral temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 81, // Incisivo central temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 71, // Incisivo central temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 72, // Incisivo lateral temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 73, // Canino temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0,
  },
  {
    number: 74, // Primer molar temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0,
  },
  {
    number: 75, // Segundo molar temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 7,
    selectMode: 0,
  },
];
