"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { startOfDay } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Combobox } from "@/components/ui/combobox";
import { Globe } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (data: any) => void;
  appointmentId: string;
}

export function RescheduleModal({
  isOpen,
  onClose,
  onNext,
  appointmentId,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorOptions, setDoctorOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  const allTimes = useMemo(() => {
    const times = [];
    for (let i = 8; i < 20; i++) {
      times.push(`${String(i).padStart(2, "0")}:00`);
      times.push(`${String(i).padStart(2, "0")}:30`);
    }
    return times;
  }, []);

  const endTimeOptions = useMemo(() => {
    if (!selectedTime) return [];
    const [startHour, startMinute] = selectedTime.split(":").map(Number);
    const startTotal = startHour * 60 + startMinute;
    return allTimes.filter((time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m > startTotal;
    });
  }, [selectedTime, allTimes]);

  useEffect(() => {
    if (appointmentId) {
      const fetchAppointmentDetails = async () => {
        try {
          const response = await api.get(`/appointments/${appointmentId}`);
          setAppointmentDetails(response.data);
          const { fechaCita, horaInicio, horaFin, idSpecialist } =
            response.data;
          setSelectedDate(new Date(fechaCita));
          setSelectedTime(horaInicio);
          setSelectedEndTime(horaFin);
          setSelectedDoctorId(idSpecialist);
        } catch (error) {
          console.error("Error fetching appointment details:", error);
        }
      };

      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/appointments/combos");
        const { specialists } = response.data;
        const activeDoctors = specialists.map((doctor: any) => ({
          value: doctor.id,
          label: `${doctor.name}`,
        }));
        setDoctorOptions(activeDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleNext = async () => {
    if (selectedDate && selectedTime && selectedEndTime && selectedDoctorId) {
      try {
        const url = `http://localhost:3001/api/appointments/${appointmentId}`;

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fechaCita: format(selectedDate, "yyyy-MM-dd"),
            horaInicio: selectedTime,
            horaFin: selectedEndTime,
            idSpecialist: selectedDoctorId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response data:", errorData);
          throw new Error("Error al actualizar la cita.");
        }

        const data = await response.json();
        onNext(data);
        onClose();
        window.location.reload();
      } catch (error) {
        console.error("Error al reprogramar la cita:", error);
      }
    }
  };

  const isNextDisabled =
    !selectedDate || !selectedTime || !selectedEndTime || !selectedDoctorId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-3xl p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Reprogramar Cita</DialogTitle>
          <DialogDescription>
            Seleccione una nueva fecha, hora y doctor para la cita.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 px-6 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center rounded-md border">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={es}
                  disabled={(date) => date < startOfDay(new Date())}
                />
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                <Globe className="h-4 w-4 mr-2" />
                <span className="font-medium">Zona Horaria:</span>
                <span className="ml-1">GMT-05:00 America/Lima</span>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div>
                <label className="text-sm font-medium">Doctor</label>
                <Combobox
                  options={doctorOptions}
                  value={selectedDoctorId}
                  onChange={setSelectedDoctorId}
                  placeholder="Buscar doctor..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={selectedTime || ""}
                  onChange={(e) => {
                    setSelectedTime(e.target.value);
                    setSelectedEndTime(null);
                  }}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hora de Fin
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={selectedEndTime || ""}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  disabled={!selectedTime}
                  required
                >
                  <option value="">Seleccione una hora</option>
                  {endTimeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t justify-center">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleNext} disabled={isNextDisabled}>
              Siguiente
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
