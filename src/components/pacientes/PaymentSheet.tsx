
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { type Presupuesto, type MetodoPago, type ItemPresupuesto, Paciente as PacienteType, TipoComprobante, Pago } from '@/types';
import { mockPersonalData, mockPagosData, mockPresupuestosData } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Check, CheckCircle, Gift, Megaphone, Wallet, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  onPaymentSuccess: () => void;
}

export function PaymentSheet({ isOpen, onOpenChange, presupuesto, paciente, itemsToPay, title, onPaymentSuccess }: PaymentSheetProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [abonoManual, setAbonoManual] = useState<number | ''>('');
    const [abonos, setAbonos] = useState<Record<string, number | ''>>({});
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('');
    const [comprobante, setComprobante] = useState<TipoComprobante | ''>('');
    
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [exceededInfo, setExceededInfo] = useState<{ typed: number, max: number } | null>(null);

    const doctor = useMemo(() => mockPersonalData.find(d => d.id === presupuesto.doctorResponsableId), [presupuesto.doctorResponsableId]);
    
    const totalPorPagar = useMemo(() => {
        return itemsToPay.reduce((acc, item) => {
            const itemTotal = item.procedimiento.precioBase * item.cantidad;
            const porPagarItem = itemTotal - (item.montoPagado || 0);
            return acc + porPagarItem;
        }, 0); 
    }, [itemsToPay]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setAbonoManual('');
            setAbonos({});
            setSelectedItems([]);
            setMetodoPago('');
            setComprobante('');
            setIsAlertOpen(false);
            setExceededInfo(null);
        }
    }, [isOpen]);
    
    const totalACobrar = useMemo(() => {
      if (abonoManual !== '' && typeof abonoManual === 'number') {
        return abonoManual;
      }
      return selectedItems.reduce((acc, itemId) => {
              const abono = abonos[itemId];
              return acc + (typeof abono === 'number' ? abono : 0);
          }, 0);
    }, [abonoManual, selectedItems, abonos]);

    const handleItemAbonoChange = (itemId: string, value: string) => {
      let newAbonoNum = value === '' ? 0 : parseFloat(value);
      const itemData = itemsToPay.find(i => i.id === itemId);
      if (!itemData) return;

      const itemPorPagar = (itemData.procedimiento.precioBase * itemData.cantidad) - (itemData.montoPagado || 0);

      if(newAbonoNum > itemPorPagar) {
          setExceededInfo({ typed: newAbonoNum, max: itemPorPagar });
          setIsAlertOpen(true);
          newAbonoNum = itemPorPagar;
      }
      
      setAbonos(prev => ({...prev, [itemId]: newAbonoNum === 0 ? '' : newAbonoNum }));
      setAbonoManual('');

      if (newAbonoNum > 0 && !selectedItems.includes(itemId)) {
        setSelectedItems(prev => [...prev, itemId]);
      } else if (newAbonoNum <= 0 && selectedItems.includes(itemId)) {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
      }
    };

    const handleCobrarClick = () => {
      let amountToDistribute = typeof abonoManual === 'number' ? abonoManual : 0;
      if (amountToDistribute <= 0) return;
  
      if (amountToDistribute > totalPorPagar) {
          setExceededInfo({ typed: amountToDistribute, max: totalPorPagar });
          setIsAlertOpen(true);
          amountToDistribute = totalPorPagar;
          setAbonoManual(totalPorPagar);
      }
      
      const newAbonos: Record<string, number | ''> = {};
      let remainingAmount = amountToDistribute;
      const itemsConAbono: string[] = [];
  
      for (const item of itemsToPay) {
        if (remainingAmount <= 0) {
            newAbonos[item.id] = '';
            continue;
        }
  
        const itemPorPagar = (item.procedimiento.precioBase * item.cantidad) - (item.montoPagado || 0);
        const amountToApply = Math.min(remainingAmount, itemPorPagar);
        
        if (amountToApply > 0) {
          newAbonos[item.id] = amountToApply;
          itemsConAbono.push(item.id);
        }
        remainingAmount -= amountToApply;
      }
  
      setAbonos(newAbonos);
      setSelectedItems(itemsConAbono);
    };

    const handleSelectAll = (checked: boolean) => {
        const allItemIds = itemsToPay.map(item => item.id);
        setSelectedItems(checked ? allItemIds : []);

        if (checked) {
            const newAbonos: Record<string, number> = {};
            itemsToPay.forEach(item => {
                const itemPorPagar = (item.procedimiento.precioBase * item.cantidad) - (item.montoPagado || 0);
                newAbonos[item.id] = itemPorPagar;
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
        
        if(checked) {
           const item = itemsToPay.find(i => i.id === itemId);
           if (item) {
              const itemPorPagar = (item.procedimiento.precioBase * item.cantidad) - (item.montoPagado || 0);
              setAbonos(prevAbonos => ({ ...prevAbonos, [itemId]: itemPorPagar }));
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
            toast({ title: "Monto inválido", description: "Debe seleccionar ítems o ingresar un monto a cobrar.", variant: "destructive"});
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
        
        const presupuestoIndex = mockPresupuestosData.findIndex(p => p.id === presupuesto.id);
        if (presupuestoIndex === -1) return;

        let totalPagadoEnEstaTransaccion = 0;
        const itemsPagadosParaRegistro: Pago['itemsPagados'] = [];
        
        for (const itemId of selectedItems) {
            const abono = abonos[itemId];
            if (typeof abono !== 'number' || abono <= 0) continue;

            totalPagadoEnEstaTransaccion += abono;
            
            const itemIndex = mockPresupuestosData[presupuestoIndex].items.findIndex(i => i.id === itemId);
            if (itemIndex > -1) {
              mockPresupuestosData[presupuestoIndex].items[itemIndex].montoPagado += abono;
              itemsPagadosParaRegistro.push({
                idPresupuesto: presupuesto.id,
                idItem: itemId,
                monto: abono,
                concepto: mockPresupuestosData[presupuestoIndex].items[itemIndex].procedimiento.denominacion,
              });
            }
        }
        
        mockPresupuestosData[presupuestoIndex].montoPagado += totalPagadoEnEstaTransaccion;

        const totalPresupuesto = mockPresupuestosData[presupuestoIndex].items.reduce((acc, item) => acc + (item.procedimiento.precioBase * item.cantidad), 0);
        if (mockPresupuestosData[presupuestoIndex].montoPagado >= totalPresupuesto) {
          mockPresupuestosData[presupuestoIndex].estado = 'Terminado';
        }

        const newPago: Pago = {
          id: `pago-${crypto.randomUUID()}`,
          idPaciente: paciente.id,
          fechaPago: new Date(),
          montoTotal: totalPagadoEnEstaTransaccion,
          metodoPago,
          tipoComprobante: comprobante,
          doctorResponsableId: presupuesto.doctorResponsableId!,
          descripcion: conceptoTexto,
          itemsPagados: itemsPagadosParaRegistro,
        };
        mockPagosData.push(newPago);

        toast({ title: "Pago Registrado", description: `Se registró un pago de S/ ${totalACobrar.toFixed(2)} con ${metodoPago}.`});
        onPaymentSuccess();
    }
    
    const metodoPagoOptions: { value: MetodoPago, label: string, icon: React.ElementType }[] = [
        { value: 'Efectivo', label: 'Efectivo', icon: Wallet },
        { value: 'Tarjeta', label: 'Tarjeta de Crédito / Débito', icon: Wallet },
        { value: 'Transferencia', label: 'Transferencia Bancaria', icon: ArrowLeft },
        { value: 'Otro', label: 'Otro', icon: Gift },
    ];
    
    const conceptoTexto = useMemo(() => {
       return itemsToPay
        .filter(item => selectedItems.includes(item.id) && abonos[item.id]! > 0)
        .map(item => `(${item.cantidad}) ${item.procedimiento.denominacion}`)
        .join(', ');
    }, [selectedItems, abonos, itemsToPay]);

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[65vw] p-0 flex flex-col">
        <div className="relative overflow-hidden flex-1 flex flex-col">
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
                            <Button variant="default" className="bg-primary" onClick={handleCobrarClick}>Cobrar</Button>
                        </div>
                         <p className="text-sm text-muted-foreground">Opción 2: Si no tienes un monto definido, puedes seleccionar los ítems que deseas cobrar y si deseas también puedes editar el monto.</p>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox checked={itemsToPay.length > 0 && selectedItems.length === itemsToPay.length} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} />
                                        </TableHead>
                                        <TableHead>Ítem</TableHead>
                                        <TableHead className="text-right">Por Pagar</TableHead>
                                        <TableHead className="text-right">Abono</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsToPay.map(item => {
                                        const itemTotal = item.procedimiento.precioBase * item.cantidad;
                                        const porPagarItem = itemTotal - (item.montoPagado || 0);
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
            
            <div className={cn("absolute inset-0 transition-transform duration-500 ease-in-out flex flex-col bg-card", step === 2 ? "translate-x-0" : "translate-x-full")}>
                 <div className="p-6 border-b flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Caja {'>'} Confirmar Venta</span>
                    </button>
                    <SheetClose asChild><Button variant="ghost" size="icon" className="h-6 w-6"><X className="h-4 w-4"/></Button></SheetClose>
                </div>
                 <ScrollArea className="flex-grow">
                    <div className="p-6">
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <div className="w-full max-w-sm mx-auto p-4 rounded-lg bg-muted/50 text-center">
                                <p className="text-sm text-muted-foreground">Monto total a cobrar</p>
                                <p className="text-3xl font-bold text-primary">S/ {totalACobrar.toFixed(2)}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                    <div><Label>Concepto</Label><p className="text-sm font-medium" title={conceptoTexto}>{conceptoTexto}</p></div>
                                    <div><Label>Paciente</Label><p className="text-sm font-medium">{paciente.persona.nombre} {paciente.persona.apellidoPaterno}</p></div>
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
                                         <RadioGroup value={comprobante} onValueChange={(val) => setComprobante(val as any)} className="flex space-x-4 mt-2">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="Boleta" id="r-boleta" /><Label htmlFor="r-boleta" className="font-normal">Boleta</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="Factura" id="r-factura" /><Label htmlFor="r-factura" className="font-normal">Factura</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="Otro" id="r-otro" /><Label htmlFor="r-otro" className="font-normal">Otro</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="Recibo" id="r-recibo" /><Label htmlFor="r-recibo" className="font-normal">Recibo</Label></div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div>
                                    <Label>Medio de pago</Label>
                                    <Select value={metodoPago} onValueChange={(val) => setMetodoPago(val as MetodoPago)}>
                                        <SelectTrigger><SelectValue placeholder="Seleccione..."/></SelectTrigger>
                                        <SelectContent>
                                            {metodoPagoOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <div className="flex items-center gap-2">
                                                        <opt.icon className="h-4 w-4" style={{color: 'currentColor'}}/>
                                                        <span>{opt.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                 </ScrollArea>
                 <SheetFooter className="p-6 border-t mt-auto justify-end">
                    <SheetClose asChild><Button variant="outline">Cancelar</Button></SheetClose>
                    <Button onClick={handleConfirmPayment}>Confirmar</Button>
                </SheetFooter>
            </div>
        </div>
      </SheetContent>
    </Sheet>
     <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-xl p-6">
            <div className="w-full flex justify-center">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Megaphone className="h-10 w-10 text-primary" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <DialogTitle className="text-2xl font-semibold">Monto Excedido</DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                    El monto a cobrar (S/ {exceededInfo?.typed.toFixed(2)}) es mayor que el total por pagar (S/ {exceededInfo?.max.toFixed(2)}). Por favor, ajuste el monto.
                </DialogDescription>
            </div>
            <DialogFooter className="mt-4 sm:justify-center">
                <Button onClick={() => setIsAlertOpen(false)} className="w-auto">Entendido</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
