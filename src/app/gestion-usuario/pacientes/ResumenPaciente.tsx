
// src/components/pacientes/ResumenPaciente.tsx
import Link from 'next/link';
import { useParams, useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, differenceInYears, parse as parseDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import type { Paciente as PacienteType, Persona } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Phone, ArrowLeft, Users, CalendarDays as CalendarIconLucide, Smile, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumenPacienteProps {
  paciente: PacienteType;
  persona: Persona;
  onBack?: () => void; // Make onBack optional if router.back() is primary
}

// Re-define ToothIconCustom here or import if it's moved to a shared location
const ToothIconCustom = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.36 3.55A2 2 0 0 1 10.77 3h2.46a2 2 0 0 1 1.41.55L17 6h-2.53a2 2 0 0 0-1.64.88L12 8.34l-.83-1.46A2 2 0 0 0 9.53 6H7l2.36-2.45Z"/>
      <path d="M19 10c0 2-2 4-2 4H7s-2-2-2-4a5 5 0 0 1 8-4h2a5 5 0 0 1 4 4Z"/>
      <path d="M17.61 14a5.22 5.22 0 0 1-1.11 1.39 3.82 3.82 0 0 1-2.29.98c-.43.04-.81.18-1.21.22a4 4 0 0 1-2.5-.26 3.8 3.8 0 0 1-2.28-1 5.2 5.2 0 0 1-1.15-1.38"/>
      <path d="M7.25 16.5c.64.92 1.57 1.5 2.58 1.5h4.34c1.01 0 1.94-.58 2.58-1.5"/>
    </svg>
  );


export default function ResumenPaciente({ paciente, persona, onBack }: ResumenPacienteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [age, setAge] = useState<string | number>('Calculando...');
    const [createdDate, setCreatedDate] = useState<string>('Calculando...');

    useEffect(() => {
        if (persona) {
          const calculatedAge = persona.fechaNacimiento ? differenceInYears(new Date(), new Date(persona.fechaNacimiento)) : 'N/A';
          setAge(calculatedAge);
        }if (paciente && paciente.fechaIngreso) {
            try {
                // Attempt to parse assuming "dd/MM/yyyy"
                let parsedDate = parseDate(paciente.fechaIngreso, 'dd/MM/yyyy', new Date());
                // If invalid and it's an ISO string (from new Date().toISOString())
                if (isNaN(parsedDate.getTime()) && typeof paciente.fechaIngreso === 'string' && paciente.fechaIngreso.includes('T')) {
                    parsedDate = new Date(paciente.fechaIngreso);
                }

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

    const navItems = [
        { label: "Filiación", href: `/gestion-usuario/pacientes/${paciente.id}/filiacion`, icon: Users },
        { label: "Historia clínica", href: `/gestion-usuario/pacientes/${paciente.id}/historia-clinica`, icon: CalendarIconLucide },
        { label: "Odontograma", href: `/gestion-usuario/pacientes/${paciente.id}/odontograma`, icon: ToothIconCustom },
        { label: "Ortodoncia", href: `/gestion-usuario/pacientes/${paciente.id}/ortodoncia`, icon: Smile },
        { label: "Estado de cuenta", href: `/gestion-usuario/pacientes/${paciente.id}/estado-de-cuenta`, icon: CircleDollarSign },
    ];
    
  return (
    <Card className="w-full lg:w-[320px] lg:max-w-xs shrink-0 self-start sticky top-6">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Button variant="ghost" onClick={onBack || (() => router.back())} className="self-start mb-2 -ml-2"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
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
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link key={item.label} href={item.href} passHref legacyBehavior>
                        <Button
                            asChild
                            variant="ghost"
                            className={cn(
                                "w-full justify-start",
                                isActive && "bg-primary/10 text-primary"
                            )}
                            >
                            <a><Icon className="mr-2 h-4 w-4" /> {item.label}</a>
                        </Button>
                    </Link>
                );
            })}
          </div>
          <Button className="mt-6 w-full" onClick={() => alert("Funcionalidad 'Comienza aquí' no implementada")}>¡Comienza aquí!</Button>
        </CardContent>
      </Card>
  );
}
