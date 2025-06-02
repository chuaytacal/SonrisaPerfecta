import type { Service } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ServiceAIDescriptionDialog from './ServiceAIDescriptionDialog';
import Link from 'next/link';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent = service.icon;

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        {IconComponent && (
          <div className="flex justify-center mb-3">
            <IconComponent className="h-10 w-10 text-primary" />
          </div>
        )}
        <CardTitle className="font-headline text-xl text-center text-primary">{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-muted-foreground text-center">
          {service.description}
        </CardDescription>
        {service.price && (
          <p className="text-center font-semibold text-accent mt-3">{service.price}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-4">
        <ServiceAIDescriptionDialog serviceName={service.name} />
        <Button variant="outline" asChild className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
          <Link href="/appointments">Agendar Cita</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
