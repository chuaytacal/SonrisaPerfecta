
"use client";

import React from 'react';
import type { Presupuesto, EstadoPresupuesto } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DollarSign, Edit, Download, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetCardProps {
  presupuesto: Presupuesto;
}

const statusConfig: Record<EstadoPresupuesto, { label: string; className: string }> = {
  Creado: { label: 'Creado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  Aprobado: { label: 'Aprobado', className: 'bg-green-100 text-green-800 border-green-200' },
  Rechazado: { label: 'Rechazado', className: 'bg-red-100 text-red-800 border-red-200' },
  Terminado: { label: 'Terminado', className: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export function BudgetCard({ presupuesto }: BudgetCardProps) {
  const { estado, id, nombre, fechaCreacion, items, montoPagado } = presupuesto;

  const totalPresupuesto = items.reduce((acc, item) => acc + item.procedimiento.precioBase * item.cantidad, 0);
  const porPagar = totalPresupuesto - montoPagado;

  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full bg-card border rounded-lg shadow-sm">
      <AccordionItem value="item-1" className="border-none">
        <div className="flex w-full items-center justify-between p-4">
            <AccordionTrigger className="p-0 flex-1 hover:no-underline [&>svg]:ml-4 justify-start">
                <div className="flex items-center gap-4">
                    <Badge className={cn("text-xs font-semibold", statusConfig[estado].className)}>
                        {statusConfig[estado].label}
                    </Badge>
                    <div className="font-semibold text-foreground">#{id.slice(-6)}</div>
                    <div className="text-muted-foreground">{nombre}</div>
                </div>
            </AccordionTrigger>
            <div className="flex items-center gap-1.5 ml-4">
              <Button variant="ghost" size="icon" className="h-8 w-8"><DollarSign className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </div>
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
                        <Button variant="outline" size="sm" className="h-7">Pagar</Button>
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
  );
}
