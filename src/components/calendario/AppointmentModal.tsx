"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Trash2, XIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Appointment, AppointmentFormData } from "@/types/calendar";
import type { Procedimiento } from "@/types";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  mockPacientesData,
  mockPersonalData,
  mockMotivosCita,
  mockProcedimientos,
  mockUsuariosData,
} from "@/lib/data";
import api from "@/lib/api";

const appointmentFormSchema = z.object({
  idPaciente: z.string().min(1, "Debe seleccionar un paciente."),
  idDoctor: z.string().min(1, "Debe seleccionar un doctor."),
  idMotivoCita: z.string().min(1, "Debe seleccionar un motivo."),
  fecha: z.date({ required_error: "La fecha es requerida." }),
  horaInicio: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (HH:MM)."),
  duracion: z.number().min(5, "La duración debe ser al menos 5 minutos."),
  procedimientos: z.array(z.custom<Procedimiento>()).default([]),
  estado: z.enum([
    "confirmada",
    "pendiente",
    "cancelada",
    "atendido",
    "reprogramada",
  ]),
  notas: z.string().optional(),
});

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: AppointmentFormData) => void;
  onDelete?: (appointmentId: string) => void;
  existingAppointment?: Appointment | null;
  selectedSlot?: { start: Date; end: Date } | null;
  defaultPatientId?: string;
}

export function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingAppointment,
  selectedSlot,
  defaultPatientId,
}: AppointmentModalProps) {
  const [pacienteOptions, setPacienteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [doctorOptions, setDoctorOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [motivoCitaOptions, setMotivoCitaOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [procedimientoOptions, setProcedimientoOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [procedimientosSeleccionados, setProcedimientosSeleccionados] =
    useState<Procedimiento[]>([]);

  const duracionOptions = useMemo(() => {
    const options: { label: string; value: number }[] = [];
    options.push({ label: "15 minutos", value: 15 });

    for (let i = 1; i <= 47; i++) {
      const totalMinutes = i * 30;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      let label = "";
      if (hours > 0) {
        label += `${hours} hora${hours > 1 ? "s" : ""}`;
      }
      if (minutes > 0) {
        if (hours > 0) {
          label += " y ";
        }
        label += `${minutes} minutos`;
      }
      options.push({ label, value: totalMinutes });
    }
    return options;
  }, []);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      idPaciente: "",
      idDoctor: "",
      idMotivoCita: "",
      fecha: new Date(),
      horaInicio: format(new Date(), "HH:mm"),
      duracion: 30,
      procedimientos: [],
      estado: "pendiente",
      notas: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const response = await api.get("/appointments/combos");
          const { patients, specialists, appointmentReasons, procedures } =
            response.data;

          setPacienteOptions(
            patients.length > 0
              ? patients.map((p: any) => ({
                  value: p.id,
                  label: `${p.name}`,
                }))
              : [{ value: "", label: "No hay pacientes disponibles" }]
          );

          setDoctorOptions(
            specialists.map((s: any) => ({
              value: s.id,
              label: s.name,
            }))
          );

          setMotivoCitaOptions(
            appointmentReasons.length > 0
              ? appointmentReasons.map((reason: any) => ({
                  value: reason.id,
                  label: reason.name,
                }))
              : [{ value: "", label: "No hay motivos disponibles" }]
          );

          setProcedimientoOptions(
            procedures.length > 0
              ? procedures.map((proc: any) => ({
                  value: proc.id,
                  label: `${proc.name} - S/ ${proc.price}`,
                }))
              : [{ value: "", label: "No hay servicios disponibles" }]
          );
        } catch (error) {
          console.error("Error fetching combo data:", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (data: AppointmentFormData) => {
    const [startHour, startMinute] = data.horaInicio.split(":").map(Number);

    const endTime = new Date(data.fecha);
    endTime.setHours(startHour);
    endTime.setMinutes(startMinute + data.duracion);

    const horaFin = format(endTime, "HH:mm");

    const appointmentData = {
      idPaciente: data.idPaciente,
      idSpecialist: data.idDoctor,
      idMotivoCita: data.idMotivoCita,
      fechaCita: format(data.fecha, "yyyy-MM-dd"),
      horaInicio: data.horaInicio,
      horaFin: horaFin,
      estadoCita: data.estado,
    };

    console.log("Data to be sent:", appointmentData);

    try {
      const response = await api.post("/appointments", appointmentData);
      console.log("Cita creada exitosamente:", response.data);
      onSave(response.data);
      onClose();
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      console.error("Error al crear cita:", error);
    }
  };

  const handleDeleteClick = () => {
    if (existingAppointment && onDelete) {
      onDelete(existingAppointment.id);
    }
  };

  const handleAddProcedimiento = (procedimientoId: string) => {
    const procedimientoToAdd = mockProcedimientos.find(
      (p) => p.id === procedimientoId
    );
    if (
      procedimientoToAdd &&
      !procedimientosSeleccionados.some((p) => p.id === procedimientoId)
    ) {
      setProcedimientosSeleccionados((prev) => [...prev, procedimientoToAdd]);
    }
  };

  const handleRemoveProcedimiento = (procedimientoId: string) => {
    setProcedimientosSeleccionados((prev) =>
      prev.filter((p) => p.id !== procedimientoId)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-3xl p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>
            {existingAppointment ? "Editar Cita" : "Crear Nueva Cita"}
          </DialogTitle>
          <DialogDescription>
            {existingAppointment
              ? "Modifique los detalles de la cita."
              : "Complete los campos para programar una nueva cita."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-100px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idPaciente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente</FormLabel>
                        <Combobox
                          options={pacienteOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Buscar paciente..."
                          disabled={!!defaultPatientId}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
                        <Combobox
                          options={doctorOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Buscar doctor..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idMotivoCita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un motivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {motivoCitaOptions.map((motivo) => (
                              <SelectItem
                                key={motivo.value}
                                value={motivo.value || "default-value"}
                              >
                                {motivo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Agregar Servicio (Opcional)</FormLabel>
                    <Combobox
                      options={procedimientoOptions}
                      onChange={handleAddProcedimiento}
                      placeholder="Buscar servicio..."
                    />
                  </FormItem>
                  <div className="space-y-2">
                    {procedimientosSeleccionados.map((proc) => (
                      <Badge
                        key={proc.id}
                        variant="secondary"
                        className="flex justify-between items-center text-sm py-1 px-2"
                      >
                        <span>{proc.denominacion}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProcedimiento(proc.id)}
                          className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                          <XIcon className="h-3 w-3" />
                          <span className="sr-only">Quitar</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <FormField
                    control={form.control}
                    name="fecha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
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
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Seleccione fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarPicker
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de Inicio</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duracion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración</FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {duracionOptions.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {existingAppointment && (
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pendiente">
                                Pendiente
                              </SelectItem>
                              <SelectItem value="confirmada">
                                Confirmada
                              </SelectItem>
                              <SelectItem value="atendido">Atendido</SelectItem>
                              <SelectItem value="cancelada">
                                Cancelada
                              </SelectItem>
                              <SelectItem value="reprogramada">
                                Reprogramada
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="notas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nota de la Cita (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Añadir notas adicionales..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter className="p-6 pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  {existingAppointment && onDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteClick}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar Cita
                    </Button>
                  )}
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
