
"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone, ArrowLeft, Edit, PlusCircle, Users, CalendarDays as CalendarIconLucide, Tooth as ToothIconCustom } from 'lucide-react'; // Renamed CalendarDays to avoid conflict
import { mockPacientesData } from '@/app/gestion-usuario/pacientes/page'; 
// mockPersonasData is already included within mockPacientesData.paciente.persona
import type { Paciente as PacienteType, Persona } from '@/types'; // Renamed Paciente to PacienteType
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'; 
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Using Appointment type from calendar
import type { Appointment } from '@/types/calendar'; 
import { generateInitialAppointments } from '@/app/calendario/page'; // Import mock appointments


const enfermedadesOptions = [
  "Cardiopatía", "Fiebre Reumática", "Artritis", "Tuberculosis", "Anemia",
  "Epilepsia", "Lesiones cardíacas", "Hepatitis", "Tratamiento psíquico",
  "Marcapasos", "Tratamiento oncológico", "Hipertensión arterial", "Diabetes",
  "Apoplejía", "Accidentes vasculares", "Pérdida de peso"
];


// Helper function to get a few appointments for the current patient (mock)
const getPatientAppointments = (pacienteNombre: string | undefined): Appointment[] => {
    if (!pacienteNombre) return [];
    const allAppointments = generateInitialAppointments(); // Get all mock appointments
    // Filter some for this patient (simple mock logic)
    return allAppointments.filter(appt => appt.paciente && appt.paciente.toLowerCase().includes(pacienteNombre.split(' ')[0].toLowerCase())).slice(0, 3);
};


export default function DetallePacientePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const paciente = mockPacientesData.find(p => p.id === patientId);
  
  if (!paciente || !paciente.persona) {
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
  const persona = paciente.persona;

  const age = persona.fechaNacimiento ? differenceInYears(new Date(), new Date(persona.fechaNacimiento)) : 'N/A';
  const createdDate = paciente.fechaIngreso ? format(new Date(paciente.fechaIngreso.split('/').reverse().join('-')), 'dd MMM yyyy', { locale: es }) : 'N/A';
  const patientAppointments = getPatientAppointments(persona.nombre);


  const renderAntecedentesMedicos = () => (
    <div className="space-y-6 text-sm">
      <div className="space-y-2">
        <Label htmlFor="hosp-ultimos-anos">1. ¿Ha estado hospitalizado en estos últimos años?</Label>
        <Input id="hosp-ultimos-anos" defaultValue="No" disabled />
        <Label htmlFor="hosp-porque">¿Por qué?</Label>
        <Textarea id="hosp-porque" defaultValue="N/A" disabled />
        <Label htmlFor="hosp-donde">¿Dónde?</Label>
        <Textarea id="hosp-donde" defaultValue="N/A" disabled />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="atencion-medica-ultimos-anos">2. ¿Ha estado bajo atención médica en estos últimos años?</Label>
        <Input id="atencion-medica-ultimos-anos" defaultValue="Sí" disabled />
        <Label htmlFor="atencion-medica-porque">¿Por qué?</Label>
        <Textarea id="atencion-medica-porque" defaultValue="Control de rutina" disabled />
        <Label htmlFor="atencion-medica-donde">¿Dónde?</Label>
        <Textarea id="atencion-medica-donde" defaultValue="Clínica Local" disabled />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="alergico-drogas">3. ¿Es alérgico a alguna droga, anestesia y/o antibióticos?</Label>
        <Input id="alergico-drogas" defaultValue="Sí" disabled />
        <Label htmlFor="alergico-cuales">¿Cuáles?</Label>
        <Textarea id="alergico-cuales" defaultValue="Penicilina" disabled />
      </div>
      <Separator />
       <div className="space-y-2">
        <Label htmlFor="hemorragia-tratada">4. ¿Ha tenido hemorragia que haya tenido que ser tratada?</Label>
        <Input id="hemorragia-tratada" defaultValue="No" disabled />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>5. Si ha tenido alguna de estas enfermedades, márquela:</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {enfermedadesOptions.map(enf => (
            <div key={enf} className="flex items-center space-x-2">
              <Checkbox id={`enf-${enf.replace(/\s+/g, '-')}`} disabled checked={enf === "Hipertensión arterial"} /> 
              <Label htmlFor={`enf-${enf.replace(/\s+/g, '-')}`} className="font-normal">{enf}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="otra-enfermedad">6. ¿Ha tenido alguna otra otra enfermedad?</Label>
        <Input id="otra-enfermedad" defaultValue="No" disabled />
        <Label htmlFor="otra-enfermedad-cual">¿Cuál?</Label>
        <Textarea id="otra-enfermedad-cual" defaultValue="N/A" disabled />
      </div>
      <Separator />
       <div className="space-y-2">
        <Label htmlFor="medicacion-actual">7. ¿Estás tomando alguna medicación actualmente?</Label>
        <Input id="medicacion-actual" defaultValue="Sí" disabled />
        <Label htmlFor="medicacion-cual">¿Cuál?</Label>
        <Textarea id="medicacion-cual" defaultValue="Losartán para la presión" disabled />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="embarazada">8. ¿Está embarazada?</Label>
        <Input id="embarazada" defaultValue={persona.sexo === 'F' ? "No" : "N/A"} disabled />
        <Label htmlFor="embarazada-semanas">¿Cuántas semanas?</Label>
        <Textarea id="embarazada-semanas" defaultValue="N/A" disabled />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="hipertenso-presion-alta">9. ¿Es hipertenso o tiene presión alta?</Label>
        <Input id="hipertenso-presion-alta" defaultValue="Sí" disabled />
      </div>
      <Separator />
      <div className="space-y-1">
         <Label htmlFor="ultima-consulta-dental">10. Última consulta dental:</Label>
         <Input id="ultima-consulta-dental" type="text" disabled defaultValue="Hace 6 meses" />
      </div>
    </div>
  );


  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-background min-h-screen">
      {/* Left Panel: Patient Info */}
      <Card className="w-full lg:w-[320px] lg:max-w-xs shrink-0 self-start sticky top-6">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Button variant="ghost" onClick={() => router.back()} className="self-start mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${persona.nombre[0]}${persona.apellidoPaterno[0]}`} alt={`${persona.nombre} ${persona.apellidoPaterno}`} data-ai-hint="person portrait" />
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
            {/* Add other menu items from the image as needed, with appropriate icons */}
             <Button variant="ghost" className="w-full justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12.546 2.303a1 1 0 0 0-1.092 0L2.803 8.349a1 1 0 0 0-.355.705V19a1 1 0 0 0 1 1h17.104a1 1 0 0 0 1-1V9.054a1 1 0 0 0-.355-.705Z"/><path d="M12 21V11l-5 2.5V16Z"/><path d="M12 11l5 2.5V16Z"/><path d="M18.5 14.5V10l-6-3-6 3v4.5L12 18Z"/><path d="M2 8h20"/></svg> Odontograma
            </Button>
            {/* ... other items */}
          </div>

           <Button className="mt-6 w-full" onClick={() => alert("Funcionalidad 'Comienza aquí' no implementada")}>
            ¡Comienza aquí!
          </Button>
        </CardContent>
      </Card>

      {/* Right Panel: Tabs */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
            <div className="space-x-2">
                <Badge variant="secondary">Etiqueta 1</Badge>
                <Badge variant="outline">Etiqueta 2</Badge>
                <Button variant="ghost" size="sm"><PlusCircle className="mr-1 h-3 w-3"/> Agregar Etiqueta</Button>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm"><Edit className="mr-1 h-3 w-3"/> Editar Campos</Button>
                 {/* Placeholder for Alergias and Notas */}
            </div>
        </div>

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
                                    (cita.tipoCita === 'consulta' || cita.tipoCita === 'control') ? 'default' :
                                    (cita.tipoCita === 'tratamiento') ? 'secondary' :
                                    'outline' // Default for others or if status is different
                                }>
                                {cita.tipoCita ? cita.tipoCita.charAt(0).toUpperCase() + cita.tipoCita.slice(1) : 'Pendiente'}
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
