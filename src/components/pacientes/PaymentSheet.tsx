
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type Presupuesto, type MetodoPago } from '@/types';
import { mockPersonalData } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Check, CheckCircle, ChevronRight, Circle, DollarSign, FileText, Gift, Percent, Wallet } from 'lucide-react';
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
  onPaymentSuccess: (amount: number) => void;
}

export function PaymentSheet({ isOpen, onOpenChange, presupuesto, onPaymentSuccess }: PaymentSheetProps) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [montoAbono, setMontoAbono] = useState<number | ''>('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('');
    
    const doctor = useMemo(() => mockPersonalData.find(d => d.id === presupuesto.doctorResponsableId), [presupuesto.doctorResponsableId]);
    
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setMontoAbono('');
            setSelectedItems([]);
            setMetodoPago('');
        }
    }, [isOpen]);

    const totalPorPagar = useMemo(() => {
        return presupuesto.items.reduce((acc, item) => {
            const itemTotal = item.procedimiento.precioBase * item.cantidad;
            // En una app real, aquí se restaría lo ya pagado por este item específico.
            return acc + itemTotal;
        }, 0) - presupuesto.montoPagado;
    }, [presupuesto]);
    
    const totalACobrar = useMemo(() => {
        if (montoAbono !== '') {
            return montoAbono;
        }
        return presupuesto.items
            .filter(item => selectedItems.includes(item.id))
            .reduce((acc, item) => acc + (item.procedimiento.precioBase * item.cantidad), 0);
    }, [montoAbono, selectedItems, presupuesto.items]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(presupuesto.items.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };
    
    const handleNextStep = () => {
        if (totalACobrar <= 0) {
            toast({
                title: "Monto inválido",
                description: "Debe seleccionar items o ingresar un monto a cobrar.",
                variant: "destructive",
            });
            return;
        }
        setStep(2);
    };

    const handleConfirmPayment = () => {
        if (!metodoPago) {
            toast({
                title: "Falta método de pago",
                description: "Por favor, seleccione un método de pago.",
                variant: "destructive"
            });
            return;
        }
        
        toast({
            title: "Pago Registrado",
            description: `Se registró un pago de S/ ${totalACobrar.toFixed(2)} con ${metodoPago}.`
        });
        onPaymentSuccess(totalACobrar);
    }
    
    const metodoPagoOptions: { value: MetodoPago, label: string, icon: React.ElementType }[] = [
        { value: 'Efectivo', label: 'Efectivo', icon: Wallet },
        { value: 'Tarjeta', label: 'Tarjeta de Crédito / Débito', icon: Wallet },
        { value: 'Transferencia', label: 'Transferencia Bancaria', icon: ArrowLeft },
        { value: 'Otro', label: 'Otro', icon: Gift },
    ];
    
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[65vw] p-0 flex flex-col">
        <div className="relative overflow-x-hidden flex-1 flex flex-col">
            {/* Step 1: Register Payment */}
            <div className={cn("absolute inset-0 transition-transform duration-500 ease-in-out flex flex-col", step === 1 ? "translate-x-0" : "-translate-x-full")}>
                 <SheetHeader className="p-6 border-b">
                    <SheetTitle>Registrar Varios Pagos</SheetTitle>
                 </SheetHeader>
                 <ScrollArea className="flex-grow">
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">Opción 1: Ingresa el abono o monto a cobrar (opcional)</p>
                        <div className="flex items-center gap-2">
                             <div className="relative w-40">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
                                <Input type="number" placeholder="0.00" value={montoAbono} onChange={e => setMontoAbono(e.target.value === '' ? '' : parseFloat(e.target.value))} className="pl-8"/>
                            </div>
                            <Button disabled>Cobrar</Button>
                        </div>
                         <p className="text-sm text-muted-foreground">Opción 2: Si no tienes un monto definido, puedes seleccionar los items que deseas cobrar y si deseas también puedes editar el monto.</p>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox checked={selectedItems.length === presupuesto.items.length} onCheckedChange={handleSelectAll} />
                                        </TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                        <TableHead className="text-right">Pagado</TableHead>
                                        <TableHead className="text-right">Por Pagar</TableHead>
                                        <TableHead className="text-right">Abono</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {presupuesto.items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedItems.includes(item.id)} 
                                                    onCheckedChange={(checked) => {
                                                        setSelectedItems(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{item.procedimiento.denominacion}</TableCell>
                                            <TableCell className="text-right">S/ {(item.procedimiento.precioBase * item.cantidad).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">S/ 0.00</TableCell>
                                            <TableCell className="text-right">S/ {(item.procedimiento.precioBase * item.cantidad).toFixed(2)}</TableCell>
                                            <TableCell className="w-[120px]">
                                                <div className="relative">
                                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
                                                  <Input type="number" className="pl-7" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
            <div className={cn("absolute inset-0 transition-transform duration-500 ease-in-out flex flex-col", step === 2 ? "translate-x-0" : "translate-x-full")}>
                 <SheetHeader className="p-6 border-b">
                    <SheetTitle>Confirmar Pago</SheetTitle>
                 </SheetHeader>
                 <ScrollArea className="flex-grow">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                           <span className="font-medium text-primary">Monto a pagar</span>
                           <span className="text-2xl font-bold text-primary">S/ {totalACobrar.toFixed(2)}</span>
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
                        <div>
                            <Label>Doctor relacionado a la venta</Label>
                            <Select value={doctor?.id} disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder={doctor ? `${doctor.persona.nombre} ${doctor.persona.apellidoPaterno}` : 'No asignado'}/>
                                </SelectTrigger>
                            </Select>
                        </div>
                         <div>
                            <Label>Fecha</Label>
                            <Input value={format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })} disabled/>
                        </div>
                    </div>
                 </ScrollArea>
                 <SheetFooter className="p-6 border-t mt-auto">
                    <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4"/> Atrás</Button>
                    <Button onClick={handleConfirmPayment}>Confirmar Pago</Button>
                </SheetFooter>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
