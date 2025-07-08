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
import { useForm } from "react-hook-form";
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
import type { Paciente, Persona, TipoDocumento, Sexo } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Tag, User, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import PhoneInput, {
  E164Number,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import api from "@/lib/api";

const pacienteFormSchema = z
  .object({
    // Persona fields
    tipoDocumento: z.enum(["DNI", "EXTRANJERIA", "PASAPORTE"], {
      required_error: "Seleccione un tipo de documento.",
    }),
    numeroDocumento: z
      .string()
      .min(1, { message: "El número de documento es requerido." }),
    nombre: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    apellidoPaterno: z.string().min(2, {
      message: "El apellido paterno debe tener al menos 2 caracteres.",
    }),
    apellidoMaterno: z.string().min(2, {
      message: "El apellido materno debe tener al menos 2 caracteres.",
    }),
    fechaNacimiento: z.date({
      required_error: "La fecha de nacimiento es requerida.",
    }),
    sexo: z.enum(["M", "F"], { required_error: "Seleccione un sexo." }),
    direccion: z.string().min(1, { message: "La dirección es requerida." }),
    telefono: z
      .string()
      .refine(isValidPhoneNumber, { message: "Número de teléfono inválido." }),

    // Paciente specific fields
    fechaIngreso: z.date({
      required_error: "La fecha de ingreso es requerida.",
    }),
    estado: z.enum(["Activo", "Inactivo"], {
      required_error: "Seleccione un estado.",
    }),
    etiquetas: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === "DNI" && data.numeroDocumento.length !== 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El DNI debe tener 8 dígitos.",
        path: ["numeroDocumento"],
      });
    }
    if (
      (data.tipoDocumento === "EXTRANJERIA" ||
        data.tipoDocumento === "PASAPORTE") &&
      (data.numeroDocumento.length < 8 || data.numeroDocumento.length > 12)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe tener entre 8 y 12 caracteres.",
        path: ["numeroDocumento"],
      });
    }
  });

type PacienteFormValues = z.infer<typeof pacienteFormSchema>;

interface AddPacienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPacienteSaved: () => void;
  initialPacienteData?: Paciente | null;
  selectedPersonaToPreload?: Persona | null;
  isCreatingNewPersonaFlow?: boolean;
  pacienteList: Paciente[];
}

export function AddPacienteForm({
  open,
  onOpenChange,
  onPacienteSaved,
  initialPacienteData,
  selectedPersonaToPreload,
  isCreatingNewPersonaFlow = true,
  pacienteList,
}: AddPacienteFormProps) {
  const isEditMode = !!(initialPacienteData && initialPacienteData.persona);
  const [availableTags, setAvailableTags] = useState<
    { uuid: string; name: string }[]
  >([]);
  const { toast } = useToast();

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
    },
  });

  useEffect(() => {
    if (open) {
      const fetchTags = async () => {
        try {
          const response = await api.get("/catalog/tags");
          setAvailableTags(response.data);
        } catch (error) {
          console.error("Error fetching tags:", error);
          toast({
            title: "Error al cargar etiquetas",
            description: "No se pudieron obtener las etiquetas del servidor.",
            variant: "destructive",
          });
        }
      };
      fetchTags();

      form.reset();
      let defaultVals: Partial<PacienteFormValues> = {
        tipoDocumento: "DNI",
        numeroDocumento: "",
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        sexo: "M",
        direccion: "",
        telefono: "",
        fechaIngreso: new Date(),
        estado: "Activo",
        notas: "",
        etiquetas: [],
      };

      if (isEditMode && initialPacienteData && initialPacienteData.persona) {
        const persona = initialPacienteData.persona;
        const phoneFromBackend = persona.telefono;
        const e164Phone = phoneFromBackend
          ? `+${phoneFromBackend.replace(/\s+/g, "")}`
          : "";

        defaultVals = {
          ...persona,
          telefono: e164Phone,
          fechaNacimiento: new Date(persona.fechaNacimiento + "T00:00:00"),
          fechaIngreso: initialPacienteData.fechaIngreso
            ? new Date(initialPacienteData.fechaIngreso + "T00:00:00")
            : new Date(),
          estado: initialPacienteData.estado,
          notas: initialPacienteData.notas || "",
          etiquetas: initialPacienteData.etiquetas || [],
        };

      } else if (selectedPersonaToPreload) {
        const phoneFromBackend = selectedPersonaToPreload.telefono;
        const e164Phone = phoneFromBackend
          ? `+${phoneFromBackend.replace(/\s+/g, "")}`
          : "";

        defaultVals = {
          ...selectedPersonaToPreload,
          telefono: e164Phone,
          fechaNacimiento: new Date(
            selectedPersonaToPreload.fechaNacimiento + "T00:00:00"
          ),
          fechaIngreso: new Date(),
          estado: "Activo",
          etiquetas: [],
        };
      }
      form.reset(defaultVals);
    }
  }, [initialPacienteData, isEditMode, open, form, toast]);

  const handleDocumentBlur = async () => {
    if (isEditMode || !isCreatingNewPersonaFlow) return;
    form.clearErrors("numeroDocumento");
    const isValid = await form.trigger("numeroDocumento");
    if (!isValid) return;
    const currentNumero = form.getValues("numeroDocumento");
    const patientExists = pacienteList.some(
      (p) => p.persona?.numeroDocumento === currentNumero
    );
    if (patientExists) {
      form.setError("numeroDocumento", {
        type: "manual",
        message: "Este paciente ya está registrado.",
      });
    }
  };

  async function onSubmit(values: PacienteFormValues) {
    const phone = values.telefono
      ? parsePhoneNumber(values.telefono as E164Number)
      : null;
    const formattedPhoneForBackend = phone
      ? `${phone.countryCallingCode}${phone.nationalNumber}`
      : "";

    const personaPayload = {
      tipoDocumento: values.tipoDocumento,
      numeroDocumento: values.numeroDocumento,
      nombre: values.nombre,
      apellidoPaterno: values.apellidoPaterno,
      apellidoMaterno: values.apellidoMaterno,
      fechaNacimiento: format(values.fechaNacimiento, "yyyy-MM-dd"),
      sexo: values.sexo,
      direccion: values.direccion,
      telefono: formattedPhoneForBackend,
    };

    const pacientePayload = {
      estado: values.estado,
      nota: "",
    };

    try {
      if (isEditMode && initialPacienteData && initialPacienteData?.persona) {
        // PATCH persona y paciente
        await api.patch(`/staff/person/${initialPacienteData.persona.uuid}`, personaPayload);
        await api.patch(`/patients/${initialPacienteData.id}`, pacientePayload);

        // Traer etiquetas actuales (desde backend)
        const response = await api.get(`/patient-tags`, {
          params: { idPaciente: initialPacienteData.id },
        });

        const etiquetasActuales: {
          idPacienteEtiqueta: string;
          tag: { name: string };
        }[] = response.data;

        const nombresActuales = etiquetasActuales
          .map((e) => e.tag?.name)
          .filter((name): name is string => !!name);

        const nombresNuevos = values.etiquetas || [];

        // Identificar etiquetas a ELIMINAR (desmarcadas)
        const etiquetasParaEliminar = etiquetasActuales.filter(
          (e) => e.tag?.name && !nombresNuevos.includes(e.tag.name)
        );

        // Identificar etiquetas a AGREGAR (marcadas nuevas)
        const etiquetasParaAgregar = availableTags
          .filter(
            (tag) =>
              nombresNuevos.includes(tag.name) &&
              !nombresActuales.includes(tag.name)
          )
          .map((tag) => tag.uuid);

        // Primero eliminar las etiquetas desmarcadas
        for (const et of etiquetasParaEliminar) {
          await api.delete(`/patient-tags/${et.idPacienteEtiqueta}`);
        }

        // Luego agregar etiquetas nuevas (evita duplicados)
        for (const tagUuid of etiquetasParaAgregar) {
          await api.post(`/patient-tags`, {
            idPaciente: initialPacienteData.id,
            idEtiqueta: tagUuid,
          });
        }

        toast({
          title: "Paciente Actualizado",
          description: "Los datos del paciente han sido actualizados.",
        });
      } else {
        // --- CREATE MODE ---
        let personaUuid: any;
        if (selectedPersonaToPreload && !isCreatingNewPersonaFlow) {
          // Usar persona ya existente
          personaUuid = selectedPersonaToPreload.uuid;
        } else {
          // Crear nueva persona
          const personaResponse = await api.post(`/staff/person`, personaPayload);
          personaUuid = personaResponse.data.uuid;
        }

        const pacienteResponse = await api.post(`/patients`, {
          ...pacientePayload,
          idPersona: personaUuid,
        });
        const newPaciente = pacienteResponse.data;
        const newPacienteUuid = newPaciente.idPaciente;

        const selectedTagUuids = values.etiquetas
          ? availableTags
              .filter((tag) => values.etiquetas!.includes(tag.name))
              .map((tag) => tag.uuid)
          : [];

        if (selectedTagUuids.length > 0 && newPacienteUuid) {
          const tagPromises = selectedTagUuids.map((tagUuid) =>
            api.post("/patient-tags", {
              idPaciente: newPacienteUuid,
              idEtiqueta: tagUuid,
            })
          );
          await Promise.all(tagPromises);
        }
        toast({
          title: "Registro Completo",
          description: `${values.nombre} ${values.apellidoPaterno} ha sido registrado exitosamente.`,
        });
      }

      onPacienteSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: `Error en el registro`,
        description:
          error.response?.data?.message ||
          error.message ||
          "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  }

  const tipoDocumentoOptions: TipoDocumento[] = [
    "DNI",
    "EXTRANJERIA",
    "PASAPORTE",
  ];
  const sexoOptions: { label: string; value: Sexo }[] = [
    { label: "Masculino", value: "M" },
    { label: "Femenino", value: "F" },
  ];
  const title = isEditMode ? "Editar Paciente" : "Registrar Paciente";
  const description = isEditMode
    ? "Modifique los datos del paciente."
    : "Complete los campos para registrar un nuevo paciente.";
  const isTipoDocNumDisabled =
    isEditMode || (!!selectedPersonaToPreload && !isCreatingNewPersonaFlow);
  const isOtherPersonaFieldsDisabled =
    !!selectedPersonaToPreload && !isCreatingNewPersonaFlow && !isEditMode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-2xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] md:max-h-[calc(85vh-150px)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-6 pb-6 pt-2"
            >
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={isTipoDocNumDisabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipoDocumentoOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
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
                      <FormLabel className="mb-1.5">
                        Fecha de Nacimiento
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isOtherPersonaFieldsDisabled}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccione fecha</span>
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
                          {sexoOptions.map((opt) => (
                            <FormItem
                              key={opt.value}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={opt.value}
                                  id={`sexo-paciente-${opt.value}`}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`sexo-paciente-${opt.value}`}
                                className="font-normal"
                              >
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
                        countryCallingCodeEditable={false}
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
                <ClipboardList className="mr-2 h-5 w-5" /> Datos Adicionales
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
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={() => {}} // Desactiva selección
                          disabled
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
                name="etiquetas"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel className="text-base flex items-center">
                        <Tag className="mr-2 h-5 w-5 text-muted-foreground" />{" "}
                        Etiquetas
                      </FormLabel>
                      <FormDescription>
                        Seleccione las etiquetas relevantes para el paciente.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      {availableTags.map((tag) => (
                        <FormField
                          key={tag.uuid}
                          control={form.control}
                          name="etiquetas"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={tag.uuid}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(tag.name)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            tag.name,
                                          ])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (value) => value !== tag.name
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {tag.name}
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
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value="Activo"
                              id="estado-activo-paciente"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="estado-activo-paciente"
                            className="font-normal"
                          >
                            Activo
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value="Inactivo"
                              id="estado-inactivo-paciente"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="estado-inactivo-paciente"
                            className="font-normal"
                          >
                            Inactivo
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                  disabled={form.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {form.formState.isSubmitting
                    ? isEditMode
                      ? "Guardando..."
                      : "Registrando..."
                    : isEditMode
                    ? "Guardar Cambios"
                    : "Registrar Paciente"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
