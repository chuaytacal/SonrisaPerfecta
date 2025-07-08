"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  Navigate,
} from "react-big-calendar";
import { useRouter } from "next/navigation";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import es from "date-fns/locale/es";
import { addMinutes, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ListFilter,
  LayoutGrid,
  Rows3,
  Megaphone,
  Filter,
} from "lucide-react";
import { AppointmentModal } from "@/components/calendario/AppointmentModal";
import { AppointmentPopoverContent } from "@/components/calendario/AppointmentPopoverContent";
import { RescheduleModal } from "@/components/calendario/RescheduleModal";
import { RescheduleConfirmationModal } from "@/components/calendario/RescheduleConfirmationModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type {
  Appointment,
  AppointmentFormData,
  AppointmentState,
  RescheduleData,
} from "@/types/calendar";
import type { Presupuesto, ItemPresupuesto } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  mockPacientesData,
  mockPersonalData,
  mockMotivosCita,
  mockAppointmentsData,
  mockPresupuestosData,
  mockPagosData,
} from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Personal } from "@/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import api from "@/lib/api";

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const messages = {
  allDay: "Todo el día",
  previous: "<",
  next: ">",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay citas en este rango.",
  showMore: (total: number) => `+ Ver más (${total})`,
};

const statusColors = {
  pendiente: "#f59e0b",
  confirmada: "#5625b3",
  completada: "#16a34a",
  cancelada: "#dc2626",
  reprogramada: "#6b7280",
};

export default function CalendarioPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();

  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPastDateWarningOpen, setIsPastDateWarningOpen] = useState(false);
  const [pendingSlotInfo, setPendingSlotInfo] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [currentView, setCurrentView] = useState<keyof typeof Views>(
    Views.MONTH
  );
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [selectedEventForPopover, setSelectedEventForPopover] =
    useState<Appointment | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLDivElement>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isRescheduleConfirmOpen, setIsRescheduleConfirmOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<RescheduleData | null>(
    null
  );
  const [shouldDeleteOnReschedule, setShouldDeleteOnReschedule] =
    useState(false);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [appointmentToAction, setAppointmentToAction] =
    useState<Appointment | null>(null);

  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<AppointmentState | "all">(
    "all"
  );
  const [motivoFilter, setMotivoFilter] = useState<string>("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get("/appointments");

        const updatedAppointments = response.data.map((appointment) => {

          const eventColor = statusColors[appointment.estadoCita] || "#f59e0b";


          const startDate = new Date(
            `${appointment.fechaCita}T${appointment.horaInicio}`
          );
          const endDate = new Date(
            `${appointment.fechaCita}T${appointment.horaFin}`
          );

          return {
            ...appointment,
            start: startDate,
            end: endDate,
            eventColor,
          };
        });

        setAppointments(updatedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error al cargar las citas",
          description: "Hubo un problema al obtener las citas del servidor.",
          variant: "destructive",
        });
      }
    };

    fetchAppointments();
  }, []);

  const doctorOptions = useMemo(
    () => [
      { value: "all", label: "Todos los doctores" },
      ...mockPersonalData
        .filter((p) => p.estado === "Activo")
        .map((d) => ({
          value: d.id,
          label: `${d.persona.nombre} ${d.persona.apellidoPaterno}`,
        })),
    ],
    []
  );

  const statusOptions: { value: AppointmentState | "all"; label: string }[] = [
    { value: "all", label: "Todos los estados" },
    { value: "pendiente", label: "pendiente" },
    { value: "confirmada", label: "confirmada" },
    { value: "completada", label: "completada" },
    { value: "cancelada", label: "cancelada" },
    { value: "reprogramada", label: "reprogramada" },
  ];

  const motivoOptions = useMemo(
    () => [
      { value: "all", label: "Todos los motivos" },
      ...mockMotivosCita.map((m) => ({ value: m.id, label: m.nombre })),
    ],
    []
  );

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const doctorMatch =
        doctorFilter === "all" || appointment.idDoctor === doctorFilter;
      const statusMatch =
        statusFilter === "all" || appointment.estado === statusFilter;
      const motivoMatch =
        motivoFilter === "all" || appointment.idMotivoCita === motivoFilter;
      return doctorMatch && statusMatch && motivoMatch;
    });
  }, [appointments, doctorFilter, statusFilter, motivoFilter]);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (start < new Date()) {
        setPendingSlotInfo({ start, end });
        setIsPastDateWarningOpen(true);
      } else {
        setEditingAppointment(null);
        setSelectedSlot({ start, end });
        setIsModalOpen(true);
      }
    },
    []
  );

  const handleAcknowledgePastDate = () => {
    setIsPastDateWarningOpen(false);
    if (pendingSlotInfo) {
      setEditingAppointment(null);
      setSelectedSlot(pendingSlotInfo);
      setIsModalOpen(true);
      setPendingSlotInfo(null);
    }
  };

  const handleSelectEvent = useCallback(
    (event: Appointment, e: React.SyntheticEvent) => {
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
    },
    []
  );

  const handleUpdateState = async (
    event: Appointment,
    newState: AppointmentState
  ) => {

    if (!event || !event.idCita) {
      console.error("Evento no encontrado o idCita no disponible");
      return; 
    }

    console.log("Evento dentro de handleUpdateState:", event);
    console.log("Estado que se está enviando:", newState);

    const appointmentId = event.idCita;
    console.log("ID de la cita seleccionada:", appointmentId);

    const updatedAppointments = appointments.map((app) => {
      if (app.idCita === appointmentId) {
        return {
          ...app,
          estadoCita: newState,
          eventColor: statusColors[newState] || "#f59e0b",
        };
      }
      return app;
    });

    setAppointments(updatedAppointments);

    try {
      console.log(
        `Enviando solicitud PATCH a la API para la cita ${appointmentId}...`
      );
      const response = await fetch(
        `http://localhost:3001/api/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estadoCita: newState,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en la respuesta del servidor:", errorData);
        throw new Error(
          `Error al actualizar la cita: ${response.status} ${
            errorData.message || "sin mensaje"
          }`
        );
      }

      toast({
        title: "Cita actualizada",
        description: `La cita ha sido marcada como ${newState}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      setAppointments(appointments);

      toast({
        title: "Error al actualizar la cita",
        description: "Hubo un problema al actualizar el estado de la cita.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditModalFromPopover = () => {
    setEditingAppointment(selectedEventForPopover);
    setIsModalOpen(true);
    setPopoverOpen(false);
  };

  const handleOpenRescheduleModalFromPopover = () => {
    setShouldDeleteOnReschedule(false);
    setIsRescheduleModalOpen(true);
    setPopoverOpen(false);
  };

  const handleDeleteFromPopover = () => {
    setAppointmentToAction(selectedEventForPopover);
    setIsConfirmDeleteDialogOpen(true);
    setPopoverOpen(false);
  };

  const confirmCancelAppointment = () => {
    if (!appointmentToAction) return;

    const appIndex = appointments.findIndex(
      (app) => app.id === appointmentToAction.id
    );
    if (appIndex > -1) {
      appointments[appIndex].estado = "Cancelada";
    }
    setAppointments([...appointments]);

    const budgetToCancel = mockPresupuestosData.find(
      (b) => b.idCita === appointmentToAction.id
    );
    if (budgetToCancel) {
      budgetToCancel.estado = "Cancelado";
      mockPagosData.forEach((pago) => {
        if (
          pago.itemsPagados.some((ip) => ip.idPresupuesto === budgetToCancel.id)
        ) {
          pago.estado = "desactivo";
        }
      });
    }

    toast({
      title: "Cita Cancelada",
      description: `La cita para "${appointmentToAction.paciente?.persona.nombre}" ha sido marcada como cancelada. No se eliminó ningún registro.`,
      variant: "destructive",
    });
    setIsConfirmDeleteDialogOpen(false);
    setAppointmentToAction(null);
  };

  const handleSaveAppointment = async (formData: AppointmentFormData) => {
    const startDateTime = new Date(formData.fecha);
    const [startHours, startMinutes] = formData.horaInicio
      .split(":")
      .map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    const endDateTime = addMinutes(startDateTime, formData.duracion);

    const paciente = mockPacientesData.find(
      (p) => p.id === formData.idPaciente
    );
    const doctor = mockPersonalData.find((p) => p.id === formData.idDoctor);
    const motivoCita = mockMotivosCita.find(
      (m) => m.id === formData.idMotivoCita
    );

    if (!paciente || !doctor || !motivoCita) {
      window.location.reload();
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
      estado: editingAppointment ? formData.estado : "Pendiente",
      notas: formData.notas,
      eventColor: editingAppointment?.eventColor || "hsl(var(--primary))",
    };

    const existingIndex = mockAppointmentsData.findIndex(
      (app) => app.id === appointmentToSave.id
    );
    if (existingIndex > -1) {
      mockAppointmentsData[existingIndex] = appointmentToSave;
    } else {
      mockAppointmentsData.push(appointmentToSave);
    }

    setAppointments([...mockAppointmentsData]);

    window.location.reload();
  };

  const handleProceedToRescheduleConfirm = (data: RescheduleData) => {
    setRescheduleData(data);
    setIsRescheduleModalOpen(false);
    setIsRescheduleConfirmOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!selectedEventForPopover || !rescheduleData) return;

    const { newDate, newTime, newDoctorId } = rescheduleData;
    const [hours, minutes] = newTime.split(":").map(Number);
    const newStart = new Date(newDate);
    newStart.setHours(hours, minutes, 0, 0);

    const duration =
      selectedEventForPopover.end.getTime() -
      selectedEventForPopover.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    const newAppointment: Appointment = {
      ...selectedEventForPopover,
      id: crypto.randomUUID(),
      start: newStart,
      end: newEnd,
      idDoctor: newDoctorId,
      doctor: mockPersonalData.find((d) => d.id === newDoctorId),
      estado: "pendiente",
    };

    if (shouldDeleteOnReschedule) {
      const appIndex = mockAppointmentsData.findIndex(
        (app) => app.id === selectedEventForPopover.id
      );
      if (appIndex > -1) {
        mockAppointmentsData[appIndex].estado = "Cancelada";
      }

      const budget = mockPresupuestosData.find(
        (b) => b.idCita === selectedEventForPopover.id
      );
      if (budget) {
        budget.estado = "Cancelado";
        mockPagosData.forEach((p) => {
          if (p.itemsPagados.some((ip) => ip.idPresupuesto === budget.id)) {
            p.estado = "desactivo";
          }
        });
      }
      toast({
        title: "Cita Reprogramada",
        description: "La cita original ha sido cancelada y la nueva agendada.",
      });
    } else {
      const appointmentIndex = mockAppointmentsData.findIndex(
        (app) => app.id === selectedEventForPopover.id
      );
      if (appointmentIndex > -1) {
        mockAppointmentsData[appointmentIndex].estado = "Reprogramada";
      }
      toast({
        title: "Cita Reprogramada",
        description:
          "La nueva cita ha sido agendada y la original marcada como reprogramada.",
      });
    }

    mockAppointmentsData.push(newAppointment);

    const originalBudget = mockPresupuestosData.find(
      (b) => b.idCita === selectedEventForPopover.id
    );
    if (originalBudget) {
      originalBudget.idCita = newAppointment.id;
      originalBudget.fechaAtencion = newAppointment.start;
      originalBudget.doctorResponsableId = newAppointment.idDoctor;
    }

    setAppointments([...mockAppointmentsData]);
    setIsRescheduleConfirmOpen(false);
    setRescheduleData(null);
    setSelectedEventForPopover(null);
    setShouldDeleteOnReschedule(false);
  };

  const eventPropGetter = useCallback(
    (event: Appointment) => {
      const style: React.CSSProperties = {
        padding: "2px 5px",
        borderRadius: "4px",
        border: "none",
      };

      let backgroundColor =
        event.eventColor || statusColors[event.estado] || "#f59e0b";
      let color = "hsl(var(--primary-foreground))";

      const eventSummary = `${event.paciente?.persona.nombre} - ${event.motivoCita?.nombre}`;

      switch (event.estado) {
        case "cancelada":
          backgroundColor = statusColors["cancelada"];
          break;
        case "pendiente":
          backgroundColor = statusColors["pendiente"];
          break;
        case "completada":
          backgroundColor = statusColors["completada"];
          break;
        case "confirmada":
          backgroundColor = statusColors["confirmada"];
          break;
        case "reprogramada":
          backgroundColor = statusColors["reprogramada"];
          color = "hsl(var(--muted-foreground))";
          style.textDecoration = "line-through";
          break;
      }
      style.backgroundColor = backgroundColor;
      style.color = color;

      if (currentView === Views.AGENDA) {
        style.padding = "0.625rem";
        style.margin = "0px";
        style.borderRadius = "0px";
        style.color = "hsl(var(--card-foreground))";
      }

      return {
        style,
        className: "cursor-pointer",
        title: eventSummary,
      };
    },
    [currentView]
  );

  const CustomToolbar = ({
    date,
    view,
    views,
    label,
    onNavigate,
    onView,
  }: any) => {
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate(Navigate.PREVIOUS)}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate(Navigate.TODAY)}
              className="px-4 py-2 text-sm font-medium"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate(Navigate.NEXT)}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <h2 className="rbc-toolbar-label text-xl font-semibold text-foreground flex-grow text-center my-2 sm:my-0 order-first sm:order-none capitalize">
            {label}
          </h2>
          <div className="flex items-center gap-1">
            {(views as string[]).map((viewName) => {
              const IconComponent = viewIcons[viewName];
              const viewLabel =
                messages[viewName as keyof typeof messages] ||
                viewName.charAt(0).toUpperCase() + viewName.slice(1);
              return (
                <Button
                  key={viewName}
                  variant={view === viewName ? "default" : "outline"}
                  onClick={() => onView(viewName)}
                  size="sm"
                  className="px-3 py-2 text-sm button"
                  aria-label={`Vista ${viewLabel}`}
                >
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}{" "}
                  {viewLabel}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const calendarFormats = useMemo(
    () => ({
      dayFormat: (date: Date, culture?: string, localizerInstance?: any) =>
        localizerInstance.format(date, "EEE d/M", culture).toLowerCase(),
      weekdayFormat: (date: Date, culture?: string, localizerInstance?: any) =>
        localizerInstance.format(date, "EEE", culture).toLowerCase(),
      dateFormat: "d",
      timeGutterFormat: (
        date: Date,
        culture?: string,
        localizerInstance?: any
      ) => localizerInstance.format(date, "HH:mm", culture),
      eventTimeRangeFormat: (
        { start, end }: { start: Date; end: Date },
        culture?: string,
        localizerInstance?: any
      ) =>
        `${localizerInstance.format(
          start,
          "HH:mm",
          culture
        )} - ${localizerInstance.format(end, "HH:mm", culture)}`,
      agendaDateFormat: (
        date: Date,
        culture?: string,
        localizerInstance?: any
      ) => localizerInstance.format(date, "EEE, d MMM", culture),
      agendaTimeFormat: (
        date: Date,
        culture?: string,
        localizerInstance?: any
      ) => localizerInstance.format(date, "HH:mm", culture),
      agendaTimeRangeFormat: (
        { start, end }: { start: Date; end: Date },
        culture?: string,
        localizerInstance?: any
      ) =>
        `${localizerInstance.format(
          start,
          "HH:mm",
          culture
        )} – ${localizerInstance.format(end, "HH:mm", culture)}`,
      monthHeaderFormat: (
        date: Date,
        culture?: string,
        localizerInstance?: any
      ) => localizerInstance.format(date, "MMMM yyyy", culture),
      dayRangeHeaderFormat: (
        { start, end }: { start: Date; end: Date },
        culture?: string,
        localizerInstance?: any
      ) =>
        `${localizerInstance.format(
          start,
          "d MMM",
          culture
        )} - ${localizerInstance.format(end, "d MMM yyyy", culture)}`,
      dayHeaderFormat: (
        date: Date,
        culture?: string,
        localizerInstance?: any
      ) => localizerInstance.format(date, "eeee, d MMMM yyyy", culture),
    }),
    []
  );

  return (
    <div className="flex flex-col relative h-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Calendario de Citas
        </h1>
        <p className="text-muted-foreground">
          Gestiona y visualiza todas las citas programadas en la clínica.
        </p>
      </div>

      <div className="mb-4 p-0 border rounded-lg bg-card shadow-sm">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  Filtros de Búsqueda
                </span>
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
                      {doctorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Estado</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as AppointmentState | "all")
                    }
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
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
                      {motivoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
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
        {appointments.length > 0 ? (
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
            components={{ toolbar: CustomToolbar }}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            view={currentView}
            onView={(newView) => setCurrentView(newView as keyof typeof Views)}
            eventPropGetter={eventPropGetter}
            min={new Date(0, 0, 0, 7, 0, 0)}
            max={new Date(0, 0, 0, 21, 0, 0)}
            formats={calendarFormats}
            dayLayoutAlgorithm="no-overlap"
            popup
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
          setEditingAppointment(null);
          setSelectedSlot(null);
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
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAppointment}
          existingAppointment={editingAppointment}
          selectedSlot={selectedSlot}
        />
      )}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            ref={popoverTriggerRef}
            style={{ position: "fixed", pointerEvents: "none", opacity: 0 }}
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-70 sm:w-75 p-0"
          align="start"
          side="bottom"
        >
          {selectedEventForPopover && (
            <AppointmentPopoverContent
              appointment={selectedEventForPopover}
              onUpdateState={(newState) =>
                handleUpdateState(selectedEventForPopover, newState)
              }
              onEdit={handleOpenEditModalFromPopover}
              onReschedule={handleOpenRescheduleModalFromPopover}
              onDelete={handleDeleteFromPopover}
              onViewPatient={(patientId) =>
                router.push(`/gestion-usuario/pacientes/${patientId}/filiacion`)
              }
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
            doctor: mockPersonalData.find(
              (d) => d.id === rescheduleData.newDoctorId
            ) as Personal,
          }}
          shouldDelete={shouldDeleteOnReschedule}
          onShouldDeleteChange={setShouldDeleteOnReschedule}
        />
      )}

      <Dialog
        open={isPastDateWarningOpen}
        onOpenChange={setIsPastDateWarningOpen}
      >
        <DialogContent className="w-[90vw] md:w-[40vw] max-w-xl p-6">
          <DialogHeader className="flex flex-col items-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Megaphone className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-semibold">
              Estás en una fecha pasada
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="mt-2 text-base text-center leading-relaxed">
            La cita que se está programando corresponde a una fecha pasada, por
            lo que no se generará un recordatorio.
          </DialogDescription>
          <DialogFooter className="mt-6 sm:justify-center">
            <Button onClick={handleAcknowledgePastDate} className="w-auto">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={confirmCancelAppointment}
        title="Confirmar Cancelación"
        description={
          <span>
            ¿Estás seguro de que deseas cancelar la cita para{" "}
            <strong>{appointmentToAction?.paciente?.persona.nombre}</strong>?
            <br />
            <span className="mt-2 inline-block text-sm text-destructive">
              La cita y su presupuesto asociado (si existe) se marcarán como
              "Cancelado" pero no se eliminarán del sistema.
            </span>
          </span>
        }
        confirmButtonText="Sí, cancelar cita"
        confirmButtonVariant="destructive"
      />
    </div>
  );
}
