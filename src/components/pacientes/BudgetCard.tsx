
"use client";

import React, { useState, useEffect } from 'react';
import type { Presupuesto, EstadoPresupuesto, ItemPresupuesto, Paciente as PacienteType, Pago } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DollarSign, Edit, Download, Trash2, ChevronDown, FileText, HeartOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockPagosData, mockPresupuestosData } from '@/lib/data';
import { PaymentSheet } from './PaymentSheet';
import { EditServiceSheet } from './EditServiceSheet';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '../ui/confirmation-dialog';

interface BudgetCardProps {
  presupuesto: Presupuesto;
  paciente: PacienteType;
  onUpdate: () => void;
  onEdit: (presupuesto: Presupuesto) => void;
}

const statusConfig: Record<EstadoPresupuesto, { label: string; icon: React.ElementType, badgeClass: string, textClass: string, color: string, hoverFocusClass: string }> = {
  Creado: { label: 'Creado', icon: FileText, badgeClass: 'border-blue-500', textClass: 'text-blue-600', color: '#3b82f6', hoverFocusClass: 'hover:bg-blue-500/10 focus:bg-blue-500/20' },
  Pagado: { label: 'Pagado', icon: CheckCircle2, badgeClass: 'border-green-600', textClass: 'text-green-600', color: '#16a34a', hoverFocusClass: 'hover:bg-green-600/10 focus:bg-green-600/20' },
  Cancelado: { label: 'Cancelado', icon: HeartOff, badgeClass: 'border-red-600', textClass: 'text-red-600', color: '#dc2626', hoverFocusClass: 'hover:bg-red-600/10 focus:bg-red-600/20' },
};


export function BudgetCard({ presupuesto: initialPresupuesto, paciente, onUpdate, onEdit }: BudgetCardProps) {
  const [presupuesto, setPresupuesto] = useState(initialPresupuesto);
  const { toast } = useToast();
  
  const [paymentContext, setPaymentContext] = useState<{
    title: string;
    items: ItemPresupuesto[];
  } | null>(null);

  const [editingItem, setEditingItem] = useState<ItemPresupuesto | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  useEffect(() => {
    setPresupuesto(initialPresupuesto);
  }, [initialPresupuesto]);


  const { estado, id, nombre, fechaCreacion, items, montoPagado, nota, fechaAtencion } = presupuesto;

  const totalPresupuesto = items.reduce((acc, item) => acc + item.procedimiento.precioBase * item.cantidad, 0);
  
  const CurrentStatusIcon = statusConfig[estado].icon;
  
  const handleStateChange = (newState: EstadoPresupuesto) => {
    const index = mockPresupuestosData.findIndex(p => p.id === id);
    if (index > -1) {
      mockPresupuestosData[index].estado = newState;
      
      const shouldBeActive = newState === 'Creado' || newState === 'Pagado';
      
      mockPagosData.forEach(pago => {
        if(pago.itemsPagados.some(ip => ip.idPresupuesto === id)) {
          pago.estado = shouldBeActive ? 'activo' : 'desactivo';
        }
      });
      
      setPresupuesto(mockPresupuestosData[index]);
      toast({ title: "Estado Actualizado", description: `El presupuesto ahora está "${newState}".`})
    }
  };
  
  const handlePaymentSuccess = () => {
    setPaymentContext(null);
    onUpdate();
  };

  const handlePayItem = (item: ItemPresupuesto) => {
    setPaymentContext({
        title: 'Registrar Pago',
        items: [item]
    });
  };

  const handlePayMultiple = () => {
    const itemsPorPagar = items.filter(item => {
      const subtotal = item.procedimiento.precioBase * item.cantidad;
      return (item.montoPagado || 0) < subtotal;
    });

    if (itemsPorPagar.length === 0) {
      toast({ title: "Sin Deudas", description: "Este presupuesto ya ha sido pagado en su totalidad."});
      return;
    }

    setPaymentContext({
        title: 'Registrar Varios Pagos',
        items: itemsPorPagar,
    });
  };

  const handleCancelBudget = () => {
    const budgetIdToCancel = presupuesto.id;

    const budgetIndex = mockPresupuestosData.findIndex(p => p.id === budgetIdToCancel);
    if (budgetIndex > -1) {
        mockPresupuestosData[budgetIndex].estado = 'Cancelado';
    }
    
    // Deactivate all associated payments
    mockPagosData.forEach(pago => {
        if (pago.itemsPagados.some(item => item.idPresupuesto === budgetIdToCancel)) {
            pago.estado = 'desactivo';
        }
    });

    toast({
        title: "Presupuesto Cancelado",
        description: `El presupuesto #${budgetIdToCancel.slice(-6)} y sus pagos asociados han sido desactivados.`,
        variant: "destructive"
    });
    
    onUpdate();
    setIsConfirmOpen(false);
  };
  
  const displayName = nombre 
    ? `${nombre} - (${format(new Date(fechaAtencion), "dd/MM/yyyy")})` 
    : format(new Date(fechaAtencion), "dd MMMM yyyy", { locale: es });

  return (
    <>
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full bg-card border rounded-lg shadow-sm">
        <AccordionItem value="item-1" className="border-none">
          <div className="flex w-full items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={cn("text-xs font-semibold h-7 px-2 gap-1 group", statusConfig[estado].badgeClass, statusConfig[estado].textClass, statusConfig[estado].hoverFocusClass, `hover:${statusConfig[estado].textClass}`)}>
                            <ChevronDown className="h-3 w-3" />
                            <CurrentStatusIcon className="h-4 w-4" />
                            {statusConfig[estado].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <div className="p-2 font-semibold text-sm">Estado del Presupuesto</div>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleStateChange(key as EstadoPresupuesto)}
                          className={cn(
                            "group",
                            config.textClass,
                            config.hoverFocusClass,
                            `hover:${config.textClass}`,
                            `focus:${config.textClass}`
                          )}
                        >
                          <config.icon className={cn("mr-2 h-4 w-4")} />
                          <span>{config.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                </DropdownMenu>

              <AccordionTrigger className="p-0 flex-1 hover:no-underline [&>svg]:ml-4 justify-start">
                  <div className="flex items-center gap-3">
                      <div className="font-semibold text-foreground">{`#${id.slice(-6).toUpperCase()}`}</div>
                      <div className="text-muted-foreground">{displayName}</div>
                  </div>
              </AccordionTrigger>
            </div>
              <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-1.5 ml-4">
                  {estado !== 'Cancelado' && (
                    <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePayMultiple}><DollarSign className="h-4 w-4" /></Button>
                    </TooltipTrigger><TooltipContent><p>Cobrar varios servicios</p></TooltipContent></Tooltip>
                  )}
                  
                  <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(presupuesto)}><Edit className="h-4 w-4" /></Button>
                  </TooltipTrigger><TooltipContent><p>Editar</p></TooltipContent></Tooltip>
                  
                  <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                  </TooltipTrigger><TooltipContent><p>Imprimir</p></TooltipContent></Tooltip>

                  <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setIsConfirmOpen(true)}><Trash2 className="h-4 w-4" /></Button>
                  </TooltipTrigger><TooltipContent><p>Cancelar Presupuesto</p></TooltipContent></Tooltip>
              </div>
              </TooltipProvider>
          </div>
          <AccordionContent className="px-4 pb-4 pt-0">
            <div className="border-t pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Cant.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Pagado</TableHead>
                    <TableHead className="text-right">Por Pagar</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const subtotal = item.procedimiento.precioBase * item.cantidad;
                    const porPagar = subtotal - (item.montoPagado || 0);
                    const isPaid = porPagar <= 0.009; // Use small epsilon for float comparison

                    return (
                      <TableRow key={item.id} className={cn("hover:bg-muted/50", estado !== 'Cancelado' && "cursor-pointer")} onClick={() => estado !== 'Cancelado' && setEditingItem(item)}>
                        <TableCell className="font-medium">{item.procedimiento.denominacion}</TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell className="text-right">S/ {subtotal.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-green-600">S/ {(item.montoPagado || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right text-red-600">S/ {porPagar.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {isPaid && estado !== 'Cancelado' ? (
                            <div className="flex justify-end items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-5 w-5"/>
                            </div>
                          ) : estado === 'Cancelado' ? (
                              <div className="flex justify-end items-center gap-1 text-red-600">
                                  <HeartOff className="h-4 w-4" />
                              </div>
                          ) : (
                              <Button variant="outline" size="sm" className="h-7" onClick={(e) => { e.stopPropagation(); handlePayItem(item); }}>Pagar</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                      <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">S/ {totalPresupuesto.toFixed(2)}</TableCell>
                  </TableRow>
                   <TableRow>
                      <TableCell colSpan={5} className="text-right font-bold text-green-700">Pagado</TableCell>
                      <TableCell className="text-right font-bold text-green-700">S/ {montoPagado.toFixed(2)}</TableCell>
                  </TableRow>
                   <TableRow>
                      <TableCell colSpan={5} className="text-right font-bold text-red-700">Por Pagar</TableCell>
                      <TableCell className="text-right font-bold text-red-700">S/ {(totalPresupuesto - montoPagado).toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <div className="text-xs text-muted-foreground mt-4 px-1 space-y-1">
                  {nota && <p><strong>Nota:</strong> {nota}</p>}
                  <p>Creado el: {format(new Date(fechaCreacion), "dd MMM yyyy 'a las' HH:mm", { locale: es })}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {paymentContext && (
        <PaymentSheet 
            isOpen={!!paymentContext}
            onOpenChange={(open) => !open && setPaymentContext(null)}
            presupuesto={presupuesto}
            paciente={paciente}
            itemsToPay={paymentContext.items}
            title={paymentContext.title}
            onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      {editingItem && (
        <EditServiceSheet
            isOpen={!!editingItem}
            onOpenChange={(open) => {
                if (!open) setEditingItem(null);
            }}
            item={editingItem}
            presupuesto={presupuesto}
            paciente={paciente}
            onUpdate={() => {
                onUpdate();
                setEditingItem(null);
            }}
        />
      )}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleCancelBudget}
        title="Confirmar Cancelación"
        description="¿Está seguro de que desea cancelar este presupuesto? Todos los pagos asociados se marcarán como inactivos. Esta acción no se puede deshacer."
        confirmButtonText="Sí, cancelar presupuesto"
        confirmButtonVariant="destructive"
      />
    </>
  );
}
