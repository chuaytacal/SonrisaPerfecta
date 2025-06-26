
"use client";

import React, { useState, useEffect } from 'react';
import type { ItemPresupuesto, Paciente, Presupuesto, Pago, MetodoPago, Personal } from '@/types';
import { mockPagosData, mockPresupuestosData, mockPersonalData } from '@/lib/data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
import { Badge } from '../ui/badge';


interface EditServiceSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemPresupuesto;
  presupuesto: Presupuesto;
  paciente: Paciente;
  onUpdate: () => void;
}

interface EditablePago {
    id: string; // Original Pago ID
    fechaPago: Date;
    metodoPago: MetodoPago;
    monto: number;
    estado: 'activo' | 'desactivo';
}

export function EditServiceSheet({ isOpen, onOpenChange, item, presupuesto, onUpdate }: EditServiceSheetProps) {
  const { toast } = useToast();
  const [editablePagos, setEditablePagos] = useState<EditablePago[]>([]);
  const [paymentToDeactivate, setPaymentToDeactivate] = useState<EditablePago | null>(null);
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [isExceededAlertOpen, setIsExceededAlertOpen] = useState(false);
  const [exceededInfo, setExceededInfo] = useState<{ typed: number, max: number } | null>(null);
  const [doctor, setDoctor] = useState<Personal | undefined>(undefined);


  useEffect(() => {
    if (isOpen) {
      const pagosDelItem = mockPagosData.reduce<EditablePago[]>((acc, pago) => {
        const itemPagado = pago.itemsPagados.find(
          (ip) => ip.idItem === item.id && ip.idPresupuesto === presupuesto.id
        );
        if (itemPagado) {
          acc.push({
            id: pago.id,
            fechaPago: pago.fechaPago,
            metodoPago: pago.metodoPago,
            monto: itemPagado.monto,
            estado: pago.estado,
          });
        }
        return acc;
      }, []);
      setEditablePagos(JSON.parse(JSON.stringify(pagosDelItem)));
      const foundDoctor = mockPersonalData.find(d => d.id === presupuesto.doctorResponsableId);
      setDoctor(foundDoctor);
    }
  }, [isOpen, item, presupuesto.id, presupuesto.doctorResponsableId]);

  const subtotal = item.procedimiento.precioBase * item.cantidad;
  const pagado = editablePagos.filter(p => p.estado === 'activo').reduce((acc, p) => acc + p.monto, 0);
  const porPagar = subtotal - pagado;

  const handlePagoChange = (pagoId: string, field: 'fechaPago' | 'metodoPago' | 'monto', value: any) => {
    let finalValue = value;
    
    if (field === 'monto') {
        const newMonto = parseFloat(value) || 0;
        
        const otrosPagosActivosMonto = editablePagos
            .filter(p => p.id !== pagoId && p.estado === 'activo')
            .reduce((acc, p) => acc + p.monto, 0);
        
        const maxPermitido = parseFloat((subtotal - otrosPagosActivosMonto).toFixed(2));

        if (newMonto > maxPermitido) {
            setExceededInfo({ typed: newMonto, max: maxPermitido });
            setIsExceededAlertOpen(true);
            finalValue = maxPermitido;
        } else {
             finalValue = newMonto;
        }

        const newEstado = finalValue > 0 ? 'activo' : 'desactivo';
        setEditablePagos(prev =>
          prev.map(p => (p.id === pagoId ? { ...p, monto: finalValue, estado: newEstado } : p))
        );

    } else {
       setEditablePagos(prev =>
        prev.map(p => (p.id === pagoId ? { ...p, [field]: value } : p))
      );
    }
  };
  
  const handleMontoBlur = (pagoId: string) => {
      const pago = editablePagos.find(p => p.id === pagoId);
      if(pago && pago.monto <= 0 && pago.estado === 'activo') {
        setPaymentToDeactivate(pago);
        setIsDeactivateConfirmOpen(true);
      }
  };

  const confirmDeactivatePayment = () => {
    if (!paymentToDeactivate) return;
    setEditablePagos(prev => prev.map(p => p.id === paymentToDeactivate.id ? { ...p, estado: 'desactivo' } : p));
    setIsDeactivateConfirmOpen(false);
    setPaymentToDeactivate(null);
    toast({ title: "Cambio pendiente", description: "El pago se marcará como 'desactivo' al guardar los cambios." });
  };


  const handleSaveChanges = () => {
    // 1. Update the payments in the master data list
    editablePagos.forEach(editablePago => {
      const originalPagoIndex = mockPagosData.findIndex(p => p.id === editablePago.id);
      if (originalPagoIndex > -1) {
        const originalPago = mockPagosData[originalPagoIndex];

        // Update the amount for the specific item within the payment record
        const itemPagadoIndex = originalPago.itemsPagados.findIndex(
          ip => ip.idPresupuesto === presupuesto.id && ip.idItem === item.id
        );

        if (itemPagadoIndex > -1) {
          originalPago.itemsPagados[itemPagadoIndex].monto = editablePago.monto;
        }

        // Recalculate the payment's total monto based on ALL its items
        const newTotalMonto = originalPago.itemsPagados.reduce((sum, ip) => sum + ip.monto, 0);
        originalPago.montoTotal = newTotalMonto;
        
        // A payment's state is determined by its total. If 0, it's inactive.
        originalPago.estado = newTotalMonto > 0.009 ? 'activo' : 'desactivo';
        
        // Update other details only if it remains active
        if (originalPago.estado === 'activo') {
            originalPago.fechaPago = editablePago.fechaPago;
            originalPago.metodoPago = editablePago.metodoPago;
        }
      }
    });

    // 2. Recalculate all paid amounts for the entire budget from the updated source of truth
    const presupuestoIndex = mockPresupuestosData.findIndex(p => p.id === presupuesto.id);
    if (presupuestoIndex === -1) return;
    
    const budgetToUpdate = mockPresupuestosData[presupuestoIndex];
    let totalBudgetPaid = 0;

    budgetToUpdate.items.forEach(budgetItem => {
        let itemPaidAmount = 0;
        mockPagosData.forEach(pago => {
            if (pago.estado === 'activo') { // Only consider active payments
                const itemPagado = pago.itemsPagados.find(ip => ip.idItem === budgetItem.id && ip.idPresupuesto === budgetToUpdate.id);
                if (itemPagado) {
                    itemPaidAmount += itemPagado.monto;
                }
            }
        });
        budgetItem.montoPagado = itemPaidAmount;
        totalBudgetPaid += itemPaidAmount;
    });

    // 3. Update the budget's total paid amount and its state
    budgetToUpdate.montoPagado = totalBudgetPaid;
    const totalPresupuestoCalculado = budgetToUpdate.items.reduce((acc, item) => acc + (item.procedimiento.precioBase * item.cantidad), 0);
    
    if (budgetToUpdate.estado !== 'Cancelado') {
      if (totalBudgetPaid >= totalPresupuestoCalculado - 0.001) { // Epsilon for float comparison
        budgetToUpdate.estado = 'Pagado';
      } else {
        budgetToUpdate.estado = 'Creado';
      }
    }

    // 4. Trigger parent component re-render and close
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
                    {editablePagos.length > 0 ? (
                      editablePagos.map(pago => (
                          <TableRow key={pago.id} className={cn(pago.estado === 'desactivo' && 'bg-muted/50 text-muted-foreground')}>
                              <TableCell className="w-[140px]">
                                  <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant="outline" size="sm" className="text-xs w-full" disabled={pago.estado === 'desactivo'}>
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
                                    className="disabled:cursor-default disabled:opacity-100"
                                />
                               </TableCell>
                              <TableCell className="w-[180px]">
                                   {pago.estado === 'desactivo' ? (
                                      <Badge variant="destructive">Desactivo</Badge>
                                   ) : (
                                      <Select value={pago.metodoPago} onValueChange={val => handlePagoChange(pago.id, 'metodoPago', val as MetodoPago)}>
                                          <SelectTrigger><SelectValue/></SelectTrigger>
                                          <SelectContent>{metodoPagoOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                      </Select>
                                   )}
                              </TableCell>
                              <TableCell className="text-right w-[120px]">
                                <div className="flex justify-end">
                                  <Input type="number" value={pago.monto} onChange={e => handlePagoChange(pago.id, 'monto', e.target.value)} onBlur={() => handleMontoBlur(pago.id)} className={cn("w-24 text-right", pago.estado === 'desactivo' && 'line-through')} />
                                </div>
                              </TableCell>
                          </TableRow>
                        )
                      )
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
        isOpen={isDeactivateConfirmOpen}
        onOpenChange={setIsDeactivateConfirmOpen}
        onConfirm={confirmDeactivatePayment}
        title="Desactivar Pago"
        description="Está a punto de desactivar este pago al establecer su monto en cero. El pago no se eliminará pero no se considerará en los totales. ¿Desea continuar?"
        confirmButtonText="Sí, desactivar pago"
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

    