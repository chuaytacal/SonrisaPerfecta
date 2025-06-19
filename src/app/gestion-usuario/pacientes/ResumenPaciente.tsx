// src/components/pacientes/ResumenPaciente.tsx
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, differenceInYears, parse as parseDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import type { Paciente as PacienteType, Persona } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, ArrowLeft, Users, CalendarDays as CalendarIconLucide} from 'lucide-react';

interface ResumenPacienteProps {
  paciente: PacienteType;
  persona: Persona;
  onBack: () => void;
}

export default function ResumenPaciente({ paciente, persona, onBack }: ResumenPacienteProps) {
    const router = useRouter();
    const [age, setAge] = useState<string | number>('Calculando...');
    const [createdDate, setCreatedDate] = useState<string>('Calculando...');

    useEffect(() => {
        if (persona) {
          const calculatedAge = persona.fechaNacimiento ? differenceInYears(new Date(), new Date(persona.fechaNacimiento)) : 'N/A';
          setAge(calculatedAge);
        }if (paciente && paciente.fechaIngreso) {
            try {
                const parsedDate = parseDate(paciente.fechaIngreso, 'dd/MM/yyyy', new Date());
                if (!isNaN(parsedDate.getTime())) {
                  setCreatedDate(format(parsedDate, 'dd MMM yyyy', { locale: es }));
                } else {
                  setCreatedDate('Fecha inválida');
                }
            } catch (error) {
                setCreatedDate('Fecha inválida');
            }
          } else if (paciente) {
              setCreatedDate('N/A');
          }
        }, [persona, paciente]);
  return (
    <Card className="w-full lg:w-[320px] lg:max-w-xs shrink-0 self-start sticky top-6">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Button variant="ghost" onClick={() => router.back()} className="self-start mb-2 -ml-2"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${persona.nombre[0]}${persona.apellidoPaterno[0]}`} alt={`${persona.nombre} ${persona.apellidoPaterno}`} data-ai-hint="person portrait"/>
            <AvatarFallback>{persona.nombre[0]}{persona.apellidoPaterno[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">{`${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</h2>
          <p className="text-sm text-muted-foreground">{age} años</p>
          <p className="text-xs text-muted-foreground mt-1">Paciente desde: {createdDate}</p>
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" size="icon" asChild><a href={`https://wa.me/${persona.telefono.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageSquare className="h-4 w-4" /></a></Button>
            <Button variant="outline" size="icon" asChild><a href={`mailto:${persona.email}`} aria-label="Email"><Mail className="h-4 w-4" /></a></Button>
            <Button variant="outline" size="icon" onClick={() => alert(`Llamar a ${persona.telefono}`)} aria-label="Llamar"><Phone className="h-4 w-4" /></Button>
          </div>
          <Separator className="my-6" />
          <div className="w-full space-y-1 text-left">
            <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10"><Users className="mr-2 h-4 w-4" /> Filiación</Button>
            <Button variant="ghost" className="w-full justify-start"><CalendarIconLucide className="mr-2 h-4 w-4" /> Historia clínica</Button>
             <Button variant="ghost" className="w-full justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12.546 2.303a1 1 0 0 0-1.092 0L2.803 8.349a1 1 0 0 0-.355.705V19a1 1 0 0 0 1 1h17.104a1 1 0 0 0 1-1V9.054a1 1 0 0 0-.355-.705Z"/><path d="M12 21V11l-5 2.5V16Z"/><path d="M12 11l5 2.5V16Z"/><path d="M18.5 14.5V10l-6-3-6 3v4.5L12 18Z"/><path d="M2 8h20"/></svg> Odontograma
            </Button>
          </div>
          <Button className="mt-6 w-full" onClick={() => alert("Funcionalidad 'Comienza aquí' no implementada")}>¡Comienza aquí!</Button>
        </CardContent>
      </Card>
  );
}
