
"use client";

import React, { useState } from 'react';
import type { Presupuesto, EstadoPresupuesto } from '@/types';
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
import { DollarSign, Edit, Download, Trash2, ChevronDown, FileText, ThumbsUp, ThumbsDown, HeartOff, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockPresupuestosData } from '@/lib/data';
import { PaymentSheet } from './PaymentSheet';

interface BudgetCardProps {
  presupuesto: Presupuesto;
  onUpdate: () => void;
}

const statusConfig: Record<EstadoPresupuesto, { label: string; icon: React.ElementType, badgeClass: string, textClass: string, color: string }> = {
  Creado: { label: 'Creado', icon: FileText, badgeClass: 'border-blue-500 text-blue-600', textClass: 'text-blue-600', color: '#3b82f6' },
  Aceptado: { label: 'Aceptado', icon: ThumbsUp, badgeClass: 'border-green-600 text-green-600', textClass: 'text-green-600', color: '#16a34a' },
  Rechazado: { label: 'Rechazado', icon: ThumbsDown, badgeClass: 'border-red-600 text-red-600', textClass: 'text-red-600', color: '#dc2626' },
  Abandonado: { label: 'Abandonado', icon: HeartOff, badgeClass: 'border-gray-500 text-gray-500', textClass: 'text-gray-500', color: '#6b7280' },
  Terminado: { label: 'Terminado', icon: CheckCircle2, badgeClass: 'border-purple-600 text-purple-600', textClass: 'text-purple-600', color: '#9333ea' },
  Otro: { label: 'Otro', icon: Circle, badgeClass: 'border-gray-500 text-gray-500', textClass: 'text-gray-500', color: '#6b7280' },
};


export function BudgetCard({ presupuesto: initialPresupuesto, onUpdate }: BudgetCardProps) {
  const [presupuesto, setPresupuesto] = useState(initialPresupuesto);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  
  const { estado, id, nombre, fechaCreacion, items, montoPagado } = presupuesto;

  const totalPresupuesto = items.reduce((acc, item) => acc + item.procedimiento.precioBase * item.cantidad, 0);
  const porPagar = totalPresupuesto - montoPagado;
  
  const CurrentStatusIcon = statusConfig[estado].icon;
  
  const handleStateChange = (newState: EstadoPresupuesto) => {
    const index = mockPresupuestosData.findIndex(p => p.id === id);
    if (index > -1) {
      mockPresupuestosData[index].estado = newState;
    }
    setPresupuesto({ ...presupuesto, estado: newState });
  };
  
  const handlePaymentSuccess = (paidAmount: number) => {
    const index = mockPresupuestosData.findIndex(p => p.id === id);
    if (index > -1) {
      mockPresupuestosData[index].montoPagado += paidAmount;
    }
    setPresupuesto(prev => ({ ...prev, montoPagado: prev.montoPagado + paidAmount }));
    setIsPaymentSheetOpen(false);
    onUpdate();
  };

  return (
    <>
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full bg-card border rounded-lg shadow-sm">
        <AccordionItem value="item-1" className="border-none">
          <div className="flex w-full items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={cn("text-xs font-semibold h-7 px-2 gap-1", statusConfig[estado].badgeClass)} style={{ borderColor: statusConfig[estado].color }}>
                            <ChevronDown className="h-3 w-3" />
                            <CurrentStatusIcon className="h-4 w-4" />
                            {statusConfig[estado].label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <div className="p-2 font-semibold text-sm">Estado del Presupuesto</div>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <DropdownMenuItem key={key} onClick={() => handleStateChange(key as EstadoPresupuesto)} className={cn("focus:text-accent-foreground", config.textClass)}>
                          <config.icon className="mr-2 h-4 w-4"/>
                          <span>{config.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                </DropdownMenu>

              <AccordionTrigger className="p-0 flex-1 hover:no-underline [&>svg]:ml-4 justify-start">
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-foreground">#{id.slice(-6)}</div>
                  <div className="text-muted-foreground">{nombre}</div>
                </div>
              </AccordionTrigger>
            </div>
              <TooltipProvider>
              <div className="flex items-center gap-1.5 ml-4">
                  <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><DollarSign className="h-4 w-4" /></Button>
                  </TooltipTrigger><TooltipContent><p>Cobrar varios servicios</p></TooltipContent></Tooltip>
                  
                  <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                  </TooltipTrigger><TooltipContent><p>Editar</p></TooltipContent></Tooltip>
                  
                  <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                  </TooltipTrigger><TooltipContent><p>Imprimir</p></TooltipContent></Tooltip>

                  <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TooltipTrigger><TooltipContent><p>Eliminar</p></TooltipContent></Tooltip>
              </div>
              </TooltipProvider>
          </div>
          <AccordionContent className="px-4 pb-4 pt-0">
            <div className="border-t">
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
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.procedimiento.denominacion}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell className="text-right">S/ {(item.procedimiento.precioBase * item.cantidad).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600">S/ 0.00</TableCell>
                      <TableCell className="text-right text-red-600">S/ {(item.procedimiento.precioBase * item.cantidad).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="h-7" onClick={() => setIsPaymentSheetOpen(true)}>Pagar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">S/ {totalPresupuesto.toFixed(2)}</TableCell>
                      <TableCell />
                  </TableRow>
                   <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold text-green-700">Pagado</TableCell>
                      <TableCell className="text-right font-bold text-green-700">S/ {montoPagado.toFixed(2)}</TableCell>
                      <TableCell />
                  </TableRow>
                   <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold text-red-700">Por Pagar</TableCell>
                      <TableCell className="text-right font-bold text-red-700">S/ {porPagar.toFixed(2)}</TableCell>
                      <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
              <div className="text-xs text-muted-foreground mt-4 px-1">
                Creado el: {format(new Date(fechaCreacion), "dd MMM yyyy", { locale: es })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <PaymentSheet 
        isOpen={isPaymentSheetOpen}
        onOpenChange={setIsPaymentSheetOpen}
        presupuesto={presupuesto}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
