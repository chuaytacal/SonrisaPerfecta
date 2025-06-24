
"use client";

import React, { useEffect } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Procedimiento } from '@/types';

const procedimientoSchema = z.object({
  denominacion: z.string().min(3, "La denominación debe tener al menos 3 caracteres."),
  descripcion: z.string().min(3, "La descripción es requerida."),
  precioBase: z.coerce.number().min(0, "El precio base no puede ser negativo."),
});

type ProcedimientoFormValues = z.infer<typeof procedimientoSchema>;

interface AddProcedimientoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (procedimiento: Procedimiento) => void;
  editingItem?: Procedimiento | null;
}

export function AddProcedimientoModal({ isOpen, onOpenChange, onSave, editingItem }: AddProcedimientoModalProps) {
  const form = useForm<ProcedimientoFormValues>({
    resolver: zodResolver(procedimientoSchema),
    defaultValues: { denominacion: '', descripcion: '', precioBase: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        form.reset(editingItem);
      } else {
        form.reset({ denominacion: '', descripcion: '', precioBase: 0 });
      }
    }
  }, [isOpen, editingItem, form]);

  const onSubmit = (data: ProcedimientoFormValues) => {
    const id = editingItem?.id || `proc-${crypto.randomUUID()}`;
    const newItem = { id, ...data };
    onSave(newItem);
    onOpenChange(false);
  };

  const title = editingItem ? 'Editar Procedimiento' : 'Nuevo Procedimiento';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Complete los campos para registrar el procedimiento.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
              <FormField control={form.control} name="denominacion" render={({ field }) => ( <FormItem><FormLabel>Denominación</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="descripcion" render={({ field }) => ( <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField
                control={form.control}
                name="precioBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Base</FormLabel>
                    <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <div className="flex h-10 items-center justify-center bg-muted px-3 border-r">
                        <span className="text-sm text-muted-foreground">S/</span>
                      </div>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
