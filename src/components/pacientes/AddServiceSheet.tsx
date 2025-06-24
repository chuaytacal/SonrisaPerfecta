
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { mockProcedimientos } from '@/lib/data';
import type { Procedimiento } from '@/types';
import { Combobox } from '@/components/ui/combobox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

interface AddServiceSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (items: { procedimiento: Procedimiento; cantidad: number }[], nombre: string) => void;
}

export function AddServiceSheet({ isOpen, onOpenChange, onSave }: AddServiceSheetProps) {
  const [selectedItems, setSelectedItems] = useState<{ procedimiento: Procedimiento; cantidad: number }[]>([]);
  const [nombrePresupuesto, setNombrePresupuesto] = useState('');

  const procedimientoOptions = mockProcedimientos.map(p => ({
    value: p.id,
    label: `${p.denominacion} - S/ ${p.precioBase.toFixed(2)}`,
  }));

  const handleAddServicio = (procedimientoId: string) => {
    const procedimiento = mockProcedimientos.find(p => p.id === procedimientoId);
    if (procedimiento && !selectedItems.some(item => item.procedimiento.id === procedimientoId)) {
      setSelectedItems(prev => [...prev, { procedimiento, cantidad: 1 }]);
    }
  };

  const handleRemoveServicio = (procedimientoId: string) => {
    setSelectedItems(prev => prev.filter(item => item.procedimiento.id !== procedimientoId));
  };

  const handleUpdateCantidad = (procedimientoId: string, delta: number) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.procedimiento.id === procedimientoId
          ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
          : item
      )
    );
  };

  const total = selectedItems.reduce((acc, item) => acc + item.procedimiento.precioBase * item.cantidad, 0);

  const handleSaveClick = () => {
    onSave(selectedItems, nombrePresupuesto);
    // Reset state after saving
    setSelectedItems([]);
    setNombrePresupuesto('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Añadir Presupuesto/Servicio</SheetTitle>
          <SheetDescription>
            Seleccione los servicios para crear un nuevo presupuesto para el paciente.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="nombre-presupuesto">Nombre del Presupuesto (Opcional)</Label>
              <Input
                id="nombre-presupuesto"
                value={nombrePresupuesto}
                onChange={(e) => setNombrePresupuesto(e.target.value)}
                placeholder="Ej: Plan de Ortodoncia"
              />
            </div>
            <div>
              <Label>Servicios</Label>
              <Combobox
                options={procedimientoOptions.filter(
                  opt => !selectedItems.some(item => item.procedimiento.id === opt.value)
                )}
                onChange={handleAddServicio}
                placeholder="Buscar y agregar servicio..."
              />
            </div>
            <div className="border rounded-lg mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.length > 0 ? (
                    selectedItems.map(item => (
                      <TableRow key={item.procedimiento.id}>
                        <TableCell className="font-medium">{item.procedimiento.denominacion}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCantidad(item.procedimiento.id, -1)}><MinusCircle className="h-4 w-4" /></Button>
                                <span>{item.cantidad}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCantidad(item.procedimiento.id, 1)}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">S/ {(item.procedimiento.precioBase * item.cantidad).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveServicio(item.procedimiento.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No hay servicios seleccionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {selectedItems.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} className="text-right font-bold text-lg">Total</TableCell>
                            <TableCell className="text-right font-bold text-lg">S/ {total.toFixed(2)}</TableCell>
                            <TableCell/>
                        </TableRow>
                    </TableFooter>
                )}
              </Table>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="p-6 border-t mt-auto">
            <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleSaveClick} disabled={selectedItems.length === 0}>
                Guardar Presupuesto
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
