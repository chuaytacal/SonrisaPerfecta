import Image from 'next/image';
import type { Doctor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

interface DoctorProfileCardProps {
  doctor: Doctor;
}

export default function DoctorProfileCard({ doctor }: DoctorProfileCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative w-full h-64">
        <Image
          src={doctor.imageUrl}
          alt={`Foto de ${doctor.name}`}
          layout="fill"
          objectFit="cover"
          data-ai-hint="doctor portrait"
        />
      </div>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl text-primary">{doctor.name}</CardTitle>
        <div className="flex items-center justify-center text-accent">
          <Stethoscope className="h-5 w-5 mr-2" />
          <CardDescription className="text-accent font-medium">{doctor.specialty}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{doctor.bio}</p>
      </CardContent>
    </Card>
  );
}
