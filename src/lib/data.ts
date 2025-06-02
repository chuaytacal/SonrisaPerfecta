import type { Service, Doctor, TimeSlot } from '@/types';
import { ShieldCheck, Wrench, Sparkles, UserCircle } from 'lucide-react';

export const servicesData: Service[] = [
  {
    id: 'limpieza',
    name: 'Limpieza Dental Profesional',
    description: 'Eliminación de placa y sarro para mantener tus dientes sanos y brillantes.',
    category: 'Preventivo',
    price: '$50 - $75',
    icon: ShieldCheck,
  },
  {
    id: 'empaste',
    name: 'Empastes Dentales',
    description: 'Restauración de dientes afectados por caries con materiales del color del diente.',
    category: 'Restaurador',
    price: '$100 - $200 por diente',
    icon: Wrench,
  },
  {
    id: 'blanqueamiento',
    name: 'Blanqueamiento Dental',
    description: 'Tratamiento para aclarar el tono de tus dientes y lograr una sonrisa más blanca.',
    category: 'Cosmético',
    price: '$250 - $400',
    icon: Sparkles,
  },
  {
    id: 'extraccion',
    name: 'Extracción Dental',
    description: 'Remoción de dientes dañados o problemáticos.',
    category: 'Restaurador',
    price: '$150 - $300',
    icon: Wrench,
  },
  {
    id: 'ortodoncia',
    name: 'Consulta de Ortodoncia',
    description: 'Evaluación para tratamientos de ortodoncia y alineación dental.',
    category: 'Cosmético',
    price: '$75 (consulta)',
    icon: UserCircle,
  },
  {
    id: 'endodoncia',
    name: 'Endodoncia (Tratamiento de conducto)',
    description: 'Tratamiento para salvar dientes infectados o dañados internamente.',
    category: 'Restaurador',
    price: '$500 - $1000',
    icon: Wrench,
  }
];

export const doctorsData: Doctor[] = [
  {
    id: 'dra-lopez',
    name: 'Dra. Ana López',
    specialty: 'Odontología General y Cosmética',
    imageUrl: 'https://placehold.co/300x300.png',
    bio: 'La Dra. López tiene más de 10 años de experiencia ayudando a pacientes a lograr sonrisas saludables y hermosas. Especializada en odontología cosmética y restauradora.',
  },
  {
    id: 'dr-perez',
    name: 'Dr. Carlos Pérez',
    specialty: 'Ortodoncista',
    imageUrl: 'https://placehold.co/300x300.png',
    bio: 'El Dr. Pérez es un ortodoncista certificado con pasión por crear alineaciones dentales perfectas. Utiliza las últimas tecnologías para tratamientos eficientes y cómodos.',
  },
  {
    id: 'dra-gomez',
    name: 'Dra. Sofia Gomez',
    specialty: 'Endodoncista',
    imageUrl: 'https://placehold.co/300x300.png',
    bio: 'La Dra. Gomez se especializa en tratamientos de conducto, enfocada en aliviar el dolor y preservar los dientes naturales de sus pacientes con la máxima precisión.',
  },
];

export const availableTimeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 AM' },
  { id: '2', time: '10:00 AM' },
  { id: '3', time: '11:00 AM' },
  { id: '4', time: '02:00 PM' },
  { id: '5', time: '03:00 PM' },
  { id: '6', time: '04:00 PM' },
];
