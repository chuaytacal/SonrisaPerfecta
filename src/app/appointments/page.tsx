import AppointmentForm from '@/components/appointments/AppointmentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';

export default function AppointmentsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CalendarCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">Agenda tu Cita</CardTitle>
          <CardDescription className="text-muted-foreground">
            Completa el formulario para solicitar tu cita. Nos pondremos en contacto contigo para confirmar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
