
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import type { Appointment, RescheduleData } from '@/types/calendar';
import { es } from 'date-fns/locale';
import { startOfDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Combobox } from '@/components/ui/combobox';
import { mockPersonalData, mockUsuariosData } from '@/lib/data';
import { Globe } from 'lucide-react';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (data: RescheduleData) => void;
  appointment: Appointment;
}

export function RescheduleModal({ isOpen, onClose, onNext, appointment }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(appointment.start);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(appointment.idDoctor);

  const doctorOptions = useMemo(() => {
    const activeDoctors = mockPersonalData.filter(p => {
      if (p.estado !== 'Activo') return false;
      const user = mockUsuariosData.find(u => u.id === p.idUsuario);
      return user?.rol === 'Doctor';
    });
    return activeDoctors.map(p => ({
      value: p.id,
      label: `${p.persona.nombre} ${p.persona.apellidoPaterno} (${p.especialidad})`
    }));
  }, []);

  const availableTimes = useMemo(() => {
    // In a real app, this would check doctor's availability
    const times = [];
    for (let i = 8; i < 20; i++) {
      times.push(`${String(i).padStart(2, '0')}:00`);
      times.push(`${String(i).padStart(2, '0')}:30`);
    }
    return times;
  }, [selectedDate]);

  const handleNext = () => {
    if (selectedDate && selectedTime && selectedDoctorId) {
      onNext({
        newDate: selectedDate,
        newTime: selectedTime,
        newDoctorId: selectedDoctorId,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(appointment.start);
      setSelectedTime(null);
      setSelectedDoctorId(appointment.idDoctor);
    }
  }, [isOpen, appointment]);

  const isNextDisabled = !selectedDate || !selectedTime || !selectedDoctorId;

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
              {/* Left side: Calendar and Timezone */}
              <div className='flex flex-col space-y-4'>
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
                   <div className='flex items-center justify-center text-sm text-muted-foreground p-2 bg-muted/50 rounded-md'>
                      <Globe className='h-4 w-4 mr-2'/>
                      <span className='font-medium'>Zona Horaria:</span>
                      <span className='ml-1'>GMT-05:00 America/Lima</span>
                   </div>
              </div>

              {/* Right side: Doctor and Time slots */}
              <div className='flex flex-col space-y-4'>
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
                      <p className='text-sm text-center font-medium mb-2'>Seleccione una hora</p>
                      <ScrollArea className="h-72 pr-3">
                          <div className="grid grid-cols-3 gap-2">
                              {availableTimes.map((time) => (
                                  <Button
                                  key={time}
                                  variant={selectedTime === time ? 'default' : 'outline'}
                                  onClick={() => setSelectedTime(time)}
                                  >
                                  {time}
                                  </Button>
                              ))}
                          </div>
                      </ScrollArea>
                   </div>
              </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t justify-center">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleNext} disabled={isNextDisabled}>
                Siguiente
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
