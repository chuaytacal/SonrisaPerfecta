
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import type { Appointment } from '@/types/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDate: Date, newTime: string) => void;
  appointment: Appointment;
}

export function RescheduleModal({ isOpen, onClose, onSave, appointment }: RescheduleModalProps) {
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(appointment.start);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableTimes = useMemo(() => {
    // In a real app, this would check doctor's availability
    const times = [];
    for (let i = 8; i < 20; i++) {
      times.push(`${String(i).padStart(2, '0')}:00`);
      times.push(`${String(i).padStart(2, '0')}:30`);
    }
    return times;
  }, [selectedDate]);

  const handleSave = () => {
    if (selectedDate && selectedTime) {
      onSave(selectedDate, selectedTime);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('date');
    setSelectedTime(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reprogramar Cita</DialogTitle>
          <DialogDescription>
            {step === 'date'
              ? 'Seleccione la nueva fecha para la cita.'
              : `Seleccione la nueva hora para el ${format(selectedDate!, "d 'de' MMMM", { locale: es })}.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {step === 'date' ? (
            <div className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={es}
                    disabled={(date) => date < new Date()}
                />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-2">
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
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          {step === 'date' ? (
            <Button onClick={() => setStep('time')} disabled={!selectedDate}>
              Siguiente
            </Button>
          ) : (
            <>
            <Button variant="ghost" onClick={() => setStep('date')}>Atrás</Button>
            <Button onClick={handleSave} disabled={!selectedTime}>Guardar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
