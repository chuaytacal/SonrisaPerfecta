
export type Hallazgo = {
  tipo: any ; 
  abreviatura: any;
  color: string;
  nombre: string; 
  cara?: Hallazgo[];
  detalle?: DetalleHallazgo[];
  grupo?: number[];
  direccion?: any;
};


export type DetalleHallazgo = {
  abreviatura: any;
  nombre: string; 
};

export type HallazgosPorDiente = {
  [tipo: string]: Hallazgo;
};

export type DientesMap = {
  [idDiente: number]: HallazgosPorDiente;
};

export type HallazgoCaraCurrent = {
  tipo: any ; 
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
  cara?: HallazgoCaraCurrent;
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
  to: 'toConfirmDelGroup'| 'toToothFace' | '';
};
export const Hallazgos = [
  { tipo:'AOF', abreviatura: '', denominacion:'Aparato Ortodóntico Fijo',color:'', detalle:[] },
  { tipo:'AOR', abreviatura: '', denominacion:'Aparato Ortodóntico Removible',color:'', detalle:[] },
  { 
    tipo:'C', 
    abreviatura: '',
    denominacion:'Corona', 
    color:'',
    detalle:[
      { tipo:'CM', denominacion:'Corona Metálica' },
      { tipo:'CF', denominacion:'Corona Fenestrada' },
      { tipo:'CMC', denominacion:'Corona Metal Cerámica' },
      { tipo:'CV', denominacion:'Corona Veneer' },
      { tipo:'CLM', denominacion:'Corona Line de Metal' }
    ] 
  },
  { tipo:'CT',abreviatura: 'CT', denominacion:'Corona Temporal',color:'#E40000', detalle:[] },
  { 
    tipo:'DDE', 
    abreviatura: 'DDE',
    denominacion:'Defectos de Desarrollo del Esmalte', 
    color:'#E40000',
    detalle:[
      { tipo:'O', denominacion:'Opacidades del esmalte' },
      { tipo:'PE', denominacion:'Pigmentacion del Esmalte' },
      { tipo:'F', denominacion:'Fluorosis' }
    ] 
  },
  { tipo:'D',abreviatura: '', denominacion:'Diastema',color:'#0880D7', detalle:[] },
  { tipo:'ET',abreviatura: '', denominacion:'Edentulo Total',color:'#0880D7', detalle:[] },
  { tipo:'M',abreviatura: '', denominacion:'Espigo/Muñon',color:'', detalle:[] },
  { tipo:'FFP',abreviatura: 'FFP', denominacion:'Fosas y Fisuras Profundas',color:'#0880D7', detalle:[] },
  { tipo:'FD',abreviatura: '', denominacion:'Fractura Dental',color:'#E40000', detalle:[] },
  { tipo:'F',abreviatura: '', denominacion:'Fusion',color:'#0880D7', detalle:[] },
  { tipo:'GE',abreviatura: '', denominacion:'Geminacion',color:'#0880D7', detalle:[] },
  { tipo:'GI',abreviatura: '', denominacion:'Giroversion',color:'#0880D7', detalle:[] },
  { tipo:'I',abreviatura: 'I', denominacion:'Impactacion',color:'#0880D7', detalle:[] },
  { tipo:'ID',abreviatura: 'IMP', denominacion:'Implante Dental',color:'', detalle:[] },
  { 
    tipo:'LCD', 
    abreviatura: '',
    denominacion:'Caries', 
    color:'#E40000',
    detalle:[
      { tipo:'MB', denominacion:'Mancha Blanca' },
      { tipo:'CE', denominacion:'Lesion de Caries Dental a Nivel del Esmalte' },
      { tipo:'CD', denominacion:'Lesion de Caries Dental a Nivel del Dentina' },
      { tipo:'CDP', denominacion:'Lesion de Caries Dental a Nivel del Dentina/compromiso de la pulpa' }
    ] 
  },
  { tipo:'MA',abreviatura: 'MAC', denominacion:'Macrodoncia',color:'#0880D7', detalle:[] },
  { tipo:'MI',abreviatura: 'MIC', denominacion:'Microdoncia',color:'#0880D7', detalle:[] },
  { tipo:'MP',abreviatura: 'M', denominacion:'Movilidad Patologica',color:'#E40000', detalle:[] },
  { 
    tipo:'PDA', 
    abreviatura: '',
    denominacion:'Pieza Dentaria Ausente', 
    color:'#0880D7',
    detalle:[
      { tipo:'DNE', denominacion:'Diente no Erupcionado' },
      { tipo:'DEX', denominacion:'Diente ausente por extracion debido a experiencia' },
      { tipo:'DAO', denominacion:'Diente ausente por otras razones que no tienen relacion a experiencia' }
    ] 
  },
  { tipo:'PDCL',abreviatura: '', denominacion:'Pieza Dentaria en Clavija',color:'#0880D7', detalle:[] },
  { tipo:'E',abreviatura: 'E', denominacion:'Pieza Dentaria Ectopica',color:'#0880D7', detalle:[] },
  { tipo:'PDE',abreviatura: '', denominacion:'Pieza Dentaria Erupcion',color:'#0880D7', detalle:[] },
  { tipo:'PDEX',abreviatura: '', denominacion:'Pieza Dentaria Extruida',color:'#0880D7', detalle:[] },
  { tipo:'PDI',abreviatura: '', denominacion:'Pieza Dentaria Intruida',color:'#0880D7', detalle:[] },
  { tipo:'PDS',abreviatura: '', denominacion:'Pieza Dentaria Supernumeraria',color:'#0880D7', detalle:[] },
  { tipo:'PP',abreviatura: 'PP', denominacion:'Pulpotomia',color:'', detalle:[] },
  { 
    tipo:'PAD', 
    abreviatura: '',
    denominacion:'Posicion Anormal Dentaria', 
    color:'#0880D7',
    detalle:[
      { tipo:'M', denominacion:'Mesializado' },
      { tipo:'D', denominacion:'Distalizado' },
      { tipo:'V', denominacion:'Vestibularizado' },
      { tipo:'P', denominacion:'Palatinizado' },
      { tipo:'L', denominacion:'Lingualizado' }
    ] 
  },
  { tipo:'PDPF',abreviatura: '', denominacion:'Proteis Dental Parcial Fija',color:'', detalle:[] },
  { tipo:'PDC',abreviatura: '', denominacion:'Proteis Dental Completa',color:'', detalle:[] },
  { tipo:'PDPR',abreviatura: '', denominacion:'Proteis Dental Parcial Removible',color:'', detalle:[] },
  { tipo:'RR',abreviatura: 'RR', denominacion:'Remanente Radicular',color:'#E40000', detalle:[] },
  { 
    tipo:'RD', 
    abreviatura: '',
    denominacion:'Restauracion Definitiva', 
    color:'',
    detalle:[
      { tipo:'AM', denominacion:'Amalgama Dental' },
      { tipo:'R', denominacion:'Resina' },
      { tipo:'IV', denominacion:'Ionomero de Vidrio' },
      { tipo:'IM', denominacion:'Incrustacion Metalica' },
      { tipo:'IE', denominacion:'Incrustacion Estetica' },
      { tipo:'C', denominacion:'Carilla' }
    ] 
  },
  { tipo:'RT',abreviatura: '', denominacion:'Restauracion Temporal',color:'#E40000', detalle:[] },
  { tipo:'S',abreviatura: 'S', denominacion:'Sellantes',color:'', detalle:[] },
  { tipo:'SD',abreviatura: 'DES', denominacion:'Superficie Desgastada',color:'#E40000', detalle:[] },
  { 
    tipo:'TC', 
    abreviatura: '',
    denominacion:'Tratamiento de Conducto',
    color:'', 
    detalle:[
      { tipo:'TC', denominacion:'Tratamiento de Conductos' },
      { tipo:'PC', denominacion:'Pulpectomia' }
    ] 
  },
  { tipo:'TD',abreviatura: '', denominacion:'Transposicion Dentaria',color:'#0880D7', detalle:[] }
];

export const SettingSupperJaw = [
  {
    number: 18,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0
  },
  {
    number: 17,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0
  },
  {
    number: 16,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0
  },
  {
    number: 15,
    rotated: 0,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0
  },
  {
    number: 14,
    rotated: 0,
    reflected: 0,
    typeTooth: 3,
    selectMode: 0
  },
  {
    number: 13,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 12,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 11,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 21,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 22,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 23,
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 24,
    rotated: 0,
    reflected: 1,
    typeTooth: 3,
    selectMode: 0
  },
  {
    number: 25,
    rotated: 0,
    reflected: 1,
    typeTooth: 2,
    selectMode: 0
  },
  {
    number:26 ,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0
  },
  {
    number: 27,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0
  },
  {
    number: 28,
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0
  },
];

export const SettingsLowerJaw = [
  {
    number: 48,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  },
  {
    number: 47,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  },
  {
    number: 46,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  },
  {
    number: 45,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0
  },
  {
    number: 44,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0
  },
  {
    number: 43,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 42,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 41,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 31,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 32,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 33,
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 34,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0
  },
  {
    number: 35,
    rotated: 1,
    reflected: 0,
    typeTooth: 2,
    selectMode: 0
  },
  {
    number: 36,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  },
  {
    number: 37,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  },
  {
    number: 38,
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  }
];

export const SettingSupperJawPrimary = [
  {
    number: 55,  // Segundo molar temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 1,  // Tipo de diente (puedes ajustar según tu sistema)
    selectMode: 0
  },
  {
    number: 54,  // Primer molar temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 6,
    selectMode: 0
  },
  {
    number: 53,  // Canino temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 52,  // Incisivo lateral temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 51,  // Incisivo central temporal superior derecho
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 61,  // Incisivo central temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 62,  // Incisivo lateral temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 63,  // Canino temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 64,  // Primer molar temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 6,
    selectMode: 0
  },
  {
    number: 65,  // Segundo molar temporal superior izquierdo
    rotated: 0,
    reflected: 0,
    typeTooth: 1,
    selectMode: 0
  }
];

export const SettingsLowerJawPrimary = [
  {
    number: 85,  // Segundo molar temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 7,
    selectMode: 0
  },
  {
    number: 84,  // Primer molar temporal inferior izquierdo
    rotated: 5,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  },
  {
    number: 83,  // Canino temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 82,  // Incisivo lateral temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 81,  // Incisivo central temporal inferior izquierdo
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 71,  // Incisivo central temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 72,  // Incisivo lateral temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 73,  // Canino temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 4,
    selectMode: 0
  },
  {
    number: 74,  // Primer molar temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 5,
    selectMode: 0
  },
  {
    number: 75,  // Segundo molar temporal inferior derecho
    rotated: 1,
    reflected: 0,
    typeTooth: 7,
    selectMode: 0
  }
];
