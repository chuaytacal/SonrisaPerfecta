
"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, Navigate } from 'react-big-calendar';
import { useRouter } from 'next/navigation';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import { addMinutes, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, ListFilter, LayoutGrid, Rows3, Megaphone, Filter } from 'lucide-react';
import { AppointmentModal } from '@/components/calendario/AppointmentModal';
import { AppointmentPopoverContent } from '@/components/calendario/AppointmentPopoverContent';
import { RescheduleModal } from '@/components/calendario/RescheduleModal';
import { RescheduleConfirmationModal } from '@/components/calendario/RescheduleConfirmationModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { Appointment, AppointmentFormData, AppointmentState, RescheduleData } from '@/types/calendar';
import type { Presupuesto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { mockPacientesData, mockPersonalData, mockMotivosCita, mockAppointmentsData, mockPresupuestosData, mockPagosData } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Personal } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), 
  getDay,
  locales,
});

const messages = {
  allDay: 'Todo el día',
  previous: '<',
  next: '>',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay citas en este rango.',
  showMore: (total: number) => `+ Ver más (${total})`,
};

export default function CalendarioPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointmentsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPastDateWarningOpen, setIsPastDateWarningOpen] = useState(false);
  const [pendingSlotInfo, setPendingSlotInfo] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [currentView, setCurrentView] = useState<keyof typeof Views>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  
  const [selectedEventForPopover, setSelectedEventForPopover] = useState<Appointment | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLDivElement>(null);
  
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isRescheduleConfirmOpen, setIsRescheduleConfirmOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<RescheduleData | null>(null);
  const [shouldDeleteOnReschedule, setShouldDeleteOnReschedule] = useState(false);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [appointmentToAction, setAppointmentToAction] = useState<Appointment | null>(null);

  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<AppointmentState | 'all'>('all');
  const [motivoFilter, setMotivoFilter] = useState<string>('all');

  useEffect(() => {
    setCurrentDate(new Date());
    setAppointments([...mockAppointmentsData]);
  }, []);

  const doctorOptions = useMemo(() => [
    { value: 'all', label: 'Todos los doctores' },
    ...mockPersonalData
        .filter(p => p.estado === 'Activo')
        .map(d => ({ value: d.id, label: `${d.persona.nombre} ${d.persona.apellidoPaterno}` }))
  ], []);

  const statusOptions: { value: AppointmentState | 'all', label: string }[] = [
      { value: 'all', label: 'Todos los estados' },
      { value: 'Pendiente', label: 'Pendiente' },
      { value: 'Confirmada', label: 'Confirmada' },
      { value: 'Atendido', label: 'Atendido' },
      { value: 'Cancelada', label: 'Cancelada' },
      { value: 'Reprogramada', label: 'Reprogramada' },
  ];
  
  const motivoOptions = useMemo(() => [
    { value: 'all', label: 'Todos los motivos' },
    ...mockMotivosCita.map(m => ({ value: m.id, label: m.nombre }))
  ], []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
        const doctorMatch = doctorFilter === 'all' || appointment.idDoctor === doctorFilter;
        const statusMatch = statusFilter === 'all' || appointment.estado === statusFilter;
        const motivoMatch = motivoFilter === 'all' || appointment.idMotivoCita === motivoFilter;
        return doctorMatch && statusMatch && motivoMatch;
    });
  }, [appointments, doctorFilter, statusFilter, motivoFilter]);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    if (start < new Date()) {
      setPendingSlotInfo({ start, end });
      setIsPastDateWarningOpen(true);
    } else {
      setEditingAppointment(null);
      setSelectedSlot({ start, end });
      setIsModalOpen(true);
    }
  }, []);

  const handleAcknowledgePastDate = () => {
    setIsPastDateWarningOpen(false);
    if (pendingSlotInfo) {
      setEditingAppointment(null);
      setSelectedSlot(pendingSlotInfo);
      setIsModalOpen(true);
      setPendingSlotInfo(null);
    }
  };

  const handleSelectEvent = useCallback((event: Appointment, e: React.SyntheticEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    if (popoverTriggerRef.current) {
        const rect = target.getBoundingClientRect();
        popoverTriggerRef.current.style.top = `${rect.top}px`;
        popoverTriggerRef.current.style.left = `${rect.left}px`;
        popoverTriggerRef.current.style.width = `${rect.width}px`;
        popoverTriggerRef.current.style.height = `${rect.height}px`;
    }
    setSelectedEventForPopover(event);
    setPopoverOpen(true);
  }, []);
  
  const handleUpdateState = (appointmentId: string, newState: AppointmentState) => {
    const appointmentIndex = mockAppointmentsData.findIndex(app => app.id === appointmentId);
    if(appointmentIndex > -1) {
        mockAppointmentsData[appointmentIndex].estado = newState;
    }
    setAppointments([...mockAppointmentsData]);
    toast({
        title: "Estado Actualizado",
        description: `La cita ha sido marcada como "${newState}".`
    });
    setPopoverOpen(false);
  };

  const handleOpenEditModalFromPopover = () => {
    setEditingAppointment(selectedEventForPopover);
    setIsModalOpen(true);
    setPopoverOpen(false);
  };

  const handleOpenRescheduleModalFromPopover = () => {
    setShouldDeleteOnReschedule(false); // Reset switch state
    setIsRescheduleModalOpen(true);
    setPopoverOpen(false);
  }

  const handleDeleteFromPopover = () => {
    setAppointmentToAction(selectedEventForPopover);
    setIsConfirmDeleteDialogOpen(true);
    setPopoverOpen(false);
  }

  const confirmDelete = () => {
    if(!appointmentToAction) return;

    // Find and delete associated budget and payments
    const budgetToDelete = mockPresupuestosData.find(b => b.idCita === appointmentToAction.id);
    if (budgetToDelete) {
        // Find all payments related to this budget and remove them
        const paymentsToKeep = mockPagosData.filter(pago => 
            !pago.itemsPagados.some(item => item.idPresupuesto === budgetToDelete.id)
        );
        mockPagosData.length = 0;
        Array.prototype.push.apply(mockPagosData, paymentsToKeep);

        // Delete the budget
        const budgetIndex = mockPresupuestosData.findIndex(p => p.id === budgetToDelete.id);
        if (budgetIndex > -1) {
            mockPresupuestosData.splice(budgetIndex, 1);
        }
    }
    
    // Delete the appointment
    const indexToDelete = mockAppointmentsData.findIndex(app => app.id === appointmentToAction.id);
    if (indexToDelete > -1) {
        mockAppointmentsData.splice(indexToDelete, 1);
    }
    setAppointments([...mockAppointmentsData]);

    toast({
      title: "Cita Eliminada",
      description: `La cita y su presupuesto asociado (si existía) han sido eliminados.`,
      variant: 'destructive' 
    });
    setIsConfirmDeleteDialogOpen(false);
    setAppointmentToAction(null);
  }


  const handleSaveAppointment = (formData: AppointmentFormData) => {
    const startDateTime = new Date(formData.fecha);
    const [startHours, startMinutes] = formData.horaInicio.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    const endDateTime = addMinutes(startDateTime, formData.duracion);
    
    const paciente = mockPacientesData.find(p => p.id === formData.idPaciente);
    const doctor = mockPersonalData.find(p => p.id === formData.idDoctor);
    const motivoCita = mockMotivosCita.find(m => m.id === formData.idMotivoCita);

    if (!paciente || !doctor || !motivoCita) {
      toast({
        title: "Error al guardar",
        description: "No se encontró el paciente, doctor o motivo de la cita.",
        variant: "destructive"
      });
      return;
    }

    const appointmentToSave: Appointment = {
      id: editingAppointment?.id || crypto.randomUUID(),
      title: `${motivoCita.nombre} - ${paciente.persona.nombre}`,
      start: startDateTime,
      end: endDateTime,
      idPaciente: paciente.id,
      idDoctor: doctor.id,
      idMotivoCita: motivoCita.id,
      paciente,
      doctor,
      motivoCita,
      procedimientos: formData.procedimientos,
      estado: editingAppointment ? formData.estado : 'Pendiente',
      notas: formData.notas,
      eventColor: editingAppointment?.eventColor || 'hsl(var(--primary))'
    };
    
    const existingIndex = mockAppointmentsData.findIndex(app => app.id === appointmentToSave.id);
    if (existingIndex > -1) {
        mockAppointmentsData[existingIndex] = appointmentToSave;
    } else {
        mockAppointmentsData.push(appointmentToSave);
    }
    
    // Auto-create a budget if there are procedures
    if (formData.procedimientos && formData.procedimientos.length > 0 && !editingAppointment) {
      const newBudget: Presupuesto = {
        id: `presupuesto-${crypto.randomUUID()}`,
        idHistoriaClinica: paciente.idHistoriaClinica,
        idCita: appointmentToSave.id,
        nombre: motivoCita.nombre,
        fechaCreacion: new Date(),
        fechaAtencion: startDateTime,
        estado: 'Creado',
        montoPagado: 0,
        items: formData.procedimientos.map(p => ({
          id: `item-${crypto.randomUUID()}`,
          procedimiento: p,
          cantidad: 1,
          montoPagado: 0,
        })),
        doctorResponsableId: doctor.id
      };
      mockPresupuestosData.unshift(newBudget);
    }


    setAppointments([...mockAppointmentsData]); 

    toast({
      title: editingAppointment ? "Cita Actualizada" : "Cita Creada",
      description: `La cita para "${paciente.persona.nombre}" ha sido ${editingAppointment ? 'actualizada' : 'programada'}.`,
      variant: 'default'
    });
    
    setIsModalOpen(false);
    setEditingAppointment(null);
    setSelectedSlot(null);
  };
  
  const handleProceedToRescheduleConfirm = (data: RescheduleData) => {
    setRescheduleData(data);
    setIsRescheduleModalOpen(false);
    setIsRescheduleConfirmOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!selectedEventForPopover || !rescheduleData) return;

    // 1. Create the new appointment. This happens in both cases.
    const { newDate, newTime, newDoctorId } = rescheduleData;
    const [hours, minutes] = newTime.split(':').map(Number);
    const newStart = new Date(newDate);
    newStart.setHours(hours, minutes, 0, 0);

    const duration = selectedEventForPopover.end.getTime() - selectedEventForPopover.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    
    const newAppointment: Appointment = {
      ...selectedEventForPopover,
      id: crypto.randomUUID(), // New unique ID
      start: newStart,
      end: newEnd,
      idDoctor: newDoctorId,
      doctor: mockPersonalData.find(d => d.id === newDoctorId),
      estado: 'Pendiente', // The new appointment is always 'Pendiente'
    };
    
    // 2. Handle the original appointment based on the switch.
    if (shouldDeleteOnReschedule) {
        // Find and remove the original appointment
        const indexToDelete = mockAppointmentsData.findIndex(app => app.id === selectedEventForPopover.id);
        if (indexToDelete > -1) {
            mockAppointmentsData.splice(indexToDelete, 1);
        }
        toast({ title: "Cita Reprogramada", description: "La cita original ha sido cancelada y la nueva agendada." });
    } else {
        // Mark the original appointment as 'Reprogramada'
        const appointmentIndex = mockAppointmentsData.findIndex(app => app.id === selectedEventForPopover.id);
        if (appointmentIndex > -1) {
            mockAppointmentsData[appointmentIndex].estado = 'Reprogramada';
        }
        toast({ title: "Cita Reprogramada", description: "La nueva cita ha sido agendada y la original marcada como reprogramada." });
    }
  
    // Add the new appointment to the list
    mockAppointmentsData.push(newAppointment);

    // 3. Update state and close modals
    setAppointments([...mockAppointmentsData]);
    setIsRescheduleConfirmOpen(false);
    setRescheduleData(null);
    setSelectedEventForPopover(null);
    setShouldDeleteOnReschedule(false);
  };
  
  const eventPropGetter = useCallback(
    (event: Appointment) => {
      const style: React.CSSProperties = { padding: '2px 5px', borderRadius: '4px', border: 'none' };
      let backgroundColor = event.eventColor || 'hsl(var(--primary))';
      let color = 'hsl(var(--primary-foreground))';

      switch (event.estado) {
        case 'Cancelada':
          backgroundColor = 'hsl(var(--destructive))';
          break;
        case 'Pendiente':
          backgroundColor = '#f59e0b'; // Amber-500
          break;
        case 'Atendido':
          backgroundColor = '#16a34a'; // Green-600
          break;
        case 'Confirmada':
          backgroundColor = '#5625b3'; // Purple
          break;
        case 'Reprogramada':
          backgroundColor = 'hsl(var(--muted))';
          color = 'hsl(var(--muted-foreground))';
          style.textDecoration = 'line-through';
          break;
      }
      style.backgroundColor = backgroundColor;
      style.color = color;

      if (currentView === Views.AGENDA) {
        style.padding = '0.625rem'; style.margin = '0px'; style.borderRadius = '0px'; style.color = 'hsl(var(--card-foreground))';
      }

      return { style, className: 'cursor-pointer' };
    },
    [currentView]
  );
  
  const CustomToolbar = ({ date, view, views, label, onNavigate, onView }: any) => {
    const viewIcons: Record<string, React.ElementType> = {
      [Views.MONTH]: LayoutGrid, [Views.WEEK]: Rows3, [Views.DAY]: CalendarDays, [Views.AGENDA]: ListFilter,
    };
    return (
      <div className="rbc-toolbar mb-4 p-3 border border-border rounded-lg bg-card shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => onNavigate(Navigate.PREVIOUS)} aria-label="Anterior"><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="outline" onClick={() => onNavigate(Navigate.TODAY)} className="px-4 py-2 text-sm font-medium">Hoy</Button>
                <Button variant="outline" size="icon" onClick={() => onNavigate(Navigate.NEXT)} aria-label="Siguiente"><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <h2 className="rbc-toolbar-label text-xl font-semibold text-foreground flex-grow text-center my-2 sm:my-0 order-first sm:order-none capitalize">{label}</h2>
            <div className="flex items-center gap-1">
                {(views as string[]).map((viewName) => {
                  const IconComponent = viewIcons[viewName];
                  const viewLabel = messages[viewName as keyof typeof messages] || viewName.charAt(0).toUpperCase() + viewName.slice(1);
                  return (<Button key={viewName} variant={view === viewName ? 'default' : 'outline'} onClick={() => onView(viewName)} size="sm" className="px-3 py-2 text-sm button" aria-label={`Vista ${viewLabel}`}>
                        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {viewLabel}
                    </Button>);
                })}
            </div>
        </div>
      </div>
    );
  };

  const calendarFormats = useMemo(() => ({
    dayFormat: (date: Date, culture?: string, localizerInstance?: any) => localizerInstance.format(date, 'EEE d/M', culture).toLowerCase(),
    weekdayFormat: (date: Date, culture?: string, localizerInstance?: any) => localizerInstance.format(date, 'EEE', culture).toLowerCase(),
    dateFormat: 'd', 
    timeGutterFormat: (date: Date, culture?: string, localizerInstance?: any) => localizerInstance.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) => `${localizerInstance.format(start, 'HH:mm', culture)} - ${localizerInstance.format(end, 'HH:mm', culture)}`,
    agendaDateFormat: (date: Date, culture?: string, localizerInstance?: any) => localizerInstance.format(date, 'EEE, d MMM', culture), 
    agendaTimeFormat: (date: Date, culture?: string, localizerInstance?: any) => localizerInstance.format(date, 'HH:mm', culture),
    agendaTimeRangeFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) => `${localizerInstance.format(start, 'HH:mm', culture)} – ${localizerInstance.format(end, 'HH:mm', culture)}`,
    monthHeaderFormat: (date: Date, culture?: string, localizerInstance?: any) => localizerInstance.format(date, 'MMMM yyyy', culture), 
    dayRangeHeaderFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) => `${localizerInstance.format(start, 'd MMM', culture)} - ${localizerInstance.format(end, 'd MMM yyyy', culture)}`, 
    dayHeaderFormat: (date: Date, culture?: string, localizerInstance?: any) => localizerInstance.format(date, 'eeee, d MMMM yyyy', culture), 
  }), []);


  return (
    <div className="flex flex-col relative h-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Calendario de Citas</h1>
        <p className="text-muted-foreground">Gestiona y visualiza todas las citas programadas en la clínica.</p>
      </div>

       <div className="mb-4 p-0 border rounded-lg bg-card shadow-sm">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">Filtros de Búsqueda</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="doctor-filter">Doctor</Label>
                            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                                <SelectTrigger id="doctor-filter">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctorOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status-filter">Estado</Label>
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentState | 'all')}>
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="motivo-filter">Motivo de Cita</Label>
                            <Select value={motivoFilter} onValueChange={setMotivoFilter}>
                                <SelectTrigger id="motivo-filter">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {motivoOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

      <div className="flex-grow relative">
        {currentDate ? (
          <BigCalendar
            localizer={localizer}
            events={filteredAppointments}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            defaultView={Views.MONTH}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            messages={messages}
            culture="es"
            className="bg-card text-card-foreground p-0 border-none rounded-lg shadow-md"
            components={{ toolbar: CustomToolbar }}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            view={currentView}
            onView={(newView) => setCurrentView(newView as keyof typeof Views)}
            eventPropGetter={eventPropGetter}
            min={new Date(0,0,0, 7,0,0)}
            max={new Date(0,0,0, 21,0,0)}
            formats={calendarFormats}
            dayLayoutAlgorithm="no-overlap"
            popup
          />
        ) : (
          <div className="flex flex-col space-y-3 p-4 bg-card rounded-lg shadow-md h-full">
            <Skeleton className="h-[50px] w-full rounded-lg" />
            <div className="space-y-2"><Skeleton className="h-4 w-[250px]" /><Skeleton className="h-4 w-[200px]" /></div>
            <Skeleton className="flex-grow w-full rounded-lg" />
          </div>
        )}
      </div>

      <Button variant="default" size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20" onClick={() => { setEditingAppointment(null); setSelectedSlot(null); setIsModalOpen(true);}} aria-label="Añadir nueva cita">
        <Plus className="h-7 w-7" /><span className="sr-only">Añadir Cita</span>
      </Button>

      {isModalOpen && (
        <AppointmentModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedSlot(null); }} onSave={handleSaveAppointment} existingAppointment={editingAppointment} selectedSlot={selectedSlot}/>
      )}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div ref={popoverTriggerRef} style={{ position: 'fixed', pointerEvents: 'none', opacity: 0 }} />
          </PopoverTrigger>
          <PopoverContent className="w-70 sm:w-75 p-0" align="start" side="bottom">
              {selectedEventForPopover && (
                  <AppointmentPopoverContent
                      appointment={selectedEventForPopover}
                      onUpdateState={(newState) => handleUpdateState(selectedEventForPopover.id, newState)}
                      onEdit={handleOpenEditModalFromPopover}
                      onReschedule={handleOpenRescheduleModalFromPopover}
                      onDelete={handleDeleteFromPopover}
                      onViewPatient={(patientId) => router.push(`/gestion-usuario/pacientes/${patientId}/filiacion`)}
                  />
              )}
          </PopoverContent>
      </Popover>

       {isRescheduleModalOpen && selectedEventForPopover && (
          <RescheduleModal
              isOpen={isRescheduleModalOpen}
              onClose={() => setIsRescheduleModalOpen(false)}
              onNext={handleProceedToRescheduleConfirm}
              appointment={selectedEventForPopover}
          />
      )}

      {isRescheduleConfirmOpen && selectedEventForPopover && rescheduleData && (
         <RescheduleConfirmationModal
              isOpen={isRescheduleConfirmOpen}
              onOpenChange={setIsRescheduleConfirmOpen}
              onConfirm={handleConfirmReschedule}
              originalAppointment={selectedEventForPopover}
              newAppointmentDetails={{
                ...rescheduleData,
                doctor: mockPersonalData.find(d => d.id === rescheduleData.newDoctorId) as Personal,
              }}
              shouldDelete={shouldDeleteOnReschedule}
              onShouldDeleteChange={setShouldDeleteOnReschedule}
          />
      )}
      
    <Dialog open={isPastDateWarningOpen} onOpenChange={setIsPastDateWarningOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-6">
            <DialogHeader className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Megaphone className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-semibold">Estás en una fecha pasada</DialogTitle>
            </DialogHeader>
            <DialogDescription className="mt-2 text-base text-center leading-relaxed">
              La cita que se está programando corresponde a una fecha pasada, por lo que no se generará un recordatorio.
            </DialogDescription>
            <DialogFooter className="mt-6 sm:justify-center">
                <Button onClick={handleAcknowledgePastDate} className="w-auto">Entendido</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        description={
            <span>
                ¿Estás seguro de que deseas eliminar la cita para <strong>{appointmentToAction?.paciente?.persona.nombre}</strong>?
                <br />
                <span className="mt-2 inline-block text-sm text-destructive">
                    Si esta cita generó un presupuesto, este también será eliminado junto con sus pagos asociados.
                </span>
            </span>
        }
        confirmButtonText="Eliminar"
        confirmButtonVariant="destructive"
    />
    </div>
  );
}
