
"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'; // Added useEffect and useState
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone, ArrowLeft, Edit, PlusCircle, Users, CalendarDays as CalendarIconLucide, AlertTriangle, FileText, Tags } from 'lucide-react';
import { mockPacientesData } from '@/app/gestion-usuario/pacientes/page';
import type { Paciente as PacienteType, Persona } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types/calendar';
import { generateInitialAppointments } from '@/app/calendario/page';


const enfermedadesOptions = [
  "Cardiopatía", "Fiebre Reumática", "Artritis", "Tuberculosis", "Anemia",
  "Epilepsia", "Lesiones cardíacas", "Hepatitis", "Tratamiento psíquico",
  "Marcapasos", "Tratamiento oncológico", "Hipertensión arterial", "Diabetes",
  "Apoplejía", "Accidentes vasculares", "Pérdida de peso"
];

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

const getPatientAppointments = (pacienteNombre: string | undefined): Appointment[] => {
    if (!pacienteNombre) return [];
    const allAppointments = generateInitialAppointments();
    return allAppointments.filter(appt => appt.paciente && appt.paciente.toLowerCase().includes(pacienteNombre.split(' ')[0].toLowerCase())).slice(0, 5); // Show up to 5
};


export default function DetallePacientePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | undefined>(undefined);
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const [age, setAge] = useState<string | number>('Calculando...');
  const [createdDate, setCreatedDate] = useState<string>('Calculando...');
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  // Simulated data for the top bar - these would ideally come from form state or patient data
  const [alergiasRegistradas, setAlergiasRegistradas] = useState<string[]>([]);
  const [enfermedadesRegistradas, setEnfermedadesRegistradas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    setPaciente(foundPaciente);
    if (foundPaciente?.persona) {
      setPersona(foundPaciente.persona);
    }
    setLoading(false); // Done loading mock data
  }, [patientId]);

  useEffect(() => {
    if (persona) {
      const calculatedAge = persona.fechaNacimiento ? differenceInYears(new Date(), new Date(persona.fechaNacimiento)) : 'N/A';
      setAge(calculatedAge);
      setPatientAppointments(getPatientAppointments(persona.nombre));

      // Simulate fetching/deriving these from medical history
      // For now, these are static examples. In a real app, they'd be reactive.
      setAlergiasRegistradas(["Penicilina"]); // Mock data from Q3
      setEnfermedadesRegistradas(["Hipertensión arterial"]); // Mock data from Q5
    }
    if (paciente) {
        const calculatedCreatedDate = paciente.fechaIngreso ? format(new Date(paciente.fechaIngreso.split('/').reverse().join('-')), 'dd MMM yyyy', { locale: es }) : 'N/A';
        setCreatedDate(calculatedCreatedDate);
    }

  }, [persona, paciente]);


  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <p>Cargando datos del paciente...</p>
        </div>
    );
  }

  if (!paciente || !persona) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <ToothIconCustom className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-2">Paciente no Encontrado</h1>
            <p className="text-muted-foreground mb-6">No pudimos encontrar los detalles para el paciente solicitado.</p>
            <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
        </div>
    );
  }

  const renderAntecedentesMedicos = () => (
    <div className="space-y-6 text-sm">
      <div className="space-y-2">
        <Label htmlFor="hosp-ultimos-anos">1. ¿Ha estado hospitalizado en estos últimos años?</Label>
        <Input id="hosp-ultimos-anos" defaultValue="No" />
        <Label htmlFor="hosp-porque">¿Por qué?</Label>
        <Textarea id="hosp-porque" defaultValue="N/A" />
        <Label htmlFor="hosp-donde">¿Dónde?</Label>
        <Textarea id="hosp-donde" defaultValue="N/A" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="atencion-medica-ultimos-anos">2. ¿Ha estado bajo atención médica en estos últimos años?</Label>
        <Input id="atencion-medica-ultimos-anos" defaultValue="Sí" />
        <Label htmlFor="atencion-medica-porque">¿Por qué?</Label>
        <Textarea id="atencion-medica-porque" defaultValue="Control de rutina" />
        <Label htmlFor="atencion-medica-donde">¿Dónde?</Label>
        <Textarea id="atencion-medica-donde" defaultValue="Clínica Local" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="alergico-drogas">3. ¿Es alérgico a alguna droga, anestesia y/o antibióticos?</Label>
        <Input id="alergico-drogas" defaultValue="Sí" />
        <Label htmlFor="alergico-cuales">¿Cuáles?</Label>
        <Textarea id="alergico-cuales" defaultValue="Penicilina" />
      </div>
      <Separator />
       <div className="space-y-2">
        <Label htmlFor="hemorragia-tratada">4. ¿Ha tenido hemorragia que haya tenido que ser tratada?</Label>
        <Input id="hemorragia-tratada" defaultValue="No" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>5. Si ha tenido alguna de estas enfermedades, márquela:</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {enfermedadesOptions.map(enf => (
            <div key={enf} className="flex items-center space-x-2">
              <Checkbox id={`enf-${enf.replace(/\s+/g, '-')}`} defaultChecked={enf === "Hipertensión arterial"} />
              <Label htmlFor={`enf-${enf.replace(/\s+/g, '-')}`} className="font-normal">{enf}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="otra-enfermedad">6. ¿Ha tenido alguna otra otra enfermedad?</Label>
        <Input id="otra-enfermedad" defaultValue="No" />
        <Label htmlFor="otra-enfermedad-cual">¿Cuál?</Label>
        <Textarea id="otra-enfermedad-cual" defaultValue="N/A" />
      </div>
      <Separator />
       <div className="space-y-2">
        <Label htmlFor="medicacion-actual">7. ¿Estás tomando alguna medicación actualmente?</Label>
        <Input id="medicacion-actual" defaultValue="Sí" />
        <Label htmlFor="medicacion-cual">¿Cuál?</Label>
        <Textarea id="medicacion-cual" defaultValue="Losartán para la presión" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="embarazada">8. ¿Está embarazada?</Label>
        <Input id="embarazada" defaultValue={persona.sexo === 'F' ? "No" : "N/A"} />
        <Label htmlFor="embarazada-semanas">¿Cuántas semanas?</Label>
        <Textarea id="embarazada-semanas" defaultValue="N/A" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="hipertenso-presion-alta">9. ¿Es hipertenso o tiene presión alta?</Label>
        <Input id="hipertenso-presion-alta" defaultValue="Sí" />
      </div>
      <Separator />
      <div className="space-y-1">
         <Label htmlFor="ultima-consulta-dental">10. Última consulta dental:</Label>
         <Input id="ultima-consulta-dental" type="text" defaultValue="Hace 6 meses" />
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={() => alert("Funcionalidad 'Guardar Cambios' no implementada")}>
            Guardar Cambios
        </Button>
      </div>
    </div>
  );


  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-background min-h-screen">
      {/* Left Panel: Patient Info */}
      <Card className="w-full lg:w-[320px] lg:max-w-xs shrink-0 self-start sticky top-6">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Button variant="ghost" onClick={() => router.back()} className="self-start mb-2 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
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
            <Button variant="outline" size="icon" aria-label="Llamar"><Phone className="h-4 w-4" /></Button>
          </div>

          <Separator className="my-6" />

          <div className="w-full space-y-1 text-left">
            <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10">
                <Users className="mr-2 h-4 w-4" /> Filiación
            </Button>
            <Button variant="ghost" className="w-full justify-start">
                <CalendarIconLucide className="mr-2 h-4 w-4" /> Historia clínica
            </Button>
            <Button variant="ghost" className="w-full justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12.546 2.303a1 1 0 0 0-1.092 0L2.803 8.349a1 1 0 0 0-.355.705V19a1 1 0 0 0 1 1h17.104a1 1 0 0 0 1-1V9.054a1 1 0 0 0-.355-.705Z"/><path d="M12 21V11l-5 2.5V16Z"/><path d="M12 11l5 2.5V16Z"/><path d="M18.5 14.5V10l-6-3-6 3v4.5L12 18Z"/><path d="M2 8h20"/></svg> Odontograma
            </Button>
          </div>

           <Button className="mt-6 w-full" onClick={() => alert("Funcionalidad 'Comienza aquí' no implementada")}>
            ¡Comienza aquí!
          </Button>
        </CardContent>
      </Card>

      {/* Right Panel: Tabs */}
      <div className="flex-1">
        {/* Top Info Bar */}
        <Card className="mb-6">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Etiquetas Section */}
                <div className="space-y-2">
                    <Label className="flex items-center text-sm font-medium text-muted-foreground"><Tags className="mr-2 h-4 w-4" />Etiquetas</Label>
                    <div className="flex flex-wrap gap-1">
                        {paciente.etiquetas && paciente.etiquetas.length > 0 ? (
                            paciente.etiquetas.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)
                        ) : (
                            <Badge variant="outline">Sin etiquetas</Badge>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto" onClick={() => alert("Agregar etiqueta no implementado")}>
                        <PlusCircle className="mr-1 h-3 w-3"/> Agregar Etiqueta
                    </Button>
                </div>

                {/* Notas Section */}
                <div className="space-y-2">
                    <Label htmlFor="notas-paciente" className="flex items-center text-sm font-medium text-muted-foreground"><FileText className="mr-2 h-4 w-4" />Notas</Label>
                    <Textarea id="notas-paciente" placeholder="Escribe aquí..." rows={3} className="text-sm"/>
                     {/* No save button for notes here, assumed to be part of a larger save if needed */}
                </div>
                
                {/* Enfermedades y Alergias Section */}
                <div className="space-y-2">
                     <Label className="flex items-center text-sm font-medium text-muted-foreground"><AlertTriangle className="mr-2 h-4 w-4 text-destructive" />Enfermedades y Alergias</Label>
                    <div className="flex flex-wrap gap-1">
                         {enfermedadesRegistradas.length > 0 && enfermedadesRegistradas.map(enf => <Badge key={enf} variant="outline" className="border-orange-500 text-orange-700">{enf}</Badge>)}
                         {alergiasRegistradas.length > 0 && alergiasRegistradas.map(alergia => <Badge key={alergia} variant="outline" className="border-red-500 text-red-700">{alergia}</Badge>)}
                         {(enfermedadesRegistradas.length === 0 && alergiasRegistradas.length === 0) && <Badge variant="outline">Sin registros</Badge>}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-end">
                 <Button variant="outline" size="sm" onClick={() => alert("Editar campos no implementado")}><Edit className="mr-1 h-3 w-3"/> Editar Campos</Button>
            </CardFooter>
        </Card>

        <Tabs defaultValue="datosPersonales" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="datosPersonales">Datos Personales</TabsTrigger>
            <TabsTrigger value="antecedentesMedicos">Antecedentes Médicos</TabsTrigger>
            <TabsTrigger value="historialCitas">Historial de Citas</TabsTrigger>
          </TabsList>

          <TabsContent value="datosPersonales">
            <Card>
              <CardHeader>
                <CardTitle>Información del Paciente</CardTitle>
                <CardDescription>Detalles personales y de contacto del paciente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div><Label className="text-xs text-muted-foreground">Nombres</Label><p className="font-medium">{persona.nombre}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Apellidos</Label><p className="font-medium">{`${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Nacionalidad</Label><p className="font-medium">Peruana</p></div>
                    <div><Label className="text-xs text-muted-foreground">Teléfono Celular</Label><p className="font-medium">{persona.telefono}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label><p className="font-medium">{persona.fechaNacimiento ? format(new Date(persona.fechaNacimiento), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Tipo Documento</Label><p className="font-medium">{persona.tipoDocumento}</p></div>
                    <div><Label className="text-xs text-muted-foreground">N° Documento</Label><p className="font-medium">{persona.numeroDocumento}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{persona.email || 'No registrado'}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Teléfono Fijo</Label><p className="font-medium">No registrado</p></div>
                    <div><Label className="text-xs text-muted-foreground">N° Historia Clínica</Label><p className="font-medium">{paciente.id.substring(paciente.id.length-6).toUpperCase()}</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="antecedentesMedicos">
            <Card>
              <CardHeader>
                <CardTitle>Cuestionario de Salud (Antecedentes)</CardTitle>
                 <CardDescription>Respuestas del paciente al cuestionario de salud.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderAntecedentesMedicos()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historialCitas">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Historial de Citas</CardTitle>
                <CardDescription>Listado de las últimas citas del paciente.</CardDescription>
              </CardHeader>
              <CardContent>
                {patientAppointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Profesional</TableHead>
                            <TableHead>Servicio/Motivo</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {patientAppointments.map(cita => (
                            <TableRow key={cita.id}>
                            <TableCell>{format(cita.start, 'dd/MM/yyyy', { locale: es })}</TableCell>
                            <TableCell>{format(cita.start, 'HH:mm a', { locale: es })}</TableCell>
                            <TableCell>{cita.doctor || 'N/A'}</TableCell>
                            <TableCell>{cita.title}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={
                                    new Date(cita.end) < new Date() ? 'outline' : // Completed
                                    (cita.tipoCita === 'consulta' || cita.tipoCita === 'control') ? 'default' : // Pending/Active
                                    (cita.tipoCita === 'tratamiento') ? 'secondary' :
                                    'outline' 
                                }>
                                {new Date(cita.end) < new Date() ? 'Completada' : (cita.tipoCita ? cita.tipoCita.charAt(0).toUpperCase() + cita.tipoCita.slice(1) : 'Pendiente') }
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay citas registradas para este paciente.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

