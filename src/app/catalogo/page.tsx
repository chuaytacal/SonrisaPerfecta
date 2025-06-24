
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddProcedimientoModal } from '@/components/catalogo/AddProcedimientoModal';

import { mockProcedimientos, mockMotivosCita, mockEtiquetas } from '@/lib/data';
import type { Procedimiento, MotivoCita } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

// Schemas for form validation
const motivoCitaSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
});
const etiquetaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
});

type ModalType = 'procedimiento' | 'motivo' | 'etiqueta';

export default function CatalogoPage() {
  const { toast } = useToast();
  const [procedimientos, setProcedimientos] = useState(mockProcedimientos);
  const [motivosCita, setMotivosCita] = useState(mockMotivosCita);
  const [etiquetas, setEtiquetas] = useState(mockEtiquetas.map(e => ({ id: e, nombre: e })));

  const [isProcedimientoModalOpen, setIsProcedimientoModalOpen] = useState(false);
  const [editingProcedimiento, setEditingProcedimiento] = useState<Procedimiento | null>(null);

  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [genericModalType, setGenericModalType] = useState<'motivo' | 'etiqueta' | null>(null);
  const [editingGenericItem, setEditingGenericItem] = useState<any>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string, name: string } | null>(null);

  const formMotivo = useForm<z.infer<typeof motivoCitaSchema>>({ resolver: zodResolver(motivoCitaSchema) });
  const formEtiqueta = useForm<z.infer<typeof etiquetaSchema>>({ resolver: zodResolver(etiquetaSchema) });

  const handleOpenProcedimientoModal = (item: Procedimiento | null = null) => {
    setEditingProcedimiento(item);
    setIsProcedimientoModalOpen(true);
  };

  const handleSaveProcedimiento = (procedimiento: Procedimiento) => {
    if (editingProcedimiento) {
      const index = mockProcedimientos.findIndex(p => p.id === procedimiento.id);
      mockProcedimientos[index] = procedimiento;
    } else {
      mockProcedimientos.push(procedimiento);
    }
    setProcedimientos([...mockProcedimientos]);
    toast({ title: editingProcedimiento ? "Procedimiento Actualizado" : "Procedimiento Creado", description: `El procedimiento ha sido guardado correctamente.` });
    setIsProcedimientoModalOpen(false);
    setEditingProcedimiento(null);
  };
  
  const handleOpenGenericModal = (type: 'motivo' | 'etiqueta', item: any = null) => {
    setGenericModalType(type);
    setEditingGenericItem(item);
    const form = type === 'motivo' ? formMotivo : formEtiqueta;
    if (item) {
      form.reset(item);
    } else {
      form.reset({ nombre: '' });
    }
    setIsGenericModalOpen(true);
  };
  
  const handleCloseGenericModal = () => {
    setIsGenericModalOpen(false);
    setGenericModalType(null);
    setEditingGenericItem(null);
  };

  const onGenericSubmit = (data: any) => {
    const id = editingGenericItem?.id || `item-${crypto.randomUUID()}`;
    if (genericModalType === 'motivo') {
      const newItem = { id, ...data };
      if (editingGenericItem) {
        const index = mockMotivosCita.findIndex(m => m.id === editingGenericItem.id);
        mockMotivosCita[index] = newItem;
      } else {
        mockMotivosCita.push(newItem);
      }
      setMotivosCita([...mockMotivosCita]);
    } else if (genericModalType === 'etiqueta') {
      const newName = data.nombre;
      if (editingGenericItem) {
        const index = mockEtiquetas.findIndex(e => e === editingGenericItem.id);
        mockEtiquetas[index] = newName;
      } else {
        mockEtiquetas.push(newName);
      }
      setEtiquetas(mockEtiquetas.map(e => ({ id: e, nombre: e })));
    }

    toast({ title: editingGenericItem ? "Elemento Actualizado" : "Elemento Creado", description: `El elemento ha sido guardado correctamente.` });
    handleCloseGenericModal();
  };
  
  const openDeleteConfirm = (type: string, item: any) => {
    const name = item.denominacion || item.nombre;
    setItemToDelete({ type, id: item.id, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    const { type, id, name } = itemToDelete;

    if (type === 'procedimiento') {
      const index = mockProcedimientos.findIndex(p => p.id === id);
      if(index > -1) mockProcedimientos.splice(index, 1);
      setProcedimientos([...mockProcedimientos]);
    } else if (type === 'motivo') {
      const index = mockMotivosCita.findIndex(m => m.id === id);
      if(index > -1) mockMotivosCita.splice(index, 1);
      setMotivosCita([...mockMotivosCita]);
    } else if (type === 'etiqueta') {
      const index = mockEtiquetas.findIndex(e => e === id);
      if(index > -1) mockEtiquetas.splice(index, 1);
      setEtiquetas(mockEtiquetas.map(e => ({ id: e, nombre: e })));
    }

    toast({ title: "Elemento Eliminado", description: `"${name}" ha sido eliminado.`, variant: 'destructive' });
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const columnsProcedimientos: ColumnDef<Procedimiento>[] = [
    { accessorKey: "denominacion", header: "Denominación" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => <span className="text-muted-foreground">{row.original.descripcion}</span> },
    { accessorKey: "precioBase", header: "Precio Base", cell: ({ row }) => `S/ ${row.original.precioBase.toFixed(2)}` },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenProcedimientoModal(row.original)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteConfirm('procedimiento', row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const columnsMotivos: ColumnDef<MotivoCita>[] = [
    { accessorKey: "nombre", header: "Nombre" },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenGenericModal('motivo', row.original)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteConfirm('motivo', row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  
  const columnsEtiquetas: ColumnDef<{ id: string, nombre: string }>[] = [
    { accessorKey: "nombre", header: "Nombre" },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenGenericModal('etiqueta', row.original)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteConfirm('etiqueta', row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  
  const renderGenericForm = () => {
    if (!genericModalType) return null;
    const form = genericModalType === 'motivo' ? formMotivo : formEtiqueta;
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenericSubmit)} className="space-y-4 px-6 pb-6 pt-2">
                <FormField control={form.control} name="nombre" render={({ field }) => ( <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseGenericModal}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </Form>
    );
  };
  
  const getGenericTitle = () => {
    if (!genericModalType) return '';
    const action = editingGenericItem ? 'Editar' : 'Nuevo';
    const entity = genericModalType === 'motivo' ? 'Motivo de Cita' : 'Etiqueta';
    return `${action} ${entity}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Catálogo del Sistema</h1>
        <p className="text-muted-foreground">Administre los elementos reutilizables del sistema como procedimientos, motivos de cita y etiquetas de paciente.</p>
      </div>
      
      <Tabs defaultValue="procedimientos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="procedimientos">Procedimientos</TabsTrigger>
          <TabsTrigger value="motivos">Motivos de Cita</TabsTrigger>
          <TabsTrigger value="etiquetas">Etiquetas de Paciente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="procedimientos">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Procedimientos</CardTitle>
              <CardDescription>Servicios ofrecidos en la clínica. Estos se usan en el odontograma y citas.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columnsProcedimientos} data={procedimientos} onAdd={() => handleOpenProcedimientoModal(null)} addButtonLabel="Añadir Procedimiento" searchPlaceholder="Buscar procedimiento..." searchColumnId="denominacion" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivos">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Motivos de Cita</CardTitle>
              <CardDescription>Razones por las que un paciente agenda una cita.</CardDescription>
            </CardHeader>
            <CardContent>
               <DataTable columns={columnsMotivos} data={motivosCita} onAdd={() => handleOpenGenericModal('motivo')} addButtonLabel="Añadir Motivo" searchPlaceholder="Buscar motivo..." searchColumnId="nombre" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="etiquetas">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Etiquetas de Paciente</CardTitle>
              <CardDescription>Etiquetas para clasificar o resaltar información importante de los pacientes.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columnsEtiquetas} data={etiquetas} onAdd={() => handleOpenGenericModal('etiqueta')} addButtonLabel="Añadir Etiqueta" searchPlaceholder="Buscar etiqueta..." searchColumnId="nombre" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AddProcedimientoModal 
        isOpen={isProcedimientoModalOpen}
        onOpenChange={setIsProcedimientoModalOpen}
        onSave={handleSaveProcedimiento}
        editingItem={editingProcedimiento}
      />

      <Dialog open={isGenericModalOpen} onOpenChange={setIsGenericModalOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-0">
            <DialogHeader className="p-6 pb-2">
                <DialogTitle>{getGenericTitle()}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] -mr-4 pr-5">
              {renderGenericForm()}
            </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        description={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmButtonVariant="destructive"
      />
    </div>
  );
}
