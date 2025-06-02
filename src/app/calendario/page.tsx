
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, Navigate } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
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


export default function CalendarioPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<Partial<AppointmentFormData> & { start?: Date; end?: Date } | null>(null);
  const [currentView, setCurrentView] = useState<keyof typeof Views>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

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
    setSelectedSlotInfo(null); // Clear slot info if we're editing an existing event
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
    });
    setIsModalOpen(false);
    setEditingAppointment(null);
    setSelectedSlotInfo(null);
  };

  const eventPropGetter = useCallback(
    (event: Appointment) => ({
      ...(event.eventColor && {
        style: {
          backgroundColor: event.eventColor,
          borderColor: event.eventColor, // Consider a slightly darker shade or a contrasting border for better visibility
        },
      }),
      className: 'cursor-pointer',
    }),
    []
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
            <h2 className="text-xl font-semibold text-foreground flex-grow text-center my-2 sm:my-0 order-first sm:order-none">
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
                        className="px-3 py-2 text-sm" // Adjusted padding for better spacing with icon
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


  return (
    <div className="flex flex-col h-full relative">
      <h1 className="text-3xl font-bold text-foreground mb-6">Calendario de Citas</h1>

      <div className="flex-grow relative" style={{ height: 'calc(100vh - 200px)' }}> {/* Adjusted height slightly */}
        <BigCalendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          defaultView={Views.WEEK}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          messages={messages}
          culture="es"
          className="bg-card text-card-foreground p-0 border-none rounded-lg shadow-md" // Ensure no extra padding that might shrink calendar
          components={{
            toolbar: CustomToolbar,
          }}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={currentView}
          onView={(newView) => setCurrentView(newView as keyof typeof Views)}
          eventPropGetter={eventPropGetter}
          min={new Date(0,0,0, 7,0,0)} // 7 AM
          max={new Date(0,0,0, 21,0,0)} // 9 PM
          formats={{
            timeGutterFormat: (date, culture, localizerRef) =>
              localizerRef ? localizerRef.format(date, 'HH:mm', culture) : '',
            eventTimeRangeFormat: ({ start, end }, culture, localizerRef) =>
              localizerRef
                ? `${localizerRef.format(start, 'HH:mm', culture)} - ${localizerRef.format(end, 'HH:mm', culture)}`
                : '',
            agendaTimeRangeFormat: ({ start, end }, culture, localizerRef) =>
               localizerRef
                ? `${localizerRef.format(start, 'HH:mm', culture)} - ${localizerRef.format(end, 'HH:mm', culture)}`
                : '',
             dayFormat: (date, culture, localizerRef) => // Short day name and day number e.g. "Lun 5"
              localizerRef ? localizerRef.format(date, 'EEE d', culture) : '',
             monthHeaderFormat: (date, culture, localizerRef) => // Full month name and year e.g. "Junio 2025" for month view header
              localizerRef ? localizerRef.format(date, 'LLLL yyyy', culture) : '',
             dayHeaderFormat: (date, culture, localizerRef) => // Day name, month, day number e.g. "lunes, jun. 2" for day view header
              localizerRef ? localizerRef.format(date, 'eeee, MMM d', culture) : '',
             agendaHeaderFormat: ({ start, end }, culture, localizerRef) => // Range for agenda view e.g. "6 jun. – 12 jun."
              localizerRef ? `${localizerRef.format(start, 'd MMM', culture)} – ${localizerRef.format(end, 'd MMM', culture)}` : '',

          }}
          dayLayoutAlgorithm="no-overlap" // Helps with event display
          popup // Enables the default "+X more" popup for overlapped events
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

