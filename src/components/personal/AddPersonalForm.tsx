"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import React, { useEffect, useMemo, useState } from "react";
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
import type { Personal, Persona, TipoDocumento, Sexo, Rol, Usuario } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, User, ClipboardList, Eye, EyeOff, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,30}$/;

type PersonalFormValues = z.infer<ReturnType<typeof createPersonalFormSchema>>;

interface AddPersonalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffSaved: (personalOutput: Personal, usuarioOutput: Usuario) => void;
  initialPersonalData?: Personal | null;
  initialUsuarioData?: Usuario | null;
  selectedPersonaToPreload?: Persona | null;
  isCreatingNewPersonaFlow?: boolean;
  personalList: Personal[];
}

const createPersonalFormSchema = (initialUsuarioData?: Usuario | null) => z.object({
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
  
  // Personal specific fields
  fechaIngreso: z.date({ required_error: "La fecha de ingreso es requerida."}), 
  estado: z.enum(["Activo", "Inactivo"], { required_error: "Seleccione un estado." }),

  // Usuario fields
  email: z.string().email({ message: "Debe ser un email válido" }),
  usuario: z.string().min(3, { message: "El usuario debe tener al menos 3 caracteres." }),
  rol: z.enum(["Administrador", "Doctor", "Secretaria"], { required_error: "Seleccione un rol." }),
  contrasena: z.string().optional(),
  confirmarContrasena: z.string().optional(),

}).superRefine((data, ctx) => {
    if (data.tipoDocumento === 'DNI' && data.numeroDocumento.length !== 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El DNI debe tener 8 dígitos.", path: ["numeroDocumento"] });
    }
    if ((data.tipoDocumento === 'EXTRANJERIA' || data.tipoDocumento === 'PASAPORTE') && (data.numeroDocumento.length < 8 || data.numeroDocumento.length > 12)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe tener entre 8 y 12 caracteres.", path: ["numeroDocumento"] });
    }
    
    if (!initialUsuarioData && (!data.contrasena || !data.confirmarContrasena)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La contraseña es requerida para nuevos usuarios.", path: ["contrasena"] });
    }

    if (data.contrasena || data.confirmarContrasena) {
        if (data.contrasena !== data.confirmarContrasena) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las contraseñas no coinciden.", path: ["confirmarContrasena"] });
        }
        if (data.contrasena && !passwordRegex.test(data.contrasena)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe tener 5-30 caracteres, incl. mayúscula, minúscula y número.", path: ["contrasena"] });
        }
    }
});

export function AddPersonalForm({
    open,
    onOpenChange,
    onStaffSaved,
    initialPersonalData,
    initialUsuarioData,
    selectedPersonaToPreload,
    isCreatingNewPersonaFlow,
    personalList
}: AddPersonalFormProps) {
  const isEditMode = !!initialPersonalData; 
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const personalFormSchema = useMemo(() => createPersonalFormSchema(initialUsuarioData), [initialUsuarioData]);

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
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
      rol: "Doctor",
      usuario: "",
      email: "",
      contrasena: "",
      confirmarContrasena: "",
    },
  });

  const watchNombre = form.watch("nombre");
  const watchApellidoPaterno = form.watch("apellidoPaterno");
  const watchApellidoMaterno = form.watch("apellidoMaterno");

  useEffect(() => {
    if (!isUsernameManuallyEdited && !isEditMode && watchNombre && watchApellidoPaterno && watchApellidoMaterno) {
      const inicialNombre = watchNombre.charAt(0).toLowerCase();
      const apellidoPaternoSanitized = watchApellidoPaterno.toLowerCase().replace(/\s+/g, '');
      const inicialMaterno = watchApellidoMaterno.charAt(0).toLowerCase();
      form.setValue('usuario', `${inicialNombre}${apellidoPaternoSanitized}${inicialMaterno}`);
    }
  }, [watchNombre, watchApellidoPaterno, watchApellidoMaterno, isUsernameManuallyEdited, isEditMode, form]);

  useEffect(() => {
    if (open) {
      form.reset();
      setShowPassword(false);
      setIsUsernameManuallyEdited(isEditMode);
      
      let defaultVals: Partial<PersonalFormValues> = {
        tipoDocumento: "DNI", 
        sexo: "M", 
        estado: "Activo", 
        rol: "Doctor",
        fechaIngreso: new Date(), 
        fechaNacimiento: new Date(),
        numeroDocumento: "", 
        nombre: "", 
        apellidoPaterno: "", 
        apellidoMaterno: "",
        direccion: "", 
        telefono: "", 
        usuario: "", 
        email: "",
        contrasena: "", 
        confirmarContrasena: ""
      };

      if (isEditMode && initialPersonalData) { 
        const persona = initialPersonalData.persona;
        defaultVals = {
            ...persona, 
            fechaNacimiento: new Date(persona.fechaNacimiento), 
            fechaIngreso: initialPersonalData.fechaIngreso ? new Date(initialPersonalData.fechaIngreso) : new Date(),
            estado: initialPersonalData.estado,
            usuario: initialUsuarioData?.usuario || "",
            rol: initialUsuarioData?.rol || "Doctor",
            email: persona.email || "",
            contrasena: "", // Dejamos vacío intencionalmente para no exponer la contraseña
            confirmarContrasena: ""
        };
      } else if (selectedPersonaToPreload && !isCreatingNewPersonaFlow) { 
        defaultVals = {
            ...selectedPersonaToPreload,
            fechaNacimiento: new Date(selectedPersonaToPreload.fechaNacimiento),
            fechaIngreso: new Date(),
            estado: "Activo",
            email: selectedPersonaToPreload.email || "",
            rol: "Doctor",
            usuario: "",
            contrasena: "",
            confirmarContrasena: ""
        };
      }
      form.reset(defaultVals);
    }
  }, [initialPersonalData, initialUsuarioData, selectedPersonaToPreload, isCreatingNewPersonaFlow, isEditMode, open, form]);

  const handleDocumentBlur = async () => {
    if (isEditMode || !isCreatingNewPersonaFlow) return;
    form.clearErrors("numeroDocumento");
    const isValid = await form.trigger("numeroDocumento");
    if (!isValid) return;
    const currentNumero = form.getValues("numeroDocumento");
    const staffExists = personalList.some(p => p.persona.numeroDocumento === currentNumero);
    if (staffExists) {
      form.setError("numeroDocumento", { type: "manual", message: "Este personal ya está registrado." });
      return;
    }
  };

  async function onSubmit(values: PersonalFormValues) {
    setIsSubmitting(true);
    
    try {
      // 1. Crear/Actualizar persona en el backend
      const personaMethod = isEditMode ? 'PATCH' : 'POST';
      const personaUrl = isEditMode 
        ? `http://localhost:3001/api/staff/person/${initialPersonalData?.idPersona}`
        : 'http://localhost:3001/api/staff/person';

      const personaResponse = await fetch(personaUrl, {
        method: personaMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipoDocumento: values.tipoDocumento,
          numeroDocumento: values.numeroDocumento,
          nombre: values.nombre,
          apellidoPaterno: values.apellidoPaterno,
          apellidoMaterno: values.apellidoMaterno,
          fechaNacimiento: format(values.fechaNacimiento, 'yyyy-MM-dd'),
          sexo: values.sexo,
          direccion: values.direccion,
          telefono: values.telefono.replace(/\D/g, ''),
          isActive: values.estado === "Activo" // Asegúrate que el backend espera este campo
        })
      });

      if (!personaResponse.ok) {
        const errorData = await personaResponse.json();
        throw new Error(errorData.message || 'Error al crear/actualizar la persona');
      }

      const personaData = await personaResponse.json();

      // 2. Crear/Actualizar especialista en el backend
      const specialistMethod = isEditMode ? 'PATCH' : 'POST';
      const specialistUrl = isEditMode 
        ? `http://localhost:3001/api/staff/specialist/${initialPersonalData?.id}`
        : 'http://localhost:3001/api/staff/specialist';

      const specialistResponse = await fetch(specialistUrl, {
        method: specialistMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuidPersona: personaData.uuid,
          fechaIngreso: format(values.fechaIngreso, 'yyyy-MM-dd'),
          estado: values.estado // Asegúrate que el backend recibe este campo
        })
      });

      if (!specialistResponse.ok) {
        const errorData = await specialistResponse.json();
        throw new Error(errorData.message || 'Error al crear/actualizar el especialista');
      }

      const specialistData = await specialistResponse.json();

      // 3. Manejo del usuario
      let userData;
      if (isEditMode && initialUsuarioData) {
        // Actualizar usuario existente
        const userUpdateResponse = await fetch(`http://localhost:3001/api/auth/user/${initialUsuarioData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            username: values.usuario,
            password: values.contrasena || undefined, // Solo enviar si hay cambio
            rol: values.rol
          })
        });

        if (!userUpdateResponse.ok) {
          const errorData = await userUpdateResponse.json();
          throw new Error(errorData.message || 'Error al actualizar el usuario');
        }
        userData = await userUpdateResponse.json();
      } else {
        // Crear nuevo usuario
        const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            username: values.usuario,
            password: values.contrasena,
            rol: values.rol,
            uuidEspecialista: specialistData.uuid
          })
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          throw new Error(errorData.message || 'Error al registrar el usuario');
        }
        userData = await registerResponse.json();
      }

      // Construir objeto personal completo para la lista
      const personalOutput: Personal = {
        id: specialistData.uuid,
        idPersona: personaData.id,
        persona: {
          ...personaData,
          isActive: values.estado === "Activo"
        },
        fechaIngreso: format(values.fechaIngreso, 'yyyy-MM-dd'),
        estado: values.estado,
        rol: values.rol,
        idUsuario: userData.id
      };

      const usuarioOutput: Usuario = {
        id: userData.id,
        usuario: values.usuario,
        rol: values.rol
      };

      onStaffSaved(personalOutput, usuarioOutput);

      toast({
        title: "Éxito",
        description: `Personal ${isEditMode ? 'actualizado' : 'registrado'} correctamente`,
        variant: "default",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar personal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const tipoDocumentoOptions: TipoDocumento[] = ["DNI", "EXTRANJERIA", "PASAPORTE"];
  const rolOptions: Rol[] = ["Administrador", "Doctor", "Secretaria"];
  const sexoOptions: {label: string, value: Sexo}[] = [
    {label: "Masculino", value: "M"}, 
    {label: "Femenino", value: "F"}
  ];

  const title = isEditMode ? "Editar Personal" : (isCreatingNewPersonaFlow ? "Registrar Nueva Persona y Personal" : "Asignar Rol de Personal");
  const description = isEditMode ? "Modifique los datos del miembro del personal." : (isCreatingNewPersonaFlow ? "Complete los campos para la nueva persona y su rol." : "Complete los detalles del rol para la persona seleccionada.");
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
                <User className="mr-2 h-5 w-5" /> Datos Personales
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
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipoDocumentoOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
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
                    <FormControl>
                      <Input 
                        placeholder="Ej: Ana" 
                        {...field} 
                        disabled={isOtherPersonaFieldsDisabled} 
                      />
                    </FormControl>
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
                      <FormControl>
                        <Input 
                          placeholder="Ej: Torres" 
                          {...field} 
                          disabled={isOtherPersonaFieldsDisabled} 
                        />
                      </FormControl>
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
                      <FormControl>
                        <Input 
                          placeholder="Ej: Quispe" 
                          {...field} 
                          disabled={isOtherPersonaFieldsDisabled} 
                        />
                      </FormControl>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button 
                              variant={"outline"} 
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} 
                              disabled={isOtherPersonaFieldsDisabled}
                            >
                              {field.value ? format(field.value, "PPP", {locale: es}) : <span>Seleccione fecha</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar 
                            mode="single" 
                            selected={field.value} 
                            onSelect={field.onChange} 
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")} 
                            initialFocus 
                            locale={es} 
                            captionLayout="dropdown-buttons" 
                            fromYear={1900} 
                            toYear={new Date().getFullYear()}
                          />
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
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          className="flex space-x-4" 
                          disabled={isOtherPersonaFieldsDisabled}
                        >
                          {sexoOptions.map(opt => (
                            <FormItem key={opt.value} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={opt.value} id={`sexo-${opt.value}`} />
                              </FormControl>
                              <FormLabel htmlFor={`sexo-${opt.value}`} className="font-normal">
                                {opt.label}
                              </FormLabel>
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
                    <FormControl>
                      <Input 
                        placeholder="Av. Principal 123" 
                        {...field} 
                        disabled={isOtherPersonaFieldsDisabled} 
                      />
                    </FormControl>
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
                        disabled={isOtherPersonaFieldsDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <h3 className="text-md font-semibold text-muted-foreground border-b pb-1 pt-4 flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" /> Datos del Personal
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
                          <Button 
                            variant={"outline"} 
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", {locale: es}) : <span>Seleccione fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                          mode="single" 
                          selected={field.value} 
                          onSelect={field.onChange} 
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")} 
                          initialFocus 
                          locale={es} 
                          captionLayout="dropdown-buttons" 
                          fromYear={1900} 
                          toYear={new Date().getFullYear()}
                        />
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
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Activo" id="estado-activo-personal" />
                          </FormControl>
                          <FormLabel htmlFor="estado-activo-personal" className="font-normal">
                            Activo
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Inactivo" id="estado-inactivo-personal" />
                          </FormControl>
                          <FormLabel htmlFor="estado-inactivo-personal" className="font-normal">
                            Inactivo
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <h3 className="text-md font-semibold text-muted-foreground border-b pb-1 pt-4 flex items-center">
                <KeyRound className="mr-2 h-5 w-5" /> Datos de Usuario
              </h3>
              
              <FormField 
                control={form.control} 
                name="email" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: usuario@clinica.com" 
                        {...field} 
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="usuario" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: atorresq" 
                          {...field} 
                          onChange={(e) => { 
                            field.onChange(e); 
                            setIsUsernameManuallyEdited(true); 
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                
                <FormField 
                  control={form.control} 
                  name="rol" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rolOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField 
                    control={form.control} 
                    name="contrasena" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? 'text' : 'password'} 
                              placeholder={isEditMode ? 'Dejar en blanco para no cambiar' : '********'} 
                              {...field} 
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" 
                            onClick={() => setShowPassword(prev => !prev)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                  
                  <FormField 
                    control={form.control} 
                    name="confirmarContrasena" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? 'text' : 'password'} 
                              placeholder="Repita la contraseña" 
                              {...field} 
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" 
                            onClick={() => setShowPassword(prev => !prev)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </div>
              
              <DialogFooter className="pt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)} 
                  className="w-full sm:w-auto" 
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full sm:w-auto"
                >
                  {isSubmitting
                    ? isEditMode ? 'Guardando...' : 'Registrando...'
                    : isEditMode ? "Guardar Cambios" : "Registrar Personal"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}