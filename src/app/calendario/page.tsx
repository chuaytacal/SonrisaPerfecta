
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, Navigate } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import { addMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, ListFilter, LayoutGrid, Rows3 } from 'lucide-react';
import { AppointmentModal } from '@/components/calendario/AppointmentModal';
import type { Appointment, AppointmentFormData } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { mockPacientesData, mockPersonalData, mockMotivosCita, mockAppointmentsData } from '@/lib/data';


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
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointmentsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{ start: Date; end: Date } | null>(null);
  const [currentView, setCurrentView] = useState<keyof typeof Views>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentDate(new Date());
    // The state is now initialized directly from mockAppointmentsData
    // We can use a useEffect to sync if it changes from other places, but for now this is fine.
    setAppointments([...mockAppointmentsData]);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlotInfo({
      start,
      end,
     });
    setEditingAppointment(null);
    setIsModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: Appointment) => {
    setEditingAppointment(event);
    setSelectedSlotInfo(null);
    setIsModalOpen(true);
  }, []);

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
      estado: formData.estado,
      notas: formData.notas,
      eventColor: editingAppointment?.eventColor || 'hsl(var(--primary))'
    };
    
    // Update mock data source
    const existingIndex = mockAppointmentsData.findIndex(app => app.id === appointmentToSave.id);
    if (existingIndex > -1) {
        mockAppointmentsData[existingIndex] = appointmentToSave;
    } else {
        mockAppointmentsData.push(appointmentToSave);
    }
    setAppointments([...mockAppointmentsData]); // Update local state from the source of truth

    toast({
      title: editingAppointment ? "Cita Actualizada" : "Cita Creada",
      description: `La cita para "${paciente.persona.nombre}" ha sido ${editingAppointment ? 'actualizada' : 'programada'}.`,
      variant: 'default'
    });
    
    setIsModalOpen(false);
    setEditingAppointment(null);
    setSelectedSlotInfo(null);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    const appointmentToDelete = mockAppointmentsData.find(app => app.id === appointmentId);
    
    // Update mock data source by filtering
    const indexToDelete = mockAppointmentsData.findIndex(app => app.id === appointmentId);
    if (indexToDelete > -1) {
        mockAppointmentsData.splice(indexToDelete, 1);
    }
    setAppointments([...mockAppointmentsData]); // Update local state from the source of truth

    toast({
      title: "Cita Eliminada",
      description: `La cita "${appointmentToDelete?.title || 'seleccionada'}" ha sido eliminada.`,
      variant: 'destructive' 
    });
    setIsModalOpen(false);
    setEditingAppointment(null);
    setSelectedSlotInfo(null);
  };
  
  const eventPropGetter = useCallback(
    (event: Appointment) => {
      const style: React.CSSProperties = {
        padding: '2px 5px', 
        borderRadius: '4px', 
        border: 'none',
      };
      
      let backgroundColor = event.eventColor || 'hsl(var(--primary))';
      if (event.estado === 'Cancelada') {
        backgroundColor = 'hsl(var(--destructive))';
      } else if (event.estado === 'Pendiente') {
        backgroundColor = 'hsl(var(--chart-5))';
      }

      style.backgroundColor = backgroundColor;

      if (currentView === Views.AGENDA) {
        style.padding = '0.625rem'; 
        style.margin = '0px';
        style.borderRadius = '0px';
        style.color = 'hsl(var(--card-foreground))'; 
      } else {
          style.color = 'hsl(var(--primary-foreground))';
      }

      return {
        style,
        className: 'cursor-pointer',
      };
    },
    [currentView]
  );

  const CustomToolbar = ({ date, view, views, label, onNavigate, onView }: any) => {
    const viewIcons: Record<string, React.ElementType> = {
      [Views.MONTH]: LayoutGrid,
      [Views.WEEK]: Rows3,
      [Views.DAY]: CalendarDays,
      [Views.AGENDA]: ListFilter,
    };

    return (
      <div className="rbc-toolbar mb-4 p-3 border border-border rounded-lg bg-card shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => onNavigate(Navigate.PREVIOUS)} aria-label="Anterior">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="outline" onClick={() => onNavigate(Navigate.TODAY)} className="px-4 py-2 text-sm font-medium">
                    Hoy
                </Button>
                <Button variant="outline" size="icon" onClick={() => onNavigate(Navigate.NEXT)} aria-label="Siguiente">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            <h2 className="rbc-toolbar-label text-xl font-semibold text-foreground flex-grow text-center my-2 sm:my-0 order-first sm:order-none capitalize">
                {label}
            </h2>
            <div className="flex items-center gap-1">
                {(views as string[]).map((viewName) => {
                  const IconComponent = viewIcons[viewName];
                  const viewLabel = messages[viewName as keyof typeof messages] || viewName.charAt(0).toUpperCase() + viewName.slice(1);
                  return (
                    <Button
                        key={viewName}
                        variant={view === viewName ? 'default' : 'outline'}
                        onClick={() => onView(viewName)}
                        size="sm"
                        className="px-3 py-2 text-sm button" // Added 'button' class for media query styling
                        aria-label={`Vista ${viewLabel}`}
                    >
                        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                        {viewLabel}
                    </Button>
                  );
                })}
            </div>
        </div>
      </div>
    );
  };

  const calendarFormats = useMemo(() => ({
    dayFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'EEE d/M', culture).toLowerCase(),
    weekdayFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'EEE', culture).toLowerCase(),
    
    dateFormat: 'd', 
    timeGutterFormat: (date: Date, culture?: string, localizerInstance?: any) =>
      localizerInstance.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) =>
      `${localizerInstance.format(start, 'HH:mm', culture)} - ${localizerInstance.format(end, 'HH:mm', culture)}`,
    
    agendaDateFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'EEE, d MMM', culture), 
    agendaTimeFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'HH:mm', culture),
    agendaTimeRangeFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) => 
      `${localizerInstance.format(start, 'HH:mm', culture)} – ${localizerInstance.format(end, 'HH:mm', culture)}`,
    
    monthHeaderFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'MMMM yyyy', culture), 
    dayRangeHeaderFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) => 
      `${localizerInstance.format(start, 'd MMM', culture)} - ${localizerInstance.format(end, 'd MMM yyyy', culture)}`, 
    dayHeaderFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'eeee, d MMMM yyyy', culture), 
  }), []);


  return (
    <div className="flex flex-col relative"> {/* Removed h-full */}
      <h1 className="text-3xl font-bold text-foreground mb-6">Calendario de Citas</h1>

      <div className="flex-grow relative">
        {currentDate ? (
          <BigCalendar
            localizer={localizer}
            events={appointments}
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
            components={{
              toolbar: CustomToolbar,
            }}
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
            style={{ height: '100%' }} 
          />
        ) : (
          <div className="flex flex-col space-y-3 p-4 bg-card rounded-lg shadow-md h-full">
            <Skeleton className="h-[50px] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="flex-grow w-full rounded-lg" />
          </div>
        )}
      </div>

      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20"
        onClick={() => {
          setSelectedSlotInfo(null);
          setEditingAppointment(null);
          setIsModalOpen(true);
        }}
        aria-label="Añadir nueva cita"
      >
        <Plus className="h-7 w-7" />
        <span className="sr-only">Añadir Cita</span>
      </Button>

      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSlotInfo(null);
            setEditingAppointment(null);
          }}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
          initialData={selectedSlotInfo || undefined}
          existingAppointment={editingAppointment}
        />
      )}
    </div>
  );
}
