
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import api from '@/lib/api';

import type { Procedimiento, MotivoCita } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

const API_BASE_URL = "http://localhost:3001/api";

interface BackendTag {
  uuid: string;
  name: string;
  description?: string;
}

interface BackendMotivo {
  uuid: string;
  name: string;
  description?: string;
}

const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al consultar la API");
  }

  return response.json();
};

const getAllTags = async (): Promise<BackendTag[]> => {
  return fetcher<BackendTag[]>(`${API_BASE_URL}/catalog/tags`);
};

const getAllMotivos = async (): Promise<BackendMotivo[]> => {
  return fetcher<BackendMotivo[]>(`${API_BASE_URL}/catalog/appointment-reasons`);
};

// Schemas for form validation
const motivoCitaSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().optional(),
});

const etiquetaSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  description: z.string().optional(),
});

type ModalType = 'procedimiento' | 'motivo' | 'etiqueta';

export default function CatalogoPage() {
  const { toast } = useToast();
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivosCita, setMotivosCita] = useState<{ name: string; description: string }[]>([]);
  const [etiquetas, setEtiquetas] = useState<{ name: string; description: string }[]>([]);

  const [isProcedimientoModalOpen, setIsProcedimientoModalOpen] = useState(false);
  const [editingProcedimiento, setEditingProcedimiento] = useState<Procedimiento | null>(null);

  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [genericModalType, setGenericModalType] = useState<'motivo' | 'etiqueta' | null>(null);
  const [editingGenericItem, setEditingGenericItem] = useState<any>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string, name: string } | null>(null);

  const formMotivo = useForm<z.infer<typeof motivoCitaSchema>>({ resolver: zodResolver(motivoCitaSchema) });
  const formEtiqueta = useForm<z.infer<typeof etiquetaSchema>>({ resolver: zodResolver(etiquetaSchema) });

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);

        // ✅ Fetch procedimientos
        const response = await api.get('/procedures/');
        const mappedProcedimientos = response.data.map((item: any) => ({
          id: item.uuid,
          denominacion: item.denominacion,
          descripcion: item.descripcion,
          precioBase: parseFloat(item.precioBase)
        }));
        setProcedimientos(mappedProcedimientos);

        // ✅ Fetch etiquetas
        const tags = await getAllTags();
        const mappedTags = tags.map(tag => ({
          id: tag.uuid,
          name: tag.name,
          description: tag.description || ''
        }));
        setEtiquetas(mappedTags);

        // ✅ Fetch motivos
        const motivos = await getAllMotivos();
        const mappedMotivos = motivos.map(m => ({
          id: m.uuid,
          name: m.name,
          description: m.description || ''
        }));
        setMotivosCita(mappedMotivos);

      } catch (error) {
        console.error("Error fetching catalog data:", error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudo obtener procedimientos o etiquetas del servidor.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [toast]);

  const handleOpenProcedimientoModal = (item: Procedimiento | null = null) => {
    setEditingProcedimiento(item);
    setIsProcedimientoModalOpen(true);
  };

  const handleSaveProcedimiento = async (procedimiento: Procedimiento) => {
    const isEditing = !!editingProcedimiento;
    const { id, ...payload } = procedimiento; // Exclude client-side ID from payload

    try {
      if (isEditing) {
        const response = await api.patch(`/procedures/${id}`, payload);
        const savedProc = { ...response.data, id: response.data.uuid, precioBase: parseFloat(response.data.precioBase) };
        setProcedimientos(procedimientos.map(p => p.id === savedProc.id ? savedProc : p));
      } else {
        const response = await api.post('/procedures/', payload);
        const newProc = { ...response.data, id: response.data.uuid, precioBase: parseFloat(response.data.precioBase) };
        setProcedimientos(prev => [...prev, newProc]);
      }
      toast({ title: isEditing ? "Procedimiento Actualizado" : "Procedimiento Creado", description: `El procedimiento ha sido guardado correctamente.` });
      setIsProcedimientoModalOpen(false);
      setEditingProcedimiento(null);
    } catch (error) {
      console.error("Error saving procedure:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el procedimiento. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenGenericModal = (type: 'motivo' | 'etiqueta', item: any = null) => {
    setGenericModalType(type);
    setEditingGenericItem(item);
    const form = type === 'motivo' ? formMotivo : formEtiqueta;
    if (item) {
      form.reset({
        name: item.name || '',
        description: item.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
    setIsGenericModalOpen(true);
  };
  
  const handleCloseGenericModal = () => {
    setIsGenericModalOpen(false);
    setGenericModalType(null);
    setEditingGenericItem(null);
  };

  const onGenericSubmit = async (data: any) => {
    const id = editingGenericItem?.id || `item-${crypto.randomUUID()}`;
    if (genericModalType === 'motivo') {
      try {
        if (editingGenericItem) {
          await api.patch(`/catalog/appointment-reasons/${editingGenericItem.id}`, data);
        } else {
          await api.post(`/catalog/appointment-reasons`, data);
        }

        toast({
          title: "Motivo guardado",
          description: "Los cambios han sido guardados exitosamente.",
        });

        // Optionally refetch data or update `motivosCita` state manually
      } catch (error) {
        console.error("Error saving motivo:", error);
        toast({
          title: "Error al guardar motivo",
          description: "No se pudo guardar en la base de datos.",
          variant: "destructive",
        });
      }
    } else if (genericModalType === 'etiqueta') {
      try {
        if (editingGenericItem) {
          // PATCH
          const response = await api.patch(`/catalog/tags/${editingGenericItem.id}`, data);
          // update state if needed
        } else {
          // POST
          const response = await api.post(`/catalog/tags`, data);
          console.log("Etiqueta creada:", response.data);
          // update etiquetas state
        }

        toast({
          title: "Etiqueta guardada",
          description: "Los cambios han sido guardados exitosamente.",
        });
      } catch (error) {
        console.error("Error saving etiqueta:", error);
        toast({
          title: "Error al guardar etiqueta",
          description: "No se pudo guardar en la base de datos.",
          variant: "destructive",
        });
      }
    }

    toast({ title: editingGenericItem ? "Elemento Actualizado" : "Elemento Creado", description: `El elemento ha sido guardado correctamente.` });
    handleCloseGenericModal();
  };
  
  const openDeleteConfirm = (type: string, item: any) => {
    const name = item.name;
    setItemToDelete({ type, id: item.id, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const { type, id, name } = itemToDelete;

    try {
      if (type === 'procedimiento') {
        await api.delete(`/procedures/${id}`);
        setProcedimientos(prev => prev.filter(p => p.id !== id));
      } else if (type === 'motivo') {
        await api.delete(`/catalog/appointment-reasons/${id}`);
        setMotivosCita(prev => prev.filter(m => m.id !== id));
      } else if (type === 'etiqueta') {
        await api.delete(`/catalog/tags/${id}`);
        setEtiquetas(prev => prev.filter(e => e.id !== id));
      }

      toast({
        title: "Elemento Eliminado",
        description: `"${name}" ha sido eliminado.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el elemento.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
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
    { accessorKey: "name", header: "Nombre" },
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
  
  const columnsEtiquetas: ColumnDef<{ id: string, name: string , description: string }>[] = [
    { accessorKey: "name", header: "Nombre" },
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
    const action = editingGenericItem ? 'Editar' : genericModalType === 'motivo' ? 'Nuevo' : 'Nueva';
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
              {loading ? (
                <div className="space-y-4 p-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <DataTable columns={columnsProcedimientos} data={procedimientos} onAdd={() => handleOpenProcedimientoModal(null)} addButtonLabel="Añadir Procedimiento" searchPlaceholder="Buscar procedimiento..." searchColumnId="denominacion" />
              )}
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
               <DataTable columns={columnsMotivos} data={motivosCita} onAdd={() => handleOpenGenericModal('motivo')} addButtonLabel="Añadir Motivo" searchPlaceholder="Buscar motivo..." searchColumnId="name" />
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
                <DataTable columns={columnsEtiquetas} data={etiquetas} onAdd={() => handleOpenGenericModal('etiqueta')} addButtonLabel="Añadir Etiqueta" searchPlaceholder="Buscar etiqueta..." searchColumnId="name" />
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
