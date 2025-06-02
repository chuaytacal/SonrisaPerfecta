import Image from 'next/image';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { doctorsData } from '@/lib/data';
import DoctorProfileCard from '@/components/clinic-info/DoctorProfileCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClinicInfoPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="font-headline text-4xl font-bold text-primary mb-6">Nuestra Clínica Dental</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          En Sonrisa Perfecta, estamos comprometidos a proporcionar atención dental de la más alta calidad en un ambiente acogedor y profesional. Conoce más sobre nosotros y nuestro equipo.
        </p>
      </section>

      <section>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Información de Contacto y Horarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Dirección</h3>
                  <p className="text-muted-foreground">Calle Falsa 123, Consultorio 4B, Ciudad Ejemplo, CP 01234</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Teléfono</h3>
                  <p className="text-muted-foreground">(555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Correo Electrónico</h3>
                  <p className="text-muted-foreground">contacto@sonrisaperfecta.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Horarios de Atención</h3>
                  <p className="text-muted-foreground">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground">Sábados: 9:00 AM - 1:00 PM</p>
                  <p className="text-muted-foreground">Domingos: Cerrado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
             <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">Ubicación</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                 <Image
                    src="https://placehold.co/600x400.png" // Placeholder for map
                    alt="Mapa de ubicación de la clínica"
                    width={600}
                    height={400}
                    className="rounded-md object-cover w-full h-full"
                    data-ai-hint="map location"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">Un mapa interactivo de nuestra ubicación.</p>
             </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-semibold text-primary mb-8 text-center">Conoce a Nuestros Doctores</h2>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {doctorsData.map((doctor) => (
            <DoctorProfileCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>
    </div>
  );
}
