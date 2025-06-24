
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { type Presupuesto, type MetodoPago, type ItemPresupuesto, Paciente as PacienteType } from '@/types';
import { mockPersonalData } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Check, CheckCircle, ChevronRight, Circle, DollarSign, FileText, Gift, Megaphone, Percent, User, Wallet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  presupuesto: Presupuesto;
  paciente: PacienteType;
  itemsToPay: ItemPresupuesto[];
  title: string;
  onPaymentSuccess: (amount: number) => void;
}

export function PaymentSheet({ isOpen, onOpenChange, presupuesto, paciente, itemsToPay, title, onPaymentSuccess }: PaymentSheetProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [abonoManual, setAbonoManual] = useState<number | ''>('');
    const [abonos, setAbonos] = useState<Record<string, number | ''>>({});
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('');
    const [comprobante, setComprobante] = useState<'Boleta' | 'Factura' | ''>('');
    
    // For the alert dialog
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [exceededInfo, setExceededInfo] = useState<{ typed: number, max: number } | null>(null);

    
    const doctor = useMemo(() => mockPersonalData.find(d => d.id === presupuesto.doctorResponsableId), [presupuesto.doctorResponsableId]);
    
    const totalPorPagar = useMemo(() => {
        return itemsToPay.reduce((acc, item) => {
            const itemTotal = item.procedimiento.precioBase * item.cantidad;
            return acc + itemTotal;
        }, 0); 
    }, [itemsToPay]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setAbonoManual('');
            setAbonos({});
            setSelectedItems([]); // Start with no items selected
            setMetodoPago('');
            setComprobante('');
            setIsAlertOpen(false);
            setExceededInfo(null);
        }
    }, [isOpen]);
    
    const totalACobrar = useMemo(() => {
      // If manual input has a value, it is the source of truth
      if (abonoManual !== '' && typeof abonoManual === 'number') {
        return abonoManual;
      }
      
      // Otherwise, sum up the individual abonos from selected items
      return selectedItems.reduce((acc, itemId) => {
              const abono = abonos[itemId];
              return acc + (typeof abono === 'number' ? abono : 0);
          }, 0);
    }, [abonoManual, selectedItems, abonos]);

    const handleItemAbonoChange = (itemId: string, value: string) => {
        const newAbono = value === '' ? '' : parseFloat(value);
      
        const currentItem = itemsToPay.find(i => i.id === itemId);
        if (!currentItem) return;
  
        const otherItemsTotal = selectedItems
          .filter(id => id !== itemId)
          .reduce((acc, id) => acc + (Number(abonos[id]) || 0), 0);
        
        const newTotalACobrar = otherItemsTotal + (Number(newAbono) || 0);
  
        if (newTotalACobrar > totalPorPagar) {
            const maxForThisItem = totalPorPagar - otherItemsTotal;
            setExceededInfo({ typed: newTotalACobrar, max: totalPorPagar });
            setIsAlertOpen(true);
            setAbonos(prev => ({...prev, [itemId]: maxForThisItem < 0 ? 0 : maxForThisItem }));
        } else {
            setAbonos(prev => ({...prev, [itemId]: newAbono }));
        }
  
        setAbonoManual(''); // Clear manual input when table is edited
        if (typeof newAbono === 'number' && newAbono > 0 && !selectedItems.includes(itemId)) {
            setSelectedItems(prev => [...prev, itemId]);
        }
    };

    const handleCobrarClick = () => {
      let amountToDistribute = typeof abonoManual === 'number' ? abonoManual : 0;
  
      if (amountToDistribute <= 0) {
          toast({ title: "Monto inválido", description: "Ingrese un monto mayor a cero para cobrar.", variant: "destructive" });
          return;
      }
  
      if (amountToDistribute > totalPorPagar) {
          setExceededInfo({ typed: amountToDistribute, max: totalPorPagar });
          setIsAlertOpen(true);
          amountToDistribute = totalPorPagar; // Clamp to max
          setAbonoManual(totalPorPagar); // Update the input field as well
      }
      
      const newAbonos: Record<string, number | ''> = {};
      const newSelectedItems: string[] = [];
      let remainingAmount = amountToDistribute;
  
      for (const item of itemsToPay) {
          if (remainingAmount <= 0) {
              newAbonos[item.id] = '';
              continue;
          };
  
          const itemPorPagar = item.procedimiento.precioBase * item.cantidad;
          const amountToApply = Math.min(remainingAmount, itemPorPagar);
          
          newAbonos[item.id] = amountToApply;
          if (amountToApply > 0) {
            newSelectedItems.push(item.id);
          }
          remainingAmount -= amountToApply;
      }
  
      setAbonos(newAbonos);
      setSelectedItems(newSelectedItems);
    };

    const handleSelectAll = (checked: boolean) => {
        const allItemIds = itemsToPay.map(item => item.id);
        setSelectedItems(checked ? allItemIds : []);

        if (checked) {
            const newAbonos: Record<string, number> = {};
            itemsToPay.forEach(item => {
                newAbonos[item.id] = item.procedimiento.precioBase * item.cantidad;
            });
            setAbonos(newAbonos);
        } else {
            setAbonos({});
        }
        setAbonoManual('');
    };

    const handleSelectItem = (itemId: string, checked: boolean) => {
      setAbonoManual('');
      setSelectedItems(prev => {
        const newSelected = checked ? [...prev, itemId] : prev.filter(id => id !== itemId);
        
        // Auto-fill abono when selected
        if(checked) {
           const item = itemsToPay.find(i => i.id === itemId);
           if (item) {
              const itemTotal = item.procedimiento.precioBase * item.cantidad;
              setAbonos(prevAbonos => ({ ...prevAbonos, [itemId]: itemTotal }));
           }
        } else {
            setAbonos(prevAbonos => {
                const newAbonos = { ...prevAbonos };
                delete newAbonos[itemId];
                return newAbonos;
            });
        }
        return newSelected;
      });
    };
    
    const handleNextStep = () => {
        if (totalACobrar <= 0) {
            toast({ title: "Monto inválido", description: "Debe seleccionar items o ingresar un monto a cobrar.", variant: "destructive"});
            return;
        }
        setStep(2);
    };

    const handleConfirmPayment = () => {
        if (!metodoPago) {
            toast({ title: "Falta método de pago", description: "Por favor, seleccione un método de pago.", variant: "destructive"});
            return;
        }
        if (!comprobante) {
            toast({ title: "Falta comprobante", description: "Por favor, seleccione un tipo de comprobante.", variant: "destructive"});
            return;
        }
        
        toast({ title: "Pago Registrado", description: `Se registró un pago de S/ ${totalACobrar.toFixed(2)} con ${metodoPago}.`});
        onPaymentSuccess(totalACobrar);
    }
    
    const metodoPagoOptions: { value: MetodoPago, label: string, icon: React.ElementType }[] = [
        { value: 'Efectivo', label: 'Efectivo', icon: Wallet },
        { value: 'Tarjeta', label: 'Tarjeta de Crédito / Débito', icon: Wallet },
        { value: 'Transferencia', label: 'Transferencia Bancaria', icon: ArrowLeft },
        { value: 'Otro', label: 'Otro', icon: Gift },
    ];
    
    const conceptoTexto = useMemo(() => {
      if (abonoManual !== '' && typeof abonoManual === 'number' && abonoManual > 0) {
        return `Abono al presupuesto #${presupuesto.id.slice(-6)}`;
      }
       return itemsToPay
        .filter(item => selectedItems.includes(item.id) && abonos[item.id]! > 0)
        .map(item => `(${item.cantidad}) ${item.procedimiento.denominacion}`)
        .join(', ');
    }, [abonoManual, selectedItems, abonos, itemsToPay, presupuesto.id]);

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[65vw] p-0 flex flex-col">
        <div className="relative overflow-x-hidden flex-1 flex flex-col">
            {/* Step 1: Register Payment */}
            <div className={cn("absolute inset-0 transition-transform duration-500 ease-in-out flex flex-col", step === 1 ? "translate-x-0" : "-translate-x-full")}>
                 <SheetHeader className="p-6 border-b">
                    <SheetTitle>{title}</SheetTitle>
                 </SheetHeader>
                 <ScrollArea className="flex-grow">
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">Opción 1: Ingresa el abono o monto a cobrar (opcional)</p>
                        <div className="flex items-center gap-2">
                             <div className="relative w-40">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
                                <Input type="number" placeholder="0.00" value={abonoManual} onChange={e => setAbonoManual(e.target.value === '' ? '' : parseFloat(e.target.value))} className="pl-8"/>
                            </div>
                            <Button variant="outline" onClick={handleCobrarClick}>Cobrar</Button>
                        </div>
                         <p className="text-sm text-muted-foreground">Opción 2: Si no tienes un monto definido, puedes seleccionar los items que deseas cobrar y si deseas también puedes editar el monto.</p>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox checked={itemsToPay.length > 0 && selectedItems.length === itemsToPay.length} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} />
                                        </TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Por Pagar</TableHead>
                                        <TableHead className="text-right">Abono</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsToPay.map(item => {
                                        const porPagarItem = item.procedimiento.precioBase * item.cantidad;
                                        return (
                                        <TableRow key={item.id} data-state={selectedItems.includes(item.id) ? "selected" : "unselected"}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedItems.includes(item.id)} 
                                                    onCheckedChange={(checked) => handleSelectItem(item.id, Boolean(checked))}
                                                />
                                            </TableCell>
                                            <TableCell>{item.procedimiento.denominacion}</TableCell>
                                            <TableCell className="text-right">S/ {porPagarItem.toFixed(2)}</TableCell>
                                            <TableCell className="w-[120px]">
                                                <div className="relative">
                                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
                                                  <Input type="number" className="pl-7" 
                                                    value={abonos[item.id] ?? ''}
                                                    onChange={e => handleItemAbonoChange(item.id, e.target.value)}
                                                  />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-end">
                            <div className="text-right font-semibold text-lg">
                                Total a cobrar: S/ {totalACobrar.toFixed(2)}
                            </div>
                        </div>
                    </div>
                 </ScrollArea>
                 <SheetFooter className="p-6 border-t mt-auto">
                    <SheetClose asChild><Button variant="outline">Cancelar</Button></SheetClose>
                    <Button onClick={handleNextStep}>Confirmar</Button>
                </SheetFooter>
            </div>
            {/* Step 2: Confirm Payment */}
            <div className={cn("absolute inset-0 transition-transform duration-500 ease-in-out flex flex-col justify-center items-center bg-muted/40", step === 2 ? "translate-x-0" : "translate-x-full")}>
                 <div className="w-full max-w-md bg-card rounded-lg border shadow-lg p-6 space-y-6">
                    <SheetHeader className="text-center space-y-2">
                        <SheetTitle>Confirmar Pago</SheetTitle>
                        <SheetDescription>Monto total a cobrar</SheetDescription>
                        <div className="text-3xl font-bold text-primary">S/ {totalACobrar.toFixed(2)}</div>
                    </SheetHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Concepto:</span>
                            <span className="font-medium text-right max-w-[60%] truncate" title={conceptoTexto}>{conceptoTexto}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Paciente:</span>
                            <span className="font-medium">{paciente.persona.nombre} {paciente.persona.apellidoPaterno}</span>
                        </div>
                        <div>
                            <Label>Doctor relacionado a la venta</Label>
                            <Select value={doctor?.id} disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder={doctor ? `${doctor.persona.nombre} ${doctor.persona.apellidoPaterno}` : 'No asignado'}/>
                                </SelectTrigger>
                            </Select>
                        </div>
                         <div>
                            <Label>Comprobante</Label>
                             <Select value={comprobante} onValueChange={(val) => setComprobante(val as any)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Boleta">Boleta</SelectItem>
                                    <SelectItem value="Factura">Factura</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Medio de pago</Label>
                             <Select value={metodoPago} onValueChange={(val) => setMetodoPago(val as MetodoPago)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione..."/></SelectTrigger>
                                <SelectContent>
                                    {metodoPagoOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <opt.icon className="h-4 w-4 text-muted-foreground" />
                                                <span>{opt.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <SheetFooter className="gap-2 sm:flex-row">
                        <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto"><ArrowLeft className="mr-2 h-4 w-4"/> Atrás</Button>
                        <Button onClick={handleConfirmPayment} className="w-full sm:w-auto">Confirmar Pago</Button>
                    </SheetFooter>
                 </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
     <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-6">
            <DialogHeader className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Megaphone className="h-10 w-10 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-semibold">Monto Excedido</DialogTitle>
            </DialogHeader>
            <DialogDescription className="mt-2 text-base text-center leading-relaxed">
                El monto a cobrar (S/ {exceededInfo?.typed.toFixed(2)}) es mayor que el total por pagar (S/ {exceededInfo?.max.toFixed(2)}). Por favor, ajuste el monto.
            </DialogDescription>
            <DialogFooter className="mt-6 sm:justify-center">
                <Button onClick={() => setIsAlertOpen(false)} className="w-auto">Entendido</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
