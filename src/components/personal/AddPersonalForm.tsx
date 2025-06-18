
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
import type { Personal } from "@/app/gestion-usuario/personal/page"; 
import type { Persona, TipoDocumento, Sexo } from "@/types"; 
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
  tipoDocumento: z.enum(["DNI", "EXTRANJERIA", "PASAPORTE"], { required_error: "Seleccione un tipo de documento." }),
  numeroDocumento: z.string().min(1, { message: "El número de documento es requerido." }),
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  apellidoPaterno: z.string().min(2, { message: "El apellido paterno debe tener al menos 2 caracteres." }),
  apellidoMaterno: z.string().min(2, { message: "El apellido materno debe tener al menos 2 caracteres." }),
  fechaNacimiento: z.date({ required_error: "La fecha de nacimiento es requerida."}),
  sexo: z.enum(["M", "F"], { required_error: "Seleccione un sexo." }),
  direccion: z.string().min(1, {message: "La dirección es requerida."}),
  telefono: z.string().min(9, { message: "El teléfono debe tener 9 dígitos y empezar con 9." }).regex(/^9\d{8}$/, { message: "Formato de teléfono inválido. Debe ser 9XXXXXXXX."}),
  fechaIngreso: z.date({ required_error: "La fecha de ingreso es requerida."}), 
  estado: z.enum(["Activo", "Inactivo"], { required_error: "Seleccione un estado." }),
});

type PersonalFormValues = z.infer<typeof personalFormSchema>;

interface AddPersonalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffSaved: (staff: Personal) => void;
  initialPersonalData?: Personal | null; 
  selectedPersonaToPreload?: Persona | null; 
  isCreatingNewPersonaFlow?: boolean; 
}

export function AddPersonalForm({
    open,
    onOpenChange,
    onStaffSaved,
    initialPersonalData,
    selectedPersonaToPreload,
    isCreatingNewPersonaFlow
}: AddPersonalFormProps) {
  const isEditMode = !!initialPersonalData; 

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      tipoDocumento: "DNI",
      numeroDocumento: "",
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      fechaNacimiento: new Date(),
      sexo: "M",
      direccion: "",
      telefono: "",
      fechaIngreso: new Date(),
      estado: "Activo",
    },
  });

  useEffect(() => {
    if (open) {
      let defaultVals: Partial<PersonalFormValues> = {
        tipoDocumento: "DNI", numeroDocumento: "", nombre: "", apellidoPaterno: "", apellidoMaterno: "",
        fechaNacimiento: new Date(), sexo: "M", direccion: "", telefono: "",
        fechaIngreso: new Date(), estado: "Activo",
      };

      if (isEditMode && initialPersonalData) { 
        const persona = initialPersonalData.persona;
        defaultVals = {
            ...persona, 
            fechaNacimiento: new Date(persona.fechaNacimiento), 
            fechaIngreso: initialPersonalData.fechaIngreso ? new Date(initialPersonalData.fechaIngreso.split('/').reverse().join('-')) : new Date(),
            estado: initialPersonalData.estado,
        };
      } else if (selectedPersonaToPreload && !isCreatingNewPersonaFlow) { 
        defaultVals = {
            ...selectedPersonaToPreload,
            fechaNacimiento: new Date(selectedPersonaToPreload.fechaNacimiento),
            fechaIngreso: new Date(),
            estado: "Activo",
        };
      } else if (isCreatingNewPersonaFlow) { 
        // Default values are already fine for creating a new persona
      }
      form.reset(defaultVals);
    }
  }, [initialPersonalData, selectedPersonaToPreload, isCreatingNewPersonaFlow, isEditMode, open, form]);


  async function onSubmit(values: PersonalFormValues) {
    // Ensure email from existing persona (if any) is preserved, otherwise default to empty or a new one if applicable
    const emailToSave = (isEditMode && initialPersonalData?.persona.email) || 
                        (selectedPersonaToPreload?.email) || 
                        (initialPersonalData?.persona.email) || // Fallback to initial if editing but no persona was preloaded (shouldn't happen with current flow)
                        ""; // Default to empty string if truly new and no email logic is present

    const personaData: Persona = { 
        id: (isEditMode && initialPersonalData?.idPersona) || (selectedPersonaToPreload?.id) || `persona-${crypto.randomUUID()}`, 
        tipoDocumento: values.tipoDocumento,
        numeroDocumento: values.numeroDocumento,
        nombre: values.nombre,
        apellidoPaterno: values.apellidoPaterno,
        apellidoMaterno: values.apellidoMaterno,
        fechaNacimiento: values.fechaNacimiento,
        sexo: values.sexo,
        direccion: values.direccion,
        telefono: values.telefono,
        email: emailToSave, // Use the determined email
    };

    const personalOutput: Personal = {
        id: initialPersonalData?.id || `personal-${crypto.randomUUID()}`, // Reuse existing ID if editing, else generate new
        idPersona: personaData.id,
        persona: personaData,
        // especialidad: values.especialidad, // Campo eliminado
        fechaIngreso: format(values.fechaIngreso, "dd/MM/yyyy"),
        estado: values.estado,
        // avatarUrl: values.avatarUrl || "", // Campo eliminado
    };

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onStaffSaved(personalOutput); // Trigger the save callback
  }

  const tipoDocumentoOptions: TipoDocumento[] = ["DNI", "EXTRANJERIA", "PASAPORTE"];
  const sexoOptions: {label: string, value: Sexo}[] = [{label: "Masculino", value: "M"}, {label: "Femenino", value: "F"}];
  // const especialidadOptions = ["Ortodoncia", "Endodoncia", "Periodoncia", "Odontopediatría", "Cirugía Oral", "General"]; // Campo eliminado

  const title = isEditMode ? "Editar Personal" : (isCreatingNewPersonaFlow ? "Registrar Nueva Persona y Personal" : "Asignar Rol de Personal");
  const description = isEditMode ? "Modifique los datos del miembro del personal." : (isCreatingNewPersonaFlow ? "Complete los campos para la nueva persona y su rol." : "Complete los detalles del rol para la persona seleccionada.");

  // Determine if Persona fields should be disabled
  const isTipoDocNumDisabled = isEditMode || (!!selectedPersonaToPreload && !isCreatingNewPersonaFlow);
  const isOtherPersonaFieldsDisabled = (!!selectedPersonaToPreload && !isCreatingNewPersonaFlow && !isEditMode);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-2xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] md:max-h-[calc(85vh-150px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
              <h3 className="text-md font-semibold text-muted-foreground border-b pb-1">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="tipoDocumento"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isTipoDocNumDisabled}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {tipoDocumentoOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="numeroDocumento"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Número de Documento</FormLabel>
                        <FormControl><Input placeholder="12345678" {...field} disabled={isTipoDocNumDisabled} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres</FormLabel>
                    <FormControl><Input placeholder="Ej: Ana" {...field} disabled={isOtherPersonaFieldsDisabled && !isEditMode} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="apellidoPaterno"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Apellido Paterno</FormLabel>
                        <FormControl><Input placeholder="Ej: Torres" {...field} disabled={isOtherPersonaFieldsDisabled && !isEditMode} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="apellidoMaterno"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Apellido Materno</FormLabel>
                        <FormControl><Input placeholder="Ej: Quispe" {...field} disabled={isOtherPersonaFieldsDisabled && !isEditMode} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel className="mb-1.5">Fecha de Nacimiento</FormLabel>
                        <Popover><PopoverTrigger asChild>
                        <FormControl>
                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={isOtherPersonaFieldsDisabled && !isEditMode}>
                            {field.value ? format(field.value, "PPP", {locale: es}) : <span>Seleccione fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus locale={es} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()}/>
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                    <FormItem className="space-y-2 pt-2">
                        <FormLabel>Sexo</FormLabel>
                        <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4" disabled={isOtherPersonaFieldsDisabled && !isEditMode}>
                            {sexoOptions.map(opt => (
                                <FormItem key={opt.value} className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value={opt.value} id={`sexo-${opt.value}`} /></FormControl>
                                <FormLabel htmlFor={`sexo-${opt.value}`} className="font-normal">{opt.label}</FormLabel>
                                </FormItem>
                            ))}
                        </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl><Input placeholder="Av. Principal 123" {...field} disabled={isOtherPersonaFieldsDisabled && !isEditMode} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="telefono"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl><Input placeholder="987654321" {...field} disabled={isOtherPersonaFieldsDisabled && !isEditMode} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
              />
              
              <h3 className="text-md font-semibold text-muted-foreground border-b pb-1 pt-4">Datos del Personal</h3>
              {/* Especialidad and AvatarURL fields are removed */}
              <FormField
                control={form.control}
                name="fechaIngreso" 
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel className="mb-1.5">Fecha de Ingreso (Personal)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP", {locale: es}) : <span>Seleccione fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus locale={es} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()}/>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
                />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Estado (Personal)</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Activo" id="estado-activo-personal" /></FormControl>
                          <FormLabel htmlFor="estado-activo-personal" className="font-normal">Activo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Inactivo" id="estado-inactivo-personal" /></FormControl>
                          <FormLabel htmlFor="estado-inactivo-personal" className="font-normal">Inactivo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                  {form.formState.isSubmitting
                    ? isEditMode
                      ? 'Guardando...'
                      : isCreatingNewPersonaFlow
                        ? 'Registrando...'
                        : 'Asignando...'
                    : isEditMode
                      ? "Guardar Cambios"
                      : isCreatingNewPersonaFlow
                        ? "Registrar Persona y Personal"
                        : "Asignar Rol"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

