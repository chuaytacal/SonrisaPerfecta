
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
import { Checkbox } from "@/components/ui/checkbox"; 
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import type { Paciente, Persona, TipoDocumento, Sexo, EtiquetaPaciente, HistorialOdontograma } from "@/types"; 
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, differenceInYears, subYears } from "date-fns"
import { es } from "date-fns/locale";
import { CalendarIcon, Tag, UserSquare, User, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockPersonasData, mockEtiquetas } from "@/lib/data";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';


const pacienteFormSchema = z.object({
  // Persona fields
  tipoDocumento: z.enum(["DNI", "EXTRANJERIA", "PASAPORTE"], { required_error: "Seleccione un tipo de documento." }),
  numeroDocumento: z.string().min(1, { message: "El número de documento es requerido." }),
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  apellidoPaterno: z.string().min(2, { message: "El apellido paterno debe tener al menos 2 caracteres." }),
  apellidoMaterno: z.string().min(2, { message: "El apellido materno debe tener al menos 2 caracteres." }),
  fechaNacimiento: z.date({ required_error: "La fecha de nacimiento es requerida."}),
  sexo: z.enum(["M", "F"], { required_error: "Seleccione un sexo." }),
  direccion: z.string().min(1, {message: "La dirección es requerida."}),
  telefono: z.string().refine(isValidPhoneNumber, { message: "Número de teléfono inválido." }),
  
  // Paciente specific fields
  fechaIngreso: z.date({ required_error: "La fecha de ingreso es requerida."}), 
  estado: z.enum(["Activo", "Inactivo"], { required_error: "Seleccione un estado." }),
  etiquetas: z.array(z.string()).optional(),

  // Apoderado fields (optional)
  apoderado_tipoDocumento: z.enum(["DNI", "EXTRANJERIA", "PASAPORTE"]).optional(),
  apoderado_numeroDocumento: z.string().optional(),
  apoderado_nombre: z.string().optional(),
  apoderado_apellidoPaterno: z.string().optional(),
  apoderado_apellidoMaterno: z.string().optional(),
  apoderado_fechaNacimiento: z.date().optional(),
  apoderado_sexo: z.enum(["M", "F"]).optional(),
  apoderado_direccion: z.string().optional(),
  apoderado_telefono: z.string().optional().refine(value => !value || isValidPhoneNumber(value), {
    message: "Número de teléfono inválido para el apoderado.",
  }),
}).superRefine((data, ctx) => {
    if (data.tipoDocumento === 'DNI' && data.numeroDocumento.length !== 8) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El DNI debe tener 8 dígitos.",
            path: ["numeroDocumento"],
        });
    }
    if ((data.tipoDocumento === 'EXTRANJERIA' || data.tipoDocumento === 'PASAPORTE') && (data.numeroDocumento.length < 8 || data.numeroDocumento.length > 12)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe tener entre 8 y 12 caracteres.",
            path: ["numeroDocumento"],
        });
    }
    
    if (data.apoderado_tipoDocumento && data.apoderado_numeroDocumento) {
        if (data.apoderado_tipoDocumento === 'DNI' && data.apoderado_numeroDocumento.length !== 8) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El DNI debe tener 8 dígitos.", path: ["apoderado_numeroDocumento"] });
        }
        if ((data.apoderado_tipoDocumento === 'EXTRANJERIA' || data.apoderado_tipoDocumento === 'PASAPORTE') && (data.apoderado_numeroDocumento.length < 8 || data.apoderado_numeroDocumento.length > 12)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe tener entre 8 y 12 caracteres.", path: ["apoderado_numeroDocumento"] });
        }
    }

    if (!data.fechaNacimiento) return;
    const age = differenceInYears(new Date(), data.fechaNacimiento);
    if (age < 18) {
      if (!data.apoderado_tipoDocumento) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_tipoDocumento"] });
      if (!data.apoderado_numeroDocumento || data.apoderado_numeroDocumento.length < 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_numeroDocumento"] });
      if (!data.apoderado_nombre || data.apoderado_nombre.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_nombre"] });
      if (!data.apoderado_apellidoPaterno || data.apoderado_apellidoPaterno.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_apellidoPaterno"] });
      if (!data.apoderado_apellidoMaterno || data.apoderado_apellidoMaterno.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_apellidoMaterno"] });
      if (!data.apoderado_telefono) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teléfono requerido.", path: ["apoderado_telefono"] });
      if (!data.apoderado_sexo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_sexo"] });
      if (!data.apoderado_direccion) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_direccion"] });

      if (!data.apoderado_fechaNacimiento) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["apoderado_fechaNacimiento"] });
      } else {
        const apoderadoAge = differenceInYears(new Date(), data.apoderado_fechaNacimiento);
        if (apoderadoAge < 18) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El apoderado debe ser mayor de edad.", path: ["apoderado_fechaNacimiento"] });
        }
      }
    }
});


type PacienteFormValues = z.infer<typeof pacienteFormSchema>;

interface AddPacienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPacienteSaved: (paciente: Paciente, apoderado?: Persona) => void; 
  initialPacienteData?: Paciente | null;
  initialApoderadoData?: Persona | null;
  selectedPersonaToPreload?: Persona | null; 
  isCreatingNewPersonaFlow?: boolean; 
  pacienteList: Paciente[];
}

export function AddPacienteForm({
    open,
    onOpenChange,
    onPacienteSaved,
    initialPacienteData,
    initialApoderadoData,
    selectedPersonaToPreload,
    isCreatingNewPersonaFlow,
    pacienteList
}: AddPacienteFormProps) {
  const isEditMode = !!initialPacienteData; 
  const [isMinor, setIsMinor] = useState(false);

  const form = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteFormSchema),
    defaultValues: {
      tipoDocumento: "DNI",
      numeroDocumento: "",
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      sexo: "M",
      direccion: "",
      telefono: "",
      estado: "Activo",
      etiquetas: [],
      apoderado_tipoDocumento: "DNI",
      apoderado_direccion: "",
    },
  });

  const fechaNacimiento = form.watch("fechaNacimiento");

  useEffect(() => {
    if (fechaNacimiento) {
      const age = differenceInYears(new Date(), fechaNacimiento);
      const minor = age < 18;
      setIsMinor(minor);
      if (!minor) {
        form.setValue("apoderado_tipoDocumento", undefined);
        form.setValue("apoderado_numeroDocumento", undefined);
        form.setValue("apoderado_nombre", undefined);
        form.setValue("apoderado_apellidoPaterno", undefined);
        form.setValue("apoderado_apellidoMaterno", undefined);
        form.setValue("apoderado_sexo", undefined);
        form.setValue("apoderado_telefono", undefined);
        form.setValue("apoderado_fechaNacimiento", undefined);
        form.setValue("apoderado_direccion", undefined);
      }
    } else {
      setIsMinor(false);
    }
  }, [fechaNacimiento, form]);


  useEffect(() => {
    if (open) {
      form.reset(); // Reset form state and errors on open
      let defaultVals: Partial<PacienteFormValues> = {
        tipoDocumento: "DNI", numeroDocumento: "", nombre: "", apellidoPaterno: "", apellidoMaterno: "",
        sexo: "M", direccion: "", telefono: "",
        fechaIngreso: new Date(), estado: "Activo", etiquetas: [],
        apoderado_tipoDocumento: "DNI"
      };

      if (isEditMode && initialPacienteData) { 
        const persona = initialPacienteData.persona;
        defaultVals = {
            ...persona, 
            fechaNacimiento: new Date(persona.fechaNacimiento), 
            fechaIngreso: initialPacienteData.fechaIngreso ? new Date(initialPacienteData.fechaIngreso.split('/').reverse().join('-')) : new Date(),
            estado: initialPacienteData.estado,
            etiquetas: initialPacienteData.etiquetas || [],
        };
        if(initialApoderadoData) {
            defaultVals.apoderado_tipoDocumento = initialApoderadoData.tipoDocumento;
            defaultVals.apoderado_numeroDocumento = initialApoderadoData.numeroDocumento;
            defaultVals.apoderado_nombre = initialApoderadoData.nombre;
            defaultVals.apoderado_apellidoPaterno = initialApoderadoData.apellidoPaterno;
            defaultVals.apoderado_apellidoMaterno = initialApoderadoData.apellidoMaterno;
            defaultVals.apoderado_sexo = initialApoderadoData.sexo;
            defaultVals.apoderado_telefono = initialApoderadoData.telefono;
            defaultVals.apoderado_fechaNacimiento = initialApoderadoData.fechaNacimiento ? new Date(initialApoderadoData.fechaNacimiento) : undefined;
            defaultVals.apoderado_direccion = initialApoderadoData.direccion;
        }

      } else if (selectedPersonaToPreload && !isCreatingNewPersonaFlow) { 
        defaultVals = {
            ...selectedPersonaToPreload,
            fechaNacimiento: new Date(selectedPersonaToPreload.fechaNacimiento),
            fechaIngreso: new Date(),
            estado: "Activo",
            etiquetas: [],
        };
      } 
      form.reset(defaultVals);
    }
  }, [initialPacienteData, initialApoderadoData, selectedPersonaToPreload, isCreatingNewPersonaFlow, isEditMode, open, form]);


  const handleDocumentBlur = async () => {
    if (isEditMode || !isCreatingNewPersonaFlow) {
      return;
    }
  
    form.clearErrors("numeroDocumento");
  
    const isValid = await form.trigger("numeroDocumento");
    if (!isValid) return;
  
    const currentNumero = form.getValues("numeroDocumento");
  
    const patientExists = pacienteList.some(p => p.persona.numeroDocumento === currentNumero);
    if (patientExists) {
      form.setError("numeroDocumento", {
        type: "manual",
        message: "Este paciente ya está registrado.",
      });
      return;
    }
  
    const personaExists = mockPersonasData.find(p => p.numeroDocumento === currentNumero);
    if (personaExists) {
      const { id, email, ...personaFieldsToFill } = personaExists;
  
      form.reset({
        ...form.getValues(),
        ...personaFieldsToFill,
        fechaNacimiento: new Date(personaExists.fechaNacimiento),
      });
    }
  };


  async function onSubmit(values: PacienteFormValues) {
    let apoderadoPersona: Persona | undefined = undefined;
    const age = differenceInYears(new Date(), values.fechaNacimiento);

    if (age < 18) {
        apoderadoPersona = {
            id: (isEditMode && initialPacienteData?.idApoderado) || `persona-apoderado-${crypto.randomUUID()}`,
            tipoDocumento: values.apoderado_tipoDocumento!,
            numeroDocumento: values.apoderado_numeroDocumento!,
            nombre: values.apoderado_nombre!,
            apellidoPaterno: values.apoderado_apellidoPaterno!,
            apellidoMaterno: values.apoderado_apellidoMaterno!,
            fechaNacimiento: values.apoderado_fechaNacimiento!,
            sexo: values.apoderado_sexo!,
            direccion: values.apoderado_direccion!, 
            telefono: values.apoderado_telefono!,
            email: initialApoderadoData?.email || "", 
        };
    }

    const personaData: Persona = { 
        id: (isEditMode && initialPacienteData?.idPersona) || (selectedPersonaToPreload?.id) || `persona-${crypto.randomUUID()}`, 
        tipoDocumento: values.tipoDocumento,
        numeroDocumento: values.numeroDocumento,
        nombre: values.nombre,
        apellidoPaterno: values.apellidoPaterno,
        apellidoMaterno: values.apellidoMaterno,
        fechaNacimiento: values.fechaNacimiento,
        sexo: values.sexo,
        direccion: values.direccion,
        telefono: values.telefono,
        email: (isEditMode && initialPacienteData?.persona.email) || (selectedPersonaToPreload?.email) || "", 
    };
    
    let historial: HistorialOdontograma[] = initialPacienteData?.historialOdontogramas || [];
    if (!historial || historial.length === 0) {
      historial = [{
        id: `historial-odont-${crypto.randomUUID()}`,
        fechaCreacion: values.fechaIngreso,
        odontogramaPermanente: {},
        odontogramaPrimaria: {},
      }];
    }

    const pacienteOutput: Paciente = {
        // --- Fields from Form ---
        id: initialPacienteData?.id || `paciente-${crypto.randomUUID()}`, 
        idPersona: personaData.id,
        persona: personaData,
        fechaIngreso: format(values.fechaIngreso, "dd/MM/yyyy"),
        estado: values.estado,
        etiquetas: (values.etiquetas as EtiquetaPaciente[]) || [],
        idApoderado: apoderadoPersona?.id,
        
        // --- Explicit preservation of fields not in the form ---
        idHistoriaClinica: initialPacienteData?.idHistoriaClinica || '',
        notas: initialPacienteData?.notas,
        antecedentesMedicos: initialPacienteData?.antecedentesMedicos,
        odontogramaPermanente: initialPacienteData?.odontogramaPermanente,
        odontogramaPrimaria: initialPacienteData?.odontogramaPrimaria,
        historialOdontogramas: historial,
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    onPacienteSaved(pacienteOutput, apoderadoPersona); 
  }

  const tipoDocumentoOptions: TipoDocumento[] = ["DNI", "EXTRANJERIA", "PASAPORTE"];
  const sexoOptions: {label: string, value: Sexo}[] = [{label: "Masculino", value: "M"}, {label: "Femenino", value: "F"}];

  const title = isEditMode ? "Editar Paciente" : (isCreatingNewPersonaFlow ? "Registrar Nueva Persona y Paciente" : "Asignar Rol de Paciente");
  const description = isEditMode ? "Modifique los datos del paciente." : (isCreatingNewPersonaFlow ? "Complete los campos para la nueva persona y su rol." : "Complete los detalles del rol para la persona seleccionada.");

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
              <h3 className="text-md font-semibold text-muted-foreground border-b pb-1 flex items-center">
                <User className="mr-2 h-5 w-5" /> Datos del Paciente
              </h3>
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
                        <FormControl>
                          <Input 
                            placeholder="12345678" 
                            {...field} 
                            onBlur={handleDocumentBlur} 
                            disabled={isTipoDocNumDisabled} 
                          />
                        </FormControl>
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
                                <FormControl><RadioGroupItem value={opt.value} id={`sexo-paciente-${opt.value}`} /></FormControl>
                                <FormLabel htmlFor={`sexo-paciente-${opt.value}`} className="font-normal">{opt.label}</FormLabel>
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
                    <FormControl>
                      <PhoneInput
                        international
                        defaultCountry="PE"
                        placeholder="987 654 321"
                        {...field}
                        disabled={isOtherPersonaFieldsDisabled && !isEditMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-md font-semibold text-muted-foreground border-b pb-1 pt-4 flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" /> Datos de Rol (Paciente)
              </h3>
              <FormField
                control={form.control}
                name="fechaIngreso" 
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel className="mb-1.5">Fecha de Ingreso</FormLabel>
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
                  name="etiquetas"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel className="text-base flex items-center">
                          <Tag className="mr-2 h-5 w-5 text-muted-foreground" /> Etiquetas
                        </FormLabel>
                        <FormDescription>
                          Seleccione las etiquetas relevantes para el paciente.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                        {mockEtiquetas.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="etiquetas"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange(
                                              (field.value || []).filter(
                                                (value) => value !== item
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Activo" id="estado-activo-paciente" /></FormControl>
                          <FormLabel htmlFor="estado-activo-paciente" className="font-normal">Activo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Inactivo" id="estado-inactivo-paciente" /></FormControl>
                          <FormLabel htmlFor="estado-inactivo-paciente" className="font-normal">Inactivo</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isMinor && (
                <>
                  <h3 className="text-md font-semibold text-muted-foreground border-b pb-1 pt-4 flex items-center">
                    <UserSquare className="mr-2 h-5 w-5"/>
                    Datos del Apoderado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="apoderado_tipoDocumento"
                      render={({ field }) => (
                        <FormItem><FormLabel>Tipo de Documento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger></FormControl>
                            <SelectContent>{tipoDocumentoOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="apoderado_numeroDocumento"
                      render={({ field }) => (
                        <FormItem><FormLabel>Número de Documento</FormLabel>
                          <FormControl><Input placeholder="12345678" {...field} value={field.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField control={form.control} name="apoderado_nombre"
                    render={({ field }) => (
                      <FormItem><FormLabel>Nombres del Apoderado</FormLabel>
                        <FormControl><Input placeholder="Ej: Juan" {...field} value={field.value ?? ""} /></FormControl><FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="apoderado_apellidoPaterno"
                      render={({ field }) => (
                        <FormItem><FormLabel>Apellido Paterno</FormLabel>
                          <FormControl><Input placeholder="Ej: Perez" {...field} value={field.value ?? ""} /></FormControl><FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="apoderado_apellidoMaterno"
                      render={({ field }) => (
                        <FormItem><FormLabel>Apellido Materno</FormLabel>
                          <FormControl><Input placeholder="Ej: Gonzales" {...field} value={field.value ?? ""} /></FormControl><FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="apoderado_fechaNacimiento"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="mb-1.5">Fecha de Nacimiento</FormLabel>
                            <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP", {locale: es}) : <span>Seleccione fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > subYears(new Date(), 18) || date < new Date("1900-01-01")} initialFocus locale={es} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear() - 18}/>
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="apoderado_sexo"
                        render={({ field }) => (
                        <FormItem className="space-y-2 pt-2"><FormLabel>Sexo</FormLabel>
                            <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                {sexoOptions.map(opt => (
                                <FormItem key={`apoderado-sexo-${opt.value}`} className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value={opt.value} id={`apoderado-sexo-${opt.value}`} /></FormControl>
                                    <FormLabel htmlFor={`apoderado-sexo-${opt.value}`} className="font-normal">{opt.label}</FormLabel>
                                </FormItem>
                                ))}
                            </RadioGroup>
                            </FormControl><FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                  <FormField control={form.control} name="apoderado_direccion"
                    render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel>
                        <FormControl><Input placeholder="Av. Secundaria 456" {...field} value={field.value ?? ""} /></FormControl><FormMessage />
                        </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apoderado_telefono"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                            <PhoneInput
                                international
                                defaultCountry="PE"
                                placeholder="987 654 321"
                                {...field}
                                value={field.value ?? ""}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                </>
              )}


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
                        ? "Registrar Persona y Paciente"
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
