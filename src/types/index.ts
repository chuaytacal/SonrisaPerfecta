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
