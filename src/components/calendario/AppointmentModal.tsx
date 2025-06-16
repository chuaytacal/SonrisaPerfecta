
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Appointment, AppointmentFormData } from '@/types/calendar';
import { cn } from '@/lib/utils';

const appointmentFormSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  startDate: z.date({ required_error: "La fecha de inicio es requerida." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (HH:MM)."),
  endDate: z.date({ required_error: "La fecha de fin es requerida." }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (HH:MM)."),
  paciente: z.string().optional(),
  doctor: z.string().optional(),
  tipoCita: z.string().optional(),
  notas: z.string().optional(),
  eventColor: z.string().optional(),
}).refine(data => {
  const startDateTime = new Date(data.startDate);
  const [startHours, startMinutes] = data.startTime.split(':').map(Number);
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date(data.endDate);
  const [endHours, endMinutes] = data.endTime.split(':').map(Number);
  endDateTime.setHours(endHours, endMinutes, 0, 0);
  
  return endDateTime > startDateTime;
}, {
  message: "La cita debe terminar después de que comience.",
  path: ["endDate"],
});


interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  initialData?: Partial<AppointmentFormData> & { start?: Date; end?: Date };
  existingAppointment?: Appointment | null;
}

const eventColors = [
    { label: 'Azul (Primario)', value: 'hsl(var(--primary))' },
    { label: 'Verde', value: '#4CAF50' },
    { label: 'Naranja', value: '#FF9800' },
    { label: 'Rojo', value: 'hsl(var(--destructive))' },
    { label: 'Púrpura', value: '#9C27B0' },
];

export function AppointmentModal({ isOpen, onClose, onSave, onDelete, initialData, existingAppointment }: AppointmentModalProps) {
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: '',
      startDate: new Date(),
      startTime: format(new Date(), 'HH:mm'),
      endDate: new Date(),
      endTime: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'), // 1 hour later
      paciente: '',
      doctor: '',
      tipoCita: '',
      notas: '',
      eventColor: eventColors[0].value,
    },
  });

  useEffect(() => {
    let defaultValues: Partial<AppointmentFormData> = {
      title: '',
      startDate: new Date(),
      startTime: format(new Date(), 'HH:mm'),
      endDate: new Date(),
      endTime: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'),
      paciente: '',
      doctor: '',
      tipoCita: '',
      notas: '',
      eventColor: eventColors[0].value,
    };

    if (existingAppointment) {
        defaultValues = {
            title: existingAppointment.title,
            startDate: existingAppointment.start,
            startTime: format(existingAppointment.start, 'HH:mm'),
            endDate: existingAppointment.end,
            endTime: format(existingAppointment.end, 'HH:mm'),
            paciente: existingAppointment.paciente,
            doctor: existingAppointment.doctor,
            tipoCita: existingAppointment.tipoCita,
            notas: existingAppointment.notas,
            eventColor: existingAppointment.eventColor || eventColors[0].value,
        };
    } else if (initialData) {
        defaultValues = {
            ...defaultValues,
            ...initialData,
            startDate: initialData.start || new Date(),
            startTime: initialData.start ? format(initialData.start, 'HH:mm') : format(new Date(), 'HH:mm'),
            endDate: initialData.end || new Date(Date.now() + 60 * 60 * 1000),
            endTime: initialData.end ? format(initialData.end, 'HH:mm') : format(new Date(Date.now() + 60*60*1000), 'HH:mm'),
        };
    }
    form.reset(defaultValues);
  }, [isOpen, initialData, existingAppointment, form]);

  const handleSubmit = (data: AppointmentFormData) => {
    const startDateTime = new Date(data.startDate);
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(data.endDate);
    const [endHours, endMinutes] = data.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const appointmentToSave: Appointment = {
      id: existingAppointment?.id || crypto.randomUUID(),
      title: data.title,
      start: startDateTime,
      end: endDateTime,
      paciente: data.paciente,
      doctor: data.doctor,
      tipoCita: data.tipoCita,
      notas: data.notas,
      eventColor: data.eventColor,
      allDay: false, 
    };
    onSave(appointmentToSave);
    onClose();
  };

  const handleDeleteClick = () => {
    if (existingAppointment && onDelete) {
      onDelete(existingAppointment.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-lg">
        <DialogHeader>
          <DialogTitle>{existingAppointment ? 'Editar Cita' : 'Crear Nueva Cita'}</DialogTitle>
          <DialogDescription>
            {existingAppointment ? 'Modifique los detalles de la cita.' : 'Complete los campos para programar una nueva cita.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2 px-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Cita</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Limpieza Dental" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hora de Inicio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hora de Fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paciente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor/Personal (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del doctor o personal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipoCita"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cita (Opcional)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo de cita" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="consulta">Consulta</SelectItem>
                            <SelectItem value="tratamiento">Tratamiento</SelectItem>
                            <SelectItem value="control">Control</SelectItem>
                            <SelectItem value="limpieza">Limpieza</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="eventColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color del Evento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          {field.value && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: field.value }} />}
                          <SelectValue placeholder="Seleccione un color" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventColors.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                            {color.label}
                          </div>
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
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añadir notas adicionales sobre la cita..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              <div className="w-full sm:w-auto">
                {existingAppointment && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteClick}
                    className="w-full sm:w-auto"
                    aria-label="Eliminar cita"
                  >
                    <Trash2 className="h-4 w-4" /> <span className="sm:hidden ml-2">Eliminar</span>
                  </Button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                  {form.formState.isSubmitting ? (existingAppointment ? 'Guardando...' : 'Creando...') : (existingAppointment ? 'Guardar Cambios' : 'Crear Cita')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
