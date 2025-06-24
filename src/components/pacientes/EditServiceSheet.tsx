
"use client";

import React, { useState, useEffect } from 'react';
import type { ItemPresupuesto, Paciente, Presupuesto, Pago, MetodoPago } from '@/types';
import { mockPagosData, mockPersonalData, mockPresupuestosData } from '@/lib/data';
import { format } from 'date-fns';
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
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Megaphone } from 'lucide-react';


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
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [paymentToDelete, setPaymentToDelete] = useState<Pago | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isExceededAlertOpen, setIsExceededAlertOpen] = useState(false);
  const [exceededInfo, setExceededInfo] = useState<{ typed: number, max: number } | null>(null);


  useEffect(() => {
    if (isOpen) {
      const pagosFiltrados = mockPagosData.filter(pago => 
        pago.itemsPagados.some(itemPagado => itemPagado.idItem === item.id && itemPagado.idPresupuesto === presupuesto.id)
      );
      setPagos(JSON.parse(JSON.stringify(pagosFiltrados)));
    }
  }, [isOpen, item, presupuesto.id]);

  const subtotal = item.procedimiento.precioBase * item.cantidad;
  const pagado = pagos.reduce((acc, p) => acc + (typeof p.montoTotal === 'number' ? p.montoTotal : parseFloat(p.montoTotal as any)), 0);
  const porPagar = subtotal - pagado;

  const handlePagoChange = (pagoId: string, field: keyof Omit<Pago, 'id' | 'idPaciente' | 'itemsPagados'>, value: any) => {
    let finalValue = value;
    if (field === 'montoTotal') {
        const newMonto = parseFloat(value) || 0;
        const otrosPagosMonto = pagos
            .filter(p => p.id !== pagoId)
            .reduce((acc, p) => acc + p.montoTotal, 0);
        
        const maxPermitido = parseFloat((subtotal - otrosPagosMonto).toFixed(2));

        if (newMonto > maxPermitido) {
            setExceededInfo({ typed: newMonto, max: maxPermitido });
            setIsExceededAlertOpen(true);
            finalValue = maxPermitido;
        } else {
             finalValue = newMonto;
        }
    }
    
    setPagos(prev =>
      prev.map(p => (p.id === pagoId ? { ...p, [field]: finalValue } : p))
    );
  };
  
  const handleMontoBlur = (pagoId: string, currentMontoStr: string) => {
      const currentMonto = parseFloat(currentMontoStr) || 0;
      if(currentMonto <= 0) {
          const p = pagos.find(p => p.id === pagoId);
          if(p) {
            setPaymentToDelete(p);
            setIsDeleteConfirmOpen(true);
          }
      }
  };

  const confirmDeletePayment = () => {
    if (!paymentToDelete) return;
    setPagos(prev => prev.filter(p => p.id !== paymentToDelete.id));
    setIsDeleteConfirmOpen(false);
    setPaymentToDelete(null);
    toast({ title: "Eliminación pendiente", description: "El pago se eliminará permanentemente al guardar los cambios." });
  };


  const handleSaveChanges = () => {
    const presupuestoIndex = mockPresupuestosData.findIndex(p => p.id === presupuesto.id);
    if (presupuestoIndex === -1) return;

    const originalPagoIds = new Set(mockPagosData
        .filter(p => p.itemsPagados.some(ip => ip.idItem === item.id && ip.idPresupuesto === presupuesto.id))
        .map(p => p.id)
    );

    const currentPagoIds = new Set(pagos.map(p => p.id));
    const deletedPagoIds = [...originalPagoIds].filter(id => !currentPagoIds.has(id));

    // Update mockPagosData
    // 1. Remove deleted payments
    let tempPayments = mockPagosData.filter(p => !deletedPagoIds.includes(p.id));
    // 2. Update existing payments
    const finalPayments = tempPayments.map(p => {
        const updatedPago = pagos.find(up => up.id === p.id);
        return updatedPago || p;
    });

    mockPagosData.length = 0;
    Array.prototype.push.apply(mockPagosData, finalPayments);
    
    // Recalculate item and budget totals
    const newItemMontoPagado = pagos.reduce((sum, p) => sum + p.montoTotal, 0);

    const itemIndex = mockPresupuestosData[presupuestoIndex].items.findIndex(i => i.id === item.id);
    if (itemIndex > -1) {
        mockPresupuestosData[presupuestoIndex].items[itemIndex].montoPagado = newItemMontoPagado;
    }

    mockPresupuestosData[presupuestoIndex].montoPagado = mockPresupuestosData[presupuestoIndex].items.reduce((sum, i) => sum + (i.montoPagado || 0), 0);
    
    const totalPresupuestoCalculado = mockPresupuestosData[presupuestoIndex].items.reduce((acc, currentItem) => acc + (currentItem.procedimiento.precioBase * currentItem.cantidad), 0);
    if (mockPresupuestosData[presupuestoIndex].montoPagado >= totalPresupuestoCalculado) {
      mockPresupuestosData[presupuestoIndex].estado = 'Terminado';
    }


    onUpdate();
    toast({ title: "Servicio Actualizado", description: `Los pagos de "${item.procedimiento.denominacion}" han sido actualizados.` });
    onOpenChange(false);
  };
  
  const metodoPagoOptions: MetodoPago[] = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[65vw] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Editar Servicio</SheetTitle>
          <SheetDescription>Modifique los pagos asociados a este servicio.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            {/* Service Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">{item.procedimiento.denominacion}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div><Label>Precio Unit.</Label><p className="font-mono text-lg">S/ {item.procedimiento.precioBase.toFixed(2)}</p></div>
                    <div>
                        <Label htmlFor="cantidad-servicio">Cantidad</Label>
                        <p className="font-mono text-lg">{item.cantidad}</p>
                    </div>
                    <div><Label>Subtotal</Label><p className="font-mono text-lg">S/ {subtotal.toFixed(2)}</p></div>
                    <div><Label>Pagado</Label><p className="font-mono text-lg text-green-600">S/ {pagado.toFixed(2)}</p></div>
                    <div><Label>Por Pagar</Label><p className="font-mono text-lg text-red-600">S/ {porPagar.toFixed(2)}</p></div>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.length > 0 ? (
                      pagos.map(pago => {
                        const doctor = mockPersonalData.find(d => d.id === pago.doctorResponsableId);
                        return (
                          <TableRow key={pago.id}>
                              <TableCell className="w-[140px]">
                                  <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant="outline" size="sm" className="text-xs w-full">
                                              {format(new Date(pago.fechaPago), 'dd/MM/yyyy')}
                                          </Button>
                                      </PopoverTrigger>
                                      <PopoverContent>
                                        <Calendar 
                                            mode="single" 
                                            selected={new Date(pago.fechaPago)} 
                                            onSelect={(date) => handlePagoChange(pago.id, 'fechaPago', date!)} 
                                            disabled={(date) => date < new Date(presupuesto.fechaCreacion)}
                                        />
                                      </PopoverContent>
                                  </Popover>
                              </TableCell>
                              <TableCell className="w-[180px]">
                                  <Input
                                    value={doctor ? `${doctor.persona.nombre} ${doctor.persona.apellidoPaterno}` : 'N/A'}
                                    disabled
                                  />
                              </TableCell>
                              <TableCell className="w-[150px]">
                                   <Select value={pago.metodoPago} onValueChange={val => handlePagoChange(pago.id, 'metodoPago', val as MetodoPago)}>
                                      <SelectTrigger><SelectValue/></SelectTrigger>
                                      <SelectContent>{metodoPagoOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                  </Select>
                              </TableCell>
                              <TableCell className="text-right w-[120px]">
                                  <Input type="number" value={pago.montoTotal} onChange={e => handlePagoChange(pago.id, 'montoTotal', e.target.value)} onBlur={e => handleMontoBlur(pago.id, e.target.value)} className="w-24 text-right" />
                              </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
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
    <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDeletePayment}
        title="Confirmar Eliminación de Pago"
        description="¿Está seguro de que desea eliminar este pago? Esta acción no se puede deshacer y se eliminará del historial de pagos."
        confirmButtonText="Sí, eliminar"
        confirmButtonVariant="destructive"
      />
    <Dialog open={isExceededAlertOpen} onOpenChange={setIsExceededAlertOpen}>
        <DialogContent className="w-[90vw] md:w-[40vw] max-w-xl p-6">
            <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Megaphone className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <DialogTitle className="text-2xl font-semibold">Monto Excedido</DialogTitle>
                    <DialogDescription className="text-base leading-relaxed mt-2">
                        El monto a cobrar (S/ {(exceededInfo?.typed ?? 0).toFixed(2)}) es mayor que el saldo pendiente para este servicio (S/ {(exceededInfo?.max ?? 0).toFixed(2)}). Por favor, ajuste el monto.
                    </DialogDescription>
                </div>
            </div>
            <DialogFooter className="mt-4 sm:justify-center">
                <Button onClick={() => setIsExceededAlertOpen(false)} className="w-auto">Entendido</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
