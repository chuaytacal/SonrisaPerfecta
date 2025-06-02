"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, NavigateAction } from 'react-big-calendar';
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
          borderColor: event.eventColor,
        },
      }),
    }),
    []
  );
  
  const CustomToolbar = ({ date, view, views, label, onNavigate, onView }: any) => {
    return (
      <div className="rbc-toolbar mb-4 p-2 border border-border rounded-md bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => onNavigate(NavigateAction.PREVIOUS)}><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="outline" onClick={() => onNavigate(NavigateAction.TODAY)} className="px-3 py-1.5 h-auto text-sm">Hoy</Button>
                <Button variant="outline" size="icon" onClick={() => onNavigate(NavigateAction.NEXT)}><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <h2 className="text-lg font-semibold text-foreground flex-grow text-center sm:text-left my-2 sm:my-0">{label}</h2>
            <div className="flex items-center gap-1">
                {(views as string[]).map((viewName) => (
                <Button
                    key={viewName}
                    variant={view === viewName ? 'default' : 'outline'}
                    onClick={() => onView(viewName)}
                    size="sm"
                    className="px-2 py-1 h-auto text-xs sm:text-sm"
                >
                    {viewName === Views.MONTH && <LayoutGrid className="mr-1 h-4 w-4 sm:hidden" />}
                    {viewName === Views.WEEK && <Rows3 className="mr-1 h-4 w-4 sm:hidden" />}
                    {viewName === Views.DAY && <CalendarDays className="mr-1 h-4 w-4 sm:hidden" />}
                    {viewName === Views.AGENDA && <ListFilter className="mr-1 h-4 w-4 sm:hidden" />}
                    <span className="hidden sm:inline">{messages[viewName as keyof typeof messages] || viewName.charAt(0).toUpperCase() + viewName.slice(1)}</span>
                    <span className="sm:hidden">{messages[viewName as keyof typeof messages]?.substring(0,1) || viewName.charAt(0).toUpperCase()}</span>
                </Button>
                ))}
            </div>
        </div>
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full relative">
      <h1 className="text-3xl font-bold text-foreground mb-6">Calendario de Citas</h1>
      
      <div className="flex-grow relative" style={{ height: 'calc(100vh - 180px)' }}> {/* Adjust height as needed */}
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
          className="bg-card text-card-foreground p-0 border-none rounded-lg shadow-md"
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
            timeGutterFormat: (date, culture, localizer) =>
              localizer ? localizer.format(date, 'HH:mm', culture) : '',
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              localizer 
                ? `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
                : '',
            agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
               localizer 
                ? `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
                : '',
             dayFormat: (date, culture, localizer) =>
              localizer ? localizer.format(date, 'EEE d', culture) : '', // 'Lun 5'
          }}
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
