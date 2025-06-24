
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

import { mockProcedimientos, mockMotivosCita, mockEtiquetas } from '@/lib/data';
import type { Procedimiento, MotivoCita } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

// Schemas for form validation
const procedimientoSchema = z.object({
  denominacion: z.string().min(3, "La denominación debe tener al menos 3 caracteres."),
  descripcion: z.string().min(3, "La descripción es requerida."),
  precioBase: z.coerce.number().min(1, "El precio base debe ser de al menos S/ 1.00."),
});
const motivoCitaSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
});
const etiquetaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
});

export default function CatalogoPage() {
  const { toast } = useToast();
  const [procedimientos, setProcedimientos] = useState(mockProcedimientos);
  const [motivosCita, setMotivosCita] = useState(mockMotivosCita);
  const [etiquetas, setEtiquetas] = useState(mockEtiquetas.map(e => ({ id: e, nombre: e })));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'procedimiento' | 'motivo' | 'etiqueta' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string, name: string } | null>(null);

  const formProcedimiento = useForm<z.infer<typeof procedimientoSchema>>({ resolver: zodResolver(procedimientoSchema) });
  const formMotivo = useForm<z.infer<typeof motivoCitaSchema>>({ resolver: zodResolver(motivoCitaSchema) });
  const formEtiqueta = useForm<z.infer<typeof etiquetaSchema>>({ resolver: zodResolver(etiquetaSchema) });

  const getForm = (type: typeof modalType) => {
    if (type === 'procedimiento') return formProcedimiento;
    if (type === 'motivo') return formMotivo;
    return formEtiqueta;
  };

  const handleOpenModal = (type: 'procedimiento' | 'motivo' | 'etiqueta', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    const form = getForm(type);
    if (item) {
      form.reset(item);
    } else {
      form.reset(type === 'procedimiento' ? { denominacion: '', descripcion: '', precioBase: 0 } : { nombre: '' });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  };

  const onSubmit = (data: any) => {
    const id = editingItem?.id || `item-${crypto.randomUUID()}`;
    if (modalType === 'procedimiento') {
      const newItem = { id, ...data };
      if (editingItem) {
        const index = mockProcedimientos.findIndex(p => p.id === editingItem.id);
        mockProcedimientos[index] = newItem;
      } else {
        mockProcedimientos.push(newItem);
      }
      setProcedimientos([...mockProcedimientos]);
    } else if (modalType === 'motivo') {
      const newItem = { id, ...data };
      if (editingItem) {
        const index = mockMotivosCita.findIndex(m => m.id === editingItem.id);
        mockMotivosCita[index] = newItem;
      } else {
        mockMotivosCita.push(newItem);
      }
      setMotivosCita([...mockMotivosCita]);
    } else if (modalType === 'etiqueta') {
      const newName = data.nombre;
      if (editingItem) {
        const index = mockEtiquetas.findIndex(e => e === editingItem.id);
        mockEtiquetas[index] = newName;
      } else {
        mockEtiquetas.push(newName);
      }
      setEtiquetas(mockEtiquetas.map(e => ({ id: e, nombre: e })));
    }

    toast({ title: editingItem ? "Elemento Actualizado" : "Elemento Creado", description: `El elemento ha sido guardado correctamente.` });
    handleCloseModal();
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
            <DropdownMenuItem onClick={() => handleOpenModal('procedimiento', row.original)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
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
            <DropdownMenuItem onClick={() => handleOpenModal('motivo', row.original)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
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
            <DropdownMenuItem onClick={() => handleOpenModal('etiqueta', row.original)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteConfirm('etiqueta', row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  
  const renderForm = () => {
    if (!modalType) return null;

    if (modalType === 'procedimiento') {
      return (
        <Form {...formProcedimiento}>
          <form onSubmit={formProcedimiento.handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
            <FormField control={formProcedimiento.control} name="denominacion" render={({ field }) => ( <FormItem><FormLabel>Denominación</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={formProcedimiento.control} name="descripcion" render={({ field }) => ( <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField
              control={formProcedimiento.control}
              name="precioBase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Base</FormLabel>
                  <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <div className="flex h-10 items-center justify-center bg-muted px-3 border-r">
                      <span className="text-sm text-muted-foreground">S/</span>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      );
    }

    const form = modalType === 'motivo' ? formMotivo : formEtiqueta;
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
                <FormField control={form.control} name="nombre" render={({ field }) => ( <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </Form>
    );
  };
  
  const getTitle = () => {
    if (!modalType) return '';
    const action = editingItem ? 'Editar' : 'Nuevo';
    const entity = modalType === 'procedimiento' ? 'Procedimiento' : modalType === 'motivo' ? 'Motivo de Cita' : 'Etiqueta';
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
              <DataTable columns={columnsProcedimientos} data={procedimientos} onAdd={() => handleOpenModal('procedimiento')} addButtonLabel="Añadir Procedimiento" searchPlaceholder="Buscar procedimiento..." searchColumnId="denominacion" />
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
               <DataTable columns={columnsMotivos} data={motivosCita} onAdd={() => handleOpenModal('motivo')} addButtonLabel="Añadir Motivo" searchPlaceholder="Buscar motivo..." searchColumnId="nombre" />
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
                <DataTable columns={columnsEtiquetas} data={etiquetas} onAdd={() => handleOpenModal('etiqueta')} addButtonLabel="Añadir Etiqueta" searchPlaceholder="Buscar etiqueta..." searchColumnId="nombre" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-lg p-0">
            <DialogHeader className="p-6 pb-2">
                <DialogTitle>{getTitle()}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] -mr-4 pr-5">
              {renderForm()}
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
