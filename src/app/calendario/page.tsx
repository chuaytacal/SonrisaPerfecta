
"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, Navigate } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import { addDays, setHours, setMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, ListFilter, LayoutGrid, Rows3 } from 'lucide-react';
import { AppointmentModal } from '@/components/calendario/AppointmentModal';
import type { Appointment, AppointmentFormData } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // Lunes como inicio de semana
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

const generateInitialAppointments = (): Appointment[] => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  const nextWeek = addDays(today, 7);

  return [
    {
      id: crypto.randomUUID(),
      title: 'Consulta Dr. Pérez',
      start: setMinutes(setHours(today, 10), 0),
      end: setMinutes(setHours(today, 11), 0),
      paciente: 'Ana García',
      doctor: 'Dr. Pérez',
      tipoCita: 'consulta',
      eventColor: 'hsl(var(--chart-1))', // Blue
    },
    {
      id: crypto.randomUUID(),
      title: 'Limpieza Dental',
      start: setMinutes(setHours(today, 14), 0),
      end: setMinutes(setHours(today, 15), 30),
      paciente: 'Carlos López',
      tipoCita: 'limpieza',
      eventColor: 'hsl(var(--chart-2))', // Another blue/accent
    },
    {
      id: crypto.randomUUID(),
      title: 'Reunión de equipo',
      start: setMinutes(setHours(today, 16), 0),
      end: setMinutes(setHours(today, 17), 0),
      tipoCita: 'otro',
      eventColor: 'hsl(var(--destructive))', // Red for contrast
    },
    {
      id: crypto.randomUUID(),
      title: 'Ortodoncia Seguimiento',
      start: setMinutes(setHours(tomorrow, 9), 0),
      end: setMinutes(setHours(tomorrow, 11), 0),
      paciente: 'Sofía Torres',
      doctor: 'Dra. Ramos',
      tipoCita: 'control',
      eventColor: '#4CAF50', // Green
    },
    {
      id: crypto.randomUUID(),
      title: 'Endodoncia',
      start: setMinutes(setHours(dayAfterTomorrow, 11), 0),
      end: setMinutes(setHours(dayAfterTomorrow, 12), 0),
      paciente: 'Juan Rodríguez',
      tipoCita: 'tratamiento',
      eventColor: '#FF9800', // Orange
    },
     {
      id: crypto.randomUUID(),
      title: 'Cita Importante (Todo el día)',
      start: nextWeek,
      end: nextWeek,
      allDay: true,
      tipoCita: 'otro',
      eventColor: '#9C27B0', // Purple
    }
  ];
};


export default function CalendarioPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<Partial<AppointmentFormData> & { start?: Date; end?: Date } | null>(null);
  const [currentView, setCurrentView] = useState<keyof typeof Views>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setAppointments(generateInitialAppointments());
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlotInfo({
      start,
      end,
      startDate: start,
      startTime: format(start, 'HH:mm'),
      endDate: end,
      endTime: format(end, 'HH:mm'),
     });
    setEditingAppointment(null);
    setIsModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: Appointment) => {
    setEditingAppointment(event);
    setSelectedSlotInfo(null); 
    setIsModalOpen(true);
  }, []);

  const handleSaveAppointment = (appointmentData: Appointment) => {
    setAppointments(prev => {
      const existingIndex = prev.findIndex(app => app.id === appointmentData.id);
      if (existingIndex > -1) {
        const updatedAppointments = [...prev];
        updatedAppointments[existingIndex] = appointmentData;
        return updatedAppointments;
      }
      return [...prev, appointmentData];
    });
    toast({
      title: editingAppointment ? "Cita Actualizada" : "Cita Creada",
      description: `La cita "${appointmentData.title}" ha sido ${editingAppointment ? 'actualizada' : 'programada'}.`,
      variant: 'default'
    });
    setIsModalOpen(false);
    setEditingAppointment(null);
    setSelectedSlotInfo(null);
  };

  const eventPropGetter = useCallback(
    (event: Appointment) => {
      const style: React.CSSProperties = {};
      if (event.eventColor) {
        if (currentView === Views.AGENDA) {
          style['--event-dot-color'] = event.eventColor;
          style.backgroundColor = 'transparent';
          style.borderColor = 'transparent'; // Avoid borders in agenda items from other views
        } else {
          style.backgroundColor = event.eventColor;
          style.borderColor = event.eventColor;
        }
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
            <h2 className="text-xl font-semibold text-foreground flex-grow text-center my-2 sm:my-0 order-first sm:order-none capitalize">
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
                        className="px-3 py-2 text-sm" 
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
    dateFormat: 'd', 
    dayFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'EEE', culture).toLowerCase(),
    weekdayFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'EEE d/M', culture).toLowerCase(),
    timeGutterFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'HH:mm', culture),
    eventTimeRangeFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) =>
      `${localizerInstance.format(start, 'HH:mm', culture)} - ${localizerInstance.format(end, 'HH:mm', culture)}`,
    agendaDateFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'EEEE, d \'de\' MMMM \'de\' yyyy', culture), // e.g., "domingo, 15 de junio de 2025"
    agendaTimeFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'HH:mm', culture),
    agendaTimeRangeFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) =>
      `${localizerInstance.format(start, 'HH:mm', culture)} – ${localizerInstance.format(end, 'HH:mm', culture)}`,
    monthHeaderFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'MMMM yyyy', culture),
    dayRangeHeaderFormat: ({ start, end }: {start: Date, end: Date}, culture?: string, localizerInstance?: any) => 
      `${localizerInstance.format(start, 'd', culture)} - ${localizerInstance.format(end, 'd MMMM yyyy', culture)}`,
    dayHeaderFormat: (date: Date, culture?: string, localizerInstance?: any) => 
      localizerInstance.format(date, 'eeee, d MMMM yyyy', culture),
  }), []);


  return (
    <div className="flex flex-col h-full relative">
      <h1 className="text-3xl font-bold text-foreground mb-6">Calendario de Citas</h1>

      <div className="flex-grow relative" style={{ height: '100%' }}>
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
          initialData={selectedSlotInfo || undefined}
          existingAppointment={editingAppointment}
        />
      )}
    </div>
  );
}
