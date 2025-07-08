
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import type { Procedimiento, Presupuesto, ItemPresupuesto, Paciente as PacienteType } from '@/types';
import { Combobox } from '@/components/ui/combobox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, MinusCircle, Plus, FileText, CheckCircle2, HeartOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import api from '@/lib/api';

interface ComboData {
  specialists: { uuid: string; nombreCompleto: string }[];
  procedures: { uuid: string; nombre: string; precio: string }[];
}

interface AddServiceSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingBudget?: Presupuesto | null;
  comboData: ComboData | null;
  paciente: PacienteType | null;
}

export function AddServiceSheet({ isOpen, onOpenChange, onSuccess, editingBudget, comboData, paciente }: AddServiceSheetProps) {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<ItemPresupuesto[]>([]);
  const [nombrePresupuesto, setNombrePresupuesto] = useState('');
  const [doctorResponsableId, setDoctorResponsableId] = useState('');
  const [estado, setEstado] = useState<Presupuesto['estado']>('Creado');
  const [nota, setNota] = useState('');

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemPresupuesto | null>(null);
  
  console.log("received",paciente)
  useEffect(() => {
    if (isOpen) {
        if (editingBudget) {
            const budgetItemsCopy = JSON.parse(JSON.stringify(editingBudget.items));
            setSelectedItems(budgetItemsCopy);
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


  const procedimientoOptions = useMemo(() => {
    if (!comboData) return [];
    return comboData.procedures.map(p => ({
        value: p.uuid,
        label: `${p.nombre} - S/ ${parseFloat(p.precio).toFixed(2)}`
    }));
  }, [comboData]);

  const doctorOptions = useMemo(() => {
    if (!comboData) return [];
    return comboData.specialists.map(s => ({
        value: s.uuid,
        label: s.nombreCompleto
    }));
  }, [comboData]);

  const estadoOptions: { label: string, value: Presupuesto['estado'], icon: React.ElementType }[] = [
    { label: 'Creado', value: 'Creado', icon: FileText },
    { label: 'Pagado', value: 'Pagado', icon: CheckCircle2 },
    { label: 'Cancelado', value: 'Cancelado', icon: HeartOff },
  ];

  const handleAddServicio = (procedimientoId: string) => {
    if (!comboData) return;
    const procedimientoData = comboData.procedures.find(p => p.uuid === procedimientoId);
    if (procedimientoData && !selectedItems.some(item => item.procedimiento.id === procedimientoId)) {
        const procedimiento: Procedimiento = {
            id: procedimientoData.uuid,
            denominacion: procedimientoData.nombre,
            descripcion: '', // Not provided by combo endpoint
            precioBase: parseFloat(procedimientoData.precio)
        };
        const newItem: ItemPresupuesto = {
            id: `new-item-${crypto.randomUUID()}`,
            procedimiento: procedimiento,
            cantidad: 1,
            montoPagado: 0
        };
        setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const handleRemoveServicio = (itemToRemove: ItemPresupuesto) => {
    if ((itemToRemove.montoPagado || 0) > 0) {
        setItemToDelete(itemToRemove);
        setIsConfirmDeleteOpen(true);
    } else {
        confirmDeleteItem(itemToRemove.id, false);
    }
  };

  const confirmDeleteItem = async (itemId: string, showToast = true) => {
    if (editingBudget && !itemId.startsWith('new-item-')) {
        try {
            await api.delete(`/payments/budget-item/${itemId}`);
            if(showToast) toast({ title: "Servicio eliminado", description: "El servicio ha sido eliminado del presupuesto.", variant: "destructive" });
        } catch (error) {
            console.error("Error deleting item:", error);
            toast({ title: "Error", description: "No se pudo eliminar el servicio del presupuesto.", variant: "destructive" });
            return; // Stop if API call fails
        }
    }
    
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
    setIsConfirmDeleteOpen(false);
    setItemToDelete(null);
    onSuccess();
  };

  const handleUpdateCantidad = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (editingBudget && !itemId.startsWith('new-item-')) {
        try {
            await api.patch(`/payments/budget-item/${itemId}`, { cantidad: newQuantity });
            toast({ title: "Cantidad actualizada", description: "La cantidad del servicio ha sido modificada." });
        } catch (error) {
            console.error("Error updating item quantity:", error);
            toast({ title: "Error", description: "No se pudo actualizar la cantidad.", variant: "destructive" });
            return; // Stop on error
        }
    }
    
    // Update local state for immediate feedback
    setSelectedItems(prev =>
        prev.map(i =>
          i.id === itemId
            ? { ...i, cantidad: newQuantity }
            : i
        )
    );
    onSuccess();
  };
  
  const total = selectedItems.reduce((acc, item) => acc + item.procedimiento.precioBase * item.cantidad, 0);
  const totalPagado = selectedItems.reduce((acc, item) => acc + (item.montoPagado || 0), 0);
  const porPagar = total - totalPagado;

  const handleSaveClick = async () => {
    if (!doctorResponsableId) {
        toast({ title: "Faltan datos", description: "Por favor, seleccione un doctor responsable.", variant: "destructive" });
        return;
    }
    if (selectedItems.length === 0) {
        toast({ title: "Sin servicios", description: "Debe agregar al menos un servicio al presupuesto.", variant: "destructive" });
        return;
    }
    
    if (editingBudget) {
      const headerPayload = {
        nombre: nombrePresupuesto,
        nota,
        estado,
        idEspecialista: doctorResponsableId,
      };

      try {
        await api.patch(`/payments/budget/${editingBudget.id}`, headerPayload);
        toast({ title: "Presupuesto Actualizado", description: "Los cambios en la cabecera del presupuesto han sido guardados." });
        onSuccess();
        onOpenChange(false);
      } catch (error) {
        console.error("Error updating budget:", error);
        toast({ title: "Error al actualizar", description: "No se pudo actualizar el presupuesto.", variant: "destructive" });
      }
      return;
    }

    try {
        // Step 1: Create budget header
        console.log(paciente?.id)
        const budgetHeaderPayload = {
            idPaciente: paciente?.idPaciente,
            // idHistoriaClinica: paciente?.idHistoriaClinica, // TODO: Uncomment when backend supports this field
            idEspecialista: doctorResponsableId,
            nombre: nombrePresupuesto,
            nota,
            estado,
        };
        const budgetResponse = await api.post('/payments/budget', budgetHeaderPayload);
        const newBudgetUuid = budgetResponse.data?.uuid;

        if (!newBudgetUuid) {
            throw new Error("El backend no retornó un UUID para el nuevo presupuesto.");
        }

        // Step 2: Create budget items
        const budgetItemsPayload = {
            items: selectedItems.map(item => ({
                idProcedimiento: item.procedimiento.id,
                cantidad: item.cantidad,
                precioUnitario: item.procedimiento.precioBase,
                idPresupuesto: newBudgetUuid
            }))
        };

        if (budgetItemsPayload.items.length > 0) {
            await api.post('/payments/budget-item', budgetItemsPayload);
        }

        toast({ title: "Presupuesto Creado", description: "El presupuesto ha sido guardado exitosamente." });
        onSuccess();
        onOpenChange(false);
    } catch (error) {
        console.error("Error guardando el presupuesto:", error);
        toast({ title: "Error al guardar", description: "Ocurrió un problema al intentar guardar el presupuesto.", variant: "destructive" });
    }
  };
  
  const filteredProcedimientoOptions = useMemo(() => {
    if (!procedimientoOptions) return [];
    return procedimientoOptions.filter(
        opt => !selectedItems.some(item => item.procedimiento.id === opt.value)
    );
  }, [procedimientoOptions, selectedItems]);

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
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCantidad(item.id, item.cantidad - 1)}><MinusCircle className="h-4 w-4" /></Button>
                                <span>{item.cantidad}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCantidad(item.id, item.cantidad + 1)}><PlusCircle className="h-4 w-4" /></Button>
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
        onConfirm={() => itemToDelete && confirmDeleteItem(itemToDelete.id)}
        title="Confirmar Eliminación de Servicio"
        description={
            <>
                Este servicio ya tiene pagos registrados (S/ {(itemToDelete?.montoPagado || 0).toFixed(2)}).
                <br />
                Si lo elimina, <strong>los pagos asociados se marcarán como inactivos</strong> pero no se eliminarán del historial. ¿Está seguro?
            </>
        }
        confirmButtonText="Sí, eliminar y desactivar pagos"
        confirmButtonVariant="destructive"
    />
    </>
  );
}
