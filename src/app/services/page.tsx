import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceCard from '@/components/services/ServiceCard';
import { servicesData } from '@/lib/data';
import type { ServiceCategory } from '@/types';
import { Stethoscope } from 'lucide-react';

const categories: ServiceCategory[] = ['Preventivo', 'Restaurador', 'Cosmético'];

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <div className="flex justify-center mb-4">
            <Stethoscope className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary mb-4">Nuestros Servicios Dentales</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ofrecemos una amplia gama de servicios para cubrir todas tus necesidades dentales, desde cuidados preventivos hasta tratamientos cosméticos avanzados.
        </p>
      </section>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesData
                .filter((service) => service.category === category)
                .map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
            </div>
             {servicesData.filter((service) => service.category === category).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay servicios disponibles en esta categoría por el momento.</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
