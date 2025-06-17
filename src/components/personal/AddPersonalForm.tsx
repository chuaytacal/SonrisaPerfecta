
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import type { Personal } from "@/app/gestion-usuario/personal/lista/page";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";


const personalFormSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  dni: z.string().length(8, { message: "El DNI debe tener 8 caracteres." }).regex(/^\d+$/, { message: "El DNI solo debe contener números."}),
  contacto: z.string().min(9, { message: "El teléfono debe tener al menos 9 caracteres." }).regex(/^(?:\+51\s?)?(9\d{8})$/, { message: "Formato de teléfono peruano inválido (ej: +51 987654321 o 987654321)."}),
  email: z.string().email({ message: "Email inválido." }),
  especialidad: z.string().min(1, { message: "Seleccione una especialidad." }),
  fechaIngreso: z.date({ required_error: "La fecha de ingreso es requerida."}),
  estado: z.enum(["Activo", "Inactivo"], { required_error: "Seleccione un estado." }),
  avatarUrl: z.string().url({message: "URL de avatar inválida"}).optional().or(z.literal('')),
});

type PersonalFormValues = z.infer<typeof personalFormSchema>;

interface AddPersonalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffAdded?: (staff: Personal) => void; 
  initialData?: Personal | null;
}

export function AddPersonalForm({ open, onOpenChange, onStaffAdded, initialData }: AddPersonalFormProps) {
  const { toast } = useToast();
  const isEditMode = !!initialData;

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      nombre: "",
      dni: "",
      contacto: "",
      email: "",
      especialidad: "",
      fechaIngreso: new Date(),
      estado: "Activo",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (open) { // Only reset form when dialog opens
      if (initialData) {
        form.reset({
          ...initialData,
          fechaIngreso: initialData.fechaIngreso ? new Date(initialData.fechaIngreso.split('/').reverse().join('-')) : new Date(),
          avatarUrl: initialData.avatarUrl || "",
        });
      } else {
        form.reset({
          nombre: "",
          dni: "",
          contacto: "",
          email: "",
          especialidad: "",
          fechaIngreso: new Date(),
          estado: "Activo",
          avatarUrl: "",
        });
      }
    }
  }, [initialData, form, open]);


  async function onSubmit(values: PersonalFormValues) {
    const formattedValues: Personal = {
        id: initialData?.id || crypto.randomUUID(),
        ...values,
        fechaIngreso: format(values.fechaIngreso, "dd/MM/yyyy"),
        avatarUrl: values.avatarUrl || undefined, // Ensure empty string becomes undefined if desired for API
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: isEditMode ? "Personal Actualizado" : "Personal Registrado",
      description: `${values.nombre} ha sido ${isEditMode ? 'actualizado' : 'añadido'} exitosamente.`,
    });
    
    if (onStaffAdded) {
      onStaffAdded(formattedValues);
    }
    onOpenChange(false); 
  }

  const especialidades = [
    "Ortodoncia", "Endodoncia", "Periodoncia", "Implantología",
    "Odontopediatría", "Cirugía", "Estética Dental", "General", "Administrativo", "Asistente Dental", "Recepción"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-lg p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{isEditMode ? "Editar Personal" : "Añadir Nuevo Personal"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Modifique los datos del miembro del personal." : "Complete los campos para registrar un nuevo miembro del personal."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] md:max-h-[calc(80vh-100px)]"> {/* Adjusted max height for scroll area */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 pt-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Dra. Ana Torres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                          <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="contacto"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                          <Input placeholder="+51 987654321" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>URL de Avatar (Opcional)</FormLabel>
                      <FormControl>
                          <Input placeholder="https://ejemplo.com/avatar.png" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                  control={form.control}
                  name="especialidad"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Seleccione una especialidad" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {especialidades.map((esp) => (
                              <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="fechaIngreso"
                  render={({ field }) => (
                      <FormItem className="flex flex-col">
                          <FormLabel className="mb-1.5">Fecha de Ingreso</FormLabel>
                          <Popover>
                              <PopoverTrigger asChild>
                              <FormControl>
                                  <Button
                                  variant={"outline"}
                                  className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                  )}
                                  >
                                  {field.value ? (
                                      format(field.value, "PPP", {locale: es})
                                  ) : (
                                      <span>Seleccione una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                              </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  locale={es}
                              />
                              </PopoverContent>
                          </Popover>
                          <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Activo" id="estado-activo" />
                          </FormControl>
                          <FormLabel htmlFor="estado-activo" className="font-normal">Activo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Inactivo" id="estado-inactivo" />
                          </FormControl>
                          <FormLabel htmlFor="estado-inactivo" className="font-normal">Inactivo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="p-6 pt-2 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                  {form.formState.isSubmitting ? (isEditMode ? "Actualizando..." : "Registrando...") : (isEditMode ? "Guardar Cambios" : "Registrar Personal")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
