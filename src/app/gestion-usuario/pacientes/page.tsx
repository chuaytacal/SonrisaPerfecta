
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation'; 
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, Eye } from "lucide-react";
import { AddPacienteForm } from "@/components/pacientes/AddPacienteForm"; 
import { SelectPersonaModal } from "@/components/personal/SelectPersonaModal"; 
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Persona, Paciente } from "@/types"; 
import { mockPacientesData, mockPersonasData } from "@/lib/data";

export default function PacientesPage() {
  const router = useRouter(); 
  const [pacienteList, setPacienteList] = React.useState<Paciente[]>(mockPacientesData);
  const [isAddPacienteFormOpen, setIsAddPacienteFormOpen] = React.useState(false);
  const [editingPaciente, setEditingPaciente] = React.useState<Paciente | null>(null);
  const [editingApoderado, setEditingApoderado] = React.useState<Persona | null>(null);
  const [selectedPersonaToPreload, setSelectedPersonaToPreload] = React.useState<Persona | null>(null);
  const [isCreatingNewPersonaFlow, setIsCreatingNewPersonaFlow] = React.useState(false);
  const [isSelectPersonaModalOpen, setIsSelectPersonaModalOpen] = React.useState(false);
  
  const { toast } = useToast();

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false);
  const [pacienteToAction, setPacienteToAction] = React.useState<Paciente | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<(() => void) | null>(null);
  const [confirmDialogProps, setConfirmDialogProps] = React.useState<{title: string, description: string, confirmButtonVariant?: "default" | "destructive", confirmButtonText?: string}>({
    title: "",
    description: ""
  });
  const [sortBy, setSortBy] = React.useState<string>("persona.nombre_asc");

  const handleSavePaciente = (savedPaciente: Paciente, apoderado?: Persona) => {
    // 1. Update/Add Apoderado Persona in the "DB"
    if (apoderado) {
      const apoderadoIndex = mockPersonasData.findIndex(p => p.id === apoderado.id);
      if (apoderadoIndex > -1) {
        mockPersonasData[apoderadoIndex] = apoderado;
      } else {
        mockPersonasData.push(apoderado);
      }
    }

    // 2. Update/Add Paciente's Persona in the "DB"
    const personaIndex = mockPersonasData.findIndex(p => p.id === savedPaciente.idPersona);
    if (personaIndex > -1) {
      mockPersonasData[personaIndex] = savedPaciente.persona;
    } else {
      mockPersonasData.push(savedPaciente.persona);
    }
  
    // 3. Update/Add Paciente in the "DB"
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === savedPaciente.id);
    if (pacienteIndex > -1) {
      mockPacientesData[pacienteIndex] = savedPaciente;
    } else {
      mockPacientesData.unshift(savedPaciente);
    }
  
    // 4. Update local state from the source of truth to force re-render
    setPacienteList([...mockPacientesData]);
  
    toast({
      title: editingPaciente ? "Paciente Actualizado" : "Paciente Registrado",
      description: `${savedPaciente.persona.nombre} ${savedPaciente.persona.apellidoPaterno} ha sido ${editingPaciente ? 'actualizado' : 'registrado'}.`,
    });
  
    // Reset form/modal states
    setIsAddPacienteFormOpen(false);
    setEditingPaciente(null);
    setEditingApoderado(null);
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(false);
  };
  
  const handleOpenAddPacienteFlow = () => {
    setEditingPaciente(null); 
    setEditingApoderado(null);
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(false);
    setIsSelectPersonaModalOpen(true);
  };

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersonaToPreload(persona);
    setIsCreatingNewPersonaFlow(false);
    setIsSelectPersonaModalOpen(false);
    setIsAddPacienteFormOpen(true); 
  };

  const handleCreateNewPersona = () => {
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(true);
    setIsSelectPersonaModalOpen(false);
    setIsAddPacienteFormOpen(true); 
  };
  
  const openEditModal = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setSelectedPersonaToPreload(paciente.persona);
    
    // Find and set apoderado data if it exists
    if (paciente.idApoderado) {
      const apoderado = mockPersonasData.find(p => p.id === paciente.idApoderado);
      setEditingApoderado(apoderado || null);
    } else {
      setEditingApoderado(null);
    }
    
    setIsCreatingNewPersonaFlow(false); 
    setIsAddPacienteFormOpen(true);
  };

  const handleDelete = (paciente: Paciente) => {
    setPacienteToAction(paciente);
    setConfirmDialogProps({
        title: "Confirmar Eliminación",
        description: `¿Estás seguro de que deseas eliminar a ${paciente.persona.nombre} ${paciente.persona.apellidoPaterno}? Esta acción no se puede deshacer.`,
        confirmButtonText: "Eliminar",
        confirmButtonVariant: "destructive"
    });
    setConfirmAction(() => () => {
        setPacienteList(prev => prev.filter(p => p.id !== paciente.id));
        toast({
            title: "Paciente Eliminado",
            description: `${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} ha sido eliminado.`,
            variant: "destructive"
        });
        setIsConfirmDeleteDialogOpen(false);
        setPacienteToAction(null);
    });
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleToggleStatus = (paciente: Paciente) => {
    setPacienteToAction(paciente);
    const newStatus = paciente.estado === "Activo" ? "Inactivo" : "Activo";
    setConfirmDialogProps({
        title: `Confirmar Cambio de Estado`,
        description: `¿Estás seguro de que deseas cambiar el estado de ${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} a ${newStatus}?`,
        confirmButtonText: newStatus === "Activo" ? "Activar" : "Desactivar",
    });
    setConfirmAction(() => () => {
        setPacienteList(prev => prev.map(p => p.id === paciente.id ? {...p, estado: newStatus} : p));
        toast({
            title: "Estado Actualizado",
            description: `El estado de ${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} ha sido cambiado a ${newStatus}.`
        });
        setIsConfirmDeleteDialogOpen(false);
        setPacienteToAction(null);
    });
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleViewDetails = (pacienteId: string) => {
    router.push(`/gestion-usuario/pacientes/${pacienteId}/filiacion`);
  };

const columns: ColumnDef<Paciente>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todas"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row, table }) => {
      const rowIndex = row.index;
      return <span>{rowIndex + 1 + (table.getState().pagination.pageIndex * table.getState().pagination.pageSize)}</span>;
    },
     enableSorting: false,
  },
  {
    id: "persona.nombre", 
    accessorKey: "persona.nombre", 
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const paciente = row.original;
      const nombreCompleto = `${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} ${paciente.persona.apellidoMaterno}`;
      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium">{nombreCompleto}</div>
            <div className="text-xs text-muted-foreground">{paciente.persona.tipoDocumento}: {paciente.persona.numeroDocumento}</div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => { 
        const paciente = row.original;
        const nombreCompleto = `${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} ${paciente.persona.apellidoMaterno}`.toLowerCase();
        const numeroDocumento = paciente.persona.numeroDocumento.toLowerCase();
        const searchTerm = String(value).toLowerCase();
        return nombreCompleto.includes(searchTerm) || numeroDocumento.includes(searchTerm);
    }
  },
  {
    accessorKey: "persona.telefono",
    header: "Teléfono",
    cell: ({ row }) => {
        const paciente = row.original;
        return (
            <div>
                <div>{paciente.persona.telefono}</div>
            </div>
        )
    }
  },
  {
    accessorKey: "etiquetas",
    header: "Etiquetas",
    cell: ({ row }) => {
      const etiquetas = row.original.etiquetas;
      if (!etiquetas || etiquetas.length === 0) {
        return <span className="text-xs text-muted-foreground">Ninguna</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {etiquetas.map((etiqueta) => (
            <Badge key={etiqueta} variant="secondary" className="text-xs">
              {etiqueta}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "fechaIngreso",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Ingreso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.original.estado === "Activo";
      return (
        <Badge variant={isActive ? "default" : "destructive"}
               className={isActive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
          {row.original.estado}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const paciente = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(paciente.idPersona)}>
              Copiar ID Persona
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => openEditModal(paciente)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleDelete(paciente)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleToggleStatus(paciente)}>
              {paciente.estado === "Activo" ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
              {paciente.estado === "Activo" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => handleViewDetails(paciente.id)}>
                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

  const statusOptions = [
    { label: "Activo", value: "Activo" },
    { label: "Inactivo", value: "Inactivo" },
  ];

  const sortOptions = [
    { label: "Nombre (A-Z)", value: "persona.nombre_asc" }, 
    { label: "Nombre (Z-A)", value: "persona.nombre_desc" },
    { label: "Fecha de Ingreso (Más Reciente)", value: "fechaIngreso_desc" },
    { label: "Fecha de Ingreso (Más Antiguo)", value: "fechaIngreso_asc" },
  ];


  return (
    <div className="w-full py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lista de Pacientes</h1>
        <p className="text-muted-foreground">
          Administra los pacientes de la clínica.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={pacienteList}
        searchPlaceholder="Buscar por nombre o DNI..."
        searchColumnId="persona.nombre" 
        statusColumnId="estado"
        statusOptions={statusOptions}
        onAdd={handleOpenAddPacienteFlow} 
        addButtonLabel="Añadir Paciente" 
      >
        <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                <SelectValue placeholder="Ordenar Por..." />
            </SelectTrigger>
            <SelectContent>
                {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </DataTable>
      
      <SelectPersonaModal
        isOpen={isSelectPersonaModalOpen}
        onClose={() => setIsSelectPersonaModalOpen(false)}
        onSelectPersona={handleSelectPersona}
        onCreateNewPersona={handleCreateNewPersona}
        existingPersonas={mockPersonasData} 
        modalDescription="Busca una persona por DNI o nombre completo para asignarle el rol de paciente, o crea una nueva persona."
        createButtonLabel="Crear Persona y Asignar como Paciente"
      />

      <AddPacienteForm 
        open={isAddPacienteFormOpen}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setEditingPaciente(null);
                setSelectedPersonaToPreload(null);
                setIsCreatingNewPersonaFlow(false);
                setEditingApoderado(null);
            }
            setIsAddPacienteFormOpen(isOpen);
        }}
        initialPacienteData={editingPaciente} 
        initialApoderadoData={editingApoderado}
        selectedPersonaToPreload={selectedPersonaToPreload}
        isCreatingNewPersonaFlow={isCreatingNewPersonaFlow}
        onPacienteSaved={handleSavePaciente} 
      />
      {pacienteToAction && confirmAction && (
        <ConfirmationDialog
            isOpen={isConfirmDeleteDialogOpen}
            onOpenChange={setIsConfirmDeleteDialogOpen}
            onConfirm={confirmAction}
            title={confirmDialogProps.title}
            description={confirmDialogProps.description}
            confirmButtonText={confirmDialogProps.confirmButtonText}
            confirmButtonVariant={confirmDialogProps.confirmButtonVariant}
            isLoading={false} 
        />
      )}
    </div>
  );
}
