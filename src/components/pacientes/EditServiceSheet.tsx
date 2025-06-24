
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { ItemPresupuesto, Paciente, Presupuesto, Pago, MetodoPago, TipoComprobante } from '@/types';
import { mockPagosData, mockPersonalData, mockPresupuestosData } from '@/lib/data';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, Trash2, X } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface EditServiceSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemPresupuesto;
  presupuesto: Presupuesto;
  paciente: Paciente;
  onUpdate: () => void;
}

export function EditServiceSheet({ isOpen, onOpenChange, item, presupuesto, onUpdate }: EditServiceSheetProps) {
  const { toast } = useToast();
  const [cantidad, setCantidad] = useState(item.cantidad);
  const [pagosDelItem, setPagosDelItem] = useState<Pago[]>([]);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editedPayment, setEditedPayment] = useState<Partial<Pago> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCantidad(item.cantidad);
      const pagosFiltrados = mockPagosData.filter(pago => 
        pago.itemsPagados.some(itemPagado => itemPagado.idItem === item.id && itemPagado.idPresupuesto === presupuesto.id)
      );
      setPagosDelItem(pagosFiltrados);
      setEditingPaymentId(null);
    }
  }, [isOpen, item, presupuesto.id]);

  const subtotal = item.procedimiento.precioBase * cantidad;
  const pagado = item.montoPagado || 0;
  const porPagar = subtotal - pagado;

  const handleEditPayment = (pago: Pago) => {
    setEditingPaymentId(pago.id);
    setEditedPayment({ ...pago });
  };

  const handleSavePaymentEdit = () => {
    if (!editingPaymentId || !editedPayment) return;

    const pagoIndex = mockPagosData.findIndex(p => p.id === editingPaymentId);
    if (pagoIndex > -1) {
      mockPagosData[pagoIndex] = { ...mockPagosData[pagoIndex], ...editedPayment } as Pago;
    }
    
    // Recalculate totals
    const presupuestoIndex = mockPresupuestosData.findIndex(p => p.id === presupuesto.id);
    if(presupuestoIndex > -1) {
        // Recalculate montoPagado for the item
        const newItemMontoPagado = mockPagosData
            .flatMap(p => p.itemsPagados)
            .filter(ip => ip.idPresupuesto === presupuesto.id && ip.idItem === item.id)
            .reduce((sum, ip) => sum + ip.monto, 0);

        const itemIndexInPresupuesto = mockPresupuestosData[presupuestoIndex].items.findIndex(i => i.id === item.id);
        if(itemIndexInPresupuesto > -1) {
            mockPresupuestosData[presupuestoIndex].items[itemIndexInPresupuesto].montoPagado = newItemMontoPagado;
        }
        
        // Recalculate montoPagado for the whole budget
        mockPresupuestosData[presupuestoIndex].montoPagado = mockPresupuestosData[presupuestoIndex].items.reduce((sum, i) => sum + i.montoPagado, 0);
    }
    
    setEditingPaymentId(null);
    setEditedPayment(null);
    onUpdate(); // Refresh parent component
    toast({ title: "Pago Actualizado", description: "El pago ha sido actualizado correctamente." });
  };

  const handleSaveChanges = () => {
    const presupuestoIndex = mockPresupuestosData.findIndex(p => p.id === presupuesto.id);
    if (presupuestoIndex === -1) return;

    const itemIndex = mockPresupuestosData[presupuestoIndex].items.findIndex(i => i.id === item.id);
    if (itemIndex === -1) return;
    
    mockPresupuestosData[presupuestoIndex].items[itemIndex].cantidad = cantidad;

    onUpdate();
    toast({ title: "Servicio Actualizado", description: `La cantidad de "${item.procedimiento.denominacion}" ha sido actualizada.` });
    onOpenChange(false);
  };
  
  const metodoPagoOptions: MetodoPago[] = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];
  const doctorOptions = mockPersonalData.filter(d => d.estado === 'Activo').map(d => ({ value: d.id, label: `${d.persona.nombre} ${d.persona.apellidoPaterno}` }));


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Editar Servicio</SheetTitle>
          <SheetDescription>Modifique la cantidad del servicio y edite los pagos asociados.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            {/* Service Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">{item.procedimiento.denominacion}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><Label>Precio Unit.</Label><p className="font-mono">S/ {item.procedimiento.precioBase.toFixed(2)}</p></div>
                    <div>
                        <Label htmlFor="cantidad-servicio">Cantidad</Label>
                        <Input id="cantidad-servicio" type="number" value={cantidad} onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))} className="w-20" />
                    </div>
                    <div><Label>Subtotal</Label><p className="font-mono">S/ {subtotal.toFixed(2)}</p></div>
                    <div><Label>Pagado</Label><p className="font-mono text-green-600">S/ {pagado.toFixed(2)}</p></div>
                    <div><Label>Por Pagar</Label><p className="font-mono text-red-600">S/ {porPagar.toFixed(2)}</p></div>
                </div>
            </div>
            {/* Payments Table */}
            <div className="space-y-2">
              <Label>Pagos Registrados para este Servicio</Label>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Medio de Pago</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagosDelItem.length > 0 ? (
                      pagosDelItem.map(pago => (
                        <TableRow key={pago.id}>
                          {editingPaymentId === pago.id ? (
                            <>
                                <TableCell>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-xs w-[120px]">
                                                {format(editedPayment?.fechaPago ? new Date(editedPayment.fechaPago) : new Date(), 'dd/MM/yyyy')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent><Calendar mode="single" selected={editedPayment?.fechaPago ? new Date(editedPayment.fechaPago) : undefined} onSelect={date => setEditedPayment(prev => ({...prev, fechaPago: date!}))} /></PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell>
                                    <Select value={editedPayment?.doctorResponsableId} onValueChange={val => setEditedPayment(prev => ({...prev, doctorResponsableId: val}))}>
                                        <SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger>
                                        <SelectContent>{doctorOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                     <Select value={editedPayment?.metodoPago} onValueChange={val => setEditedPayment(prev => ({...prev, metodoPago: val as MetodoPago}))}>
                                        <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                        <SelectContent>{metodoPagoOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Input type="number" value={editedPayment?.montoTotal} onChange={e => setEditedPayment(prev => ({...prev, montoTotal: parseFloat(e.target.value)}))} className="w-24 text-right" />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-1 justify-end">
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSavePaymentEdit}><Save className="h-4 w-4"/></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingPaymentId(null)}><X className="h-4 w-4"/></Button>
                                    </div>
                                </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{format(new Date(pago.fechaPago), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{mockPersonalData.find(d => d.id === pago.doctorResponsableId)?.persona.nombre || 'N/A'}</TableCell>
                              <TableCell>{pago.metodoPago}</TableCell>
                              <TableCell className="text-right">S/ {pago.montoTotal.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditPayment(pago)}><Edit className="h-4 w-4"/></Button>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No hay pagos registrados para este servicio.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="p-6 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
