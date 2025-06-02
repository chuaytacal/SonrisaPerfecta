'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateServiceDescription } from '@/ai/flows/generate-service-description';
import { Wand2, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface ServiceAIDescriptionDialogProps {
  serviceName: string;
}

export default function ServiceAIDescriptionDialog({ serviceName }: ServiceAIDescriptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateDescription = async () => {
    setIsLoading(true);
    setDescription('');
    try {
      const result = await generateServiceDescription({ serviceName });
      setDescription(result.description);
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar la descripción. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          <Wand2 className="mr-2 h-4 w-4" />
          Generar Descripción (IA)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-primary">
            Descripción del Servicio Generada por IA
          </DialogTitle>
          <DialogDescription>
            Obtén una descripción detallada y atractiva para <span className="font-semibold text-foreground">{serviceName}</span>, generada por nuestra inteligencia artificial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <Button onClick={handleGenerateDescription} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Generando...' : `Generar para "${serviceName}"`}
            </Button>
          </div>
          {description && (
            <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-secondary/50">
              <p className="text-sm text-foreground whitespace-pre-wrap">{description}</p>
            </ScrollArea>
          )}
           {isLoading && !description && (
             <div className="h-[200px] w-full rounded-md border p-4 bg-secondary/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
           )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
