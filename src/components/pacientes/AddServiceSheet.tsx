
"use client";

import React, { useState, useEffect } from 'react';
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
import { mockProcedimientos, mockPersonalData } from '@/lib/data';
import type { Procedimiento, Presupuesto, ItemPresupuesto } from '@/types';
import { Combobox } from '@/components/ui/combobox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, MinusCircle, Plus, FileText, ThumbsUp, ThumbsDown, HeartOff, CheckCircle2, Circle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddProcedimientoModal } from '@/components/catalogo/AddProcedimientoModal';
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from '../ui/confirmation-dialog';


interface AddServiceSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    id?: string;
    items: ItemPresupuesto[],
    nombre: string,
    doctorResponsableId: string,
    estado: Presupuesto['estado'],
    nota?: string
  }) => void;
  editingBudget?: Presupuesto | null;
}

export function AddServiceSheet({ isOpen, onOpenChange, onSave, editingBudget }: AddServiceSheetProps) {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<ItemPresupuesto[]>([]);
  const [nombrePresupuesto, setNombrePresupuesto] = useState('');
  const [doctorResponsableId, setDoctorResponsableId] = useState('');
  const [estado, setEstado] = useState<Presupuesto['estado']>('Creado');
  const [nota, setNota] = useState('');
  const [isAddProcModalOpen, setIsAddProcModalOpen] = useState(false);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemPresupuesto | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (editingBudget) {
            setSelectedItems([...editingBudget.items]); // Create a copy
            setNombrePresupuesto(editingBudget.nombre);
            setDoctorResponsableId(editingBudget.doctorResponsableId || '');
            setEstado(editingBudget.estado);
            setNota(editingBudget.nota || '');
        } else {
            setSelectedItems([]);
            setNombrePresupuesto('');
            setDoctorResponsableId('');
            setEstado('Creado');
            setNota('');
        }
    }
  }, [isOpen, editingBudget]);


  const procedimientoOptions = mockProcedimientos.map(p => ({
    value: p.id,
    label: `${p.denominacion} - S/ ${p.precioBase.toFixed(2)}`,
  }));

  const doctorOptions = mockPersonalData
    .filter(p => p.estado === 'Activo')
    .map(p => ({
      value: p.id,
      label: `${p.persona.nombre} ${p.persona.apellidoPaterno}`,
    }));

  const estadoOptions: { label: string, value: Presupuesto['estado'], icon: React.ElementType }[] = [
    { label: 'Creado', value: 'Creado', icon: FileText },
    { label: 'Aceptado', value: 'Aceptado', icon: ThumbsUp },
    { label: 'Rechazado', value: 'Rechazado', icon: ThumbsDown },
    { label: 'Abandonado', value: 'Abandonado', icon: HeartOff },
    { label: 'Terminado', value: 'Terminado', icon: CheckCircle2 },
    { label: 'Otro', value: 'Otro', icon: Circle },
  ];

  const handleAddServicio = (procedimientoId: string) => {
    const procedimiento = mockProcedimientos.find(p => p.id === procedimientoId);
    if (procedimiento && !selectedItems.some(item => item.procedimiento.id === procedimientoId)) {
        const newItem: ItemPresupuesto = {
            id: `new-item-${crypto.randomUUID()}`, // Temporary ID
            procedimiento: procedimiento,
            cantidad: 1,
            montoPagado: 0
        };
        setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const handleRemoveServicio = (itemToRemove: ItemPresupuesto) => {
    if (itemToRemove.montoPagado > 0) {
        setItemToDelete(itemToRemove);
        setIsConfirmDeleteOpen(true);
    } else {
        setSelectedItems(prev => prev.filter(item => item.id !== itemToRemove.id));
    }
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    setSelectedItems(prev => prev.filter(i => i.id !== itemToDelete.id));
    setIsConfirmDeleteOpen(false);
    setItemToDelete(null);
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
  
  const handleSaveProcedimiento = (procedimiento: Procedimiento) => {
    const exists = mockProcedimientos.some(p => p.id === procedimiento.id);
    if (!exists) {
        mockProcedimientos.push(procedimiento);
    } else {
        const index = mockProcedimientos.findIndex(p => p.id === procedimiento.id);
        mockProcedimientos[index] = procedimiento;
    }
    toast({ title: "Procedimiento Guardado", description: "El procedimiento está listo para ser usado."});
    handleAddServicio(procedimiento.id);
    setIsAddProcModalOpen(false);
  };


  const total = selectedItems.reduce((acc, item) => acc + item.procedimiento.precioBase * item.cantidad, 0);
  const totalPagado = selectedItems.reduce((acc, item) => acc + (item.montoPagado || 0), 0);
  const porPagar = total - totalPagado;

  const handleSaveClick = () => {
    if (!doctorResponsableId) {
        toast({ title: "Faltan datos", description: "Por favor, seleccione un doctor responsable.", variant: "destructive" });
        return;
    }
    if (selectedItems.length === 0) {
        toast({ title: "Sin servicios", description: "Debe agregar al menos un servicio al presupuesto.", variant: "destructive" });
        return;
    }

    onSave({ id: editingBudget?.id, items: selectedItems, nombre: nombrePresupuesto, doctorResponsableId, estado, nota });
  };
  
  const filteredProcedimientoOptions = procedimientoOptions.filter(
    opt => !selectedItems.some(item => item.procedimiento.id === opt.value)
  );

  const title = editingBudget ? "Editar Presupuesto/Servicio" : "Añadir Presupuesto/Servicio";

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[65vw] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Complete la información para {editingBudget ? 'actualizar el' : 'crear un nuevo'} presupuesto.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <Label htmlFor="nombre-presupuesto">Nombre del Presupuesto (Opcional)</Label>
                    <Input id="nombre-presupuesto" value={nombrePresupuesto} onChange={(e) => setNombrePresupuesto(e.target.value)} placeholder="Ej: Plan de Ortodoncia"/>
                  </div>
                   <div>
                    <Label>Doctor responsable</Label>
                    <Combobox options={doctorOptions} value={doctorResponsableId} onChange={setDoctorResponsableId} placeholder="Seleccionar doctor..."/>
                  </div>
                 <div>
                    <Label>Estado</Label>
                    <Select value={estado} onValueChange={(val) => setEstado(val as Presupuesto['estado'])}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {estadoOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            
            <div className="space-y-2">
              <Label>Agregar servicios/productos</Label>
              <div className="flex items-center gap-2">
                  <div className="flex-grow">
                      <Combobox options={filteredProcedimientoOptions} onChange={handleAddServicio} placeholder="Selecciona un servicio/producto..." />
                  </div>
                  <Button variant="outline" onClick={() => setIsAddProcModalOpen(true)}><Plus className="mr-2 h-4 w-4"/> Nuevo</Button>
              </div>
            </div>

            <div className="border rounded-lg mt-4 col-span-1 md:col-span-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Cant.</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.length > 0 ? (
                    selectedItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.procedimiento.denominacion}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCantidad(item.procedimiento.id, -1)}><MinusCircle className="h-4 w-4" /></Button>
                                <span>{item.cantidad}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCantidad(item.procedimiento.id, 1)}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">S/ {item.procedimiento.precioBase.toFixed(2)}</TableCell>
                        <TableCell className="text-right">S/ {(item.procedimiento.precioBase * item.cantidad).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveServicio(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Agregue servicios a este presupuesto.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                  <div className="space-y-1 text-right">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold">S/ {total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Pagado:</span>
                          <span className="font-semibold">S/ {totalPagado.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t pt-1 mt-1">
                          <span>Por pagar:</span>
                          <span>S/ {porPagar.toFixed(2)}</span>
                      </div>
                  </div>
              </div>
            </div>
            <div>
              <Label htmlFor="nota-pago">Nota de Pago</Label>
              <Textarea id="nota-pago" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Añadir comentario..."/>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="p-6 border-t mt-auto">
            <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleSaveClick}>
                {editingBudget ? "Guardar Cambios" : "Guardar Presupuesto"}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    <ConfirmationDialog
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={confirmDeleteItem}
        title="Confirmar Eliminación de Servicio"
        description={
            <>
                Este servicio ya tiene pagos registrados (S/ {itemToDelete?.montoPagado.toFixed(2)}).
                <br />
                Si lo elimina, los pagos asociados también se anularán. ¿Está seguro?
            </>
        }
        confirmButtonText="Sí, eliminar"
        confirmButtonVariant="destructive"
    />
    <AddProcedimientoModal
      isOpen={isAddProcModalOpen}
      onOpenChange={setIsAddProcModalOpen}
      onSave={handleSaveProcedimiento}
    />
    </>
  );
}
