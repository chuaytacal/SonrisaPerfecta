import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Smile } from 'lucide-react';
import { servicesData } from '@/lib/data';

export default function HomePage() {
  const featuredServices = servicesData.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-secondary rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <Smile className="mx-auto h-20 w-20 text-primary mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">
            Bienvenido a Sonrisa Perfecta
          </h1>
          <p className="text-lg md:text-xl text-foreground mb-8 max-w-2xl mx-auto">
            Tu salud dental es nuestra prioridad. Ofrecemos una amplia gama de servicios dentales con la última tecnología y un equipo de profesionales dedicados.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/appointments">Agenda tu Cita Hoy</Link>
          </Button>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl font-semibold text-primary mb-4">Sobre Nuestra Clínica</h2>
            <p className="text-muted-foreground mb-4">
              En Sonrisa Perfecta, combinamos experiencia, tecnología de vanguardia y un trato cálido para ofrecerte la mejor atención dental. Desde revisiones preventivas hasta tratamientos especializados, estamos aquí para cuidar de tu sonrisa en cada etapa de la vida.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" /> Profesionales Altamente Calificados</li>
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" /> Tecnología Dental Avanzada</li>
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" /> Ambiente Cómodo y Relajante</li>
              <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" /> Atención Personalizada</li>
            </ul>
            <Button variant="outline" asChild className="mt-6 border-primary text-primary hover:bg-primary/10">
              <Link href="/clinic-info">Conoce Más</Link>
            </Button>
          </div>
          <div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Interior de la clínica dental Sonrisa Perfecta"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              data-ai-hint="dental clinic interior"
            />
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-12 bg-card rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-semibold text-primary mb-8 text-center">Nuestros Servicios Destacados</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    {service.icon && <service.icon className="h-12 w-12 text-primary" />}
                  </div>
                  <CardTitle className="font-headline text-xl text-center">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-center text-muted-foreground">{service.description}</CardDescription>
                </CardContent>
                <CardContent className="text-center">
                   <Button variant="link" asChild className="text-primary hover:text-accent">
                     <Link href="/services">Ver Detalles</Link>
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
           <div className="text-center mt-8">
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/services">Ver Todos los Servicios</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
