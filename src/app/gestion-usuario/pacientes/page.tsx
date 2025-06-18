
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
import type { Persona, Paciente, EtiquetaPaciente, AntecedentesMedicosData } from "@/types"; 

// Mock data for Personas (can be shared or fetched)
export const mockPersonasData: Persona[] = [ 
  { id: "persona-1", tipoDocumento: "DNI", numeroDocumento: "73124568", nombre: "Joe", apellidoPaterno: "Schilder", apellidoMaterno: "Mann", fechaNacimiento: new Date("1985-05-15"), sexo: "M", direccion: "Av. Siempre Viva 123", telefono: "943567821", email: "joe.schilder@example.com" },
  { id: "persona-2", tipoDocumento: "DNI", numeroDocumento: "18273645", nombre: "Phoebe", apellidoPaterno: "Venturi", apellidoMaterno: "Ross", fechaNacimiento: new Date("1990-08-22"), sexo: "F", direccion: "Calle Falsa 456", telefono: "981234670", email: "phoebe.venturi@example.com" },
  { id: "persona-3", tipoDocumento: "DNI", numeroDocumento: "49205873", nombre: "Caroline", apellidoPaterno: "Pandolfi", apellidoMaterno: "Geller", fechaNacimiento: new Date("1988-11-30"), sexo: "F", direccion: "Jr. Desconocido 789", telefono: "967891234", email: "caroline.pandolfi@example.com" },
  { id: "persona-p1", tipoDocumento: "DNI", numeroDocumento: "76543210", nombre: "Mario", apellidoPaterno: "Bros", apellidoMaterno: "Nintendo", fechaNacimiento: new Date("1983-07-09"), sexo: "M", direccion: "Mushroom Kingdom", telefono: "912345678", email: "mario@example.com" },
  { id: "persona-p2", tipoDocumento: "EXTRANJERIA", numeroDocumento: "X1234567", nombre: "Luigi", apellidoPaterno: "Bros", apellidoMaterno: "Nintendo", fechaNacimiento: new Date("1983-07-09"), sexo: "M", direccion: "Mushroom Kingdom", telefono: "987654321", email: "luigi@example.com" },
];

const initialAntecedentesExample: AntecedentesMedicosData = {
  q1_hospitalizado: "No", q1_porque: "N/A", q1_donde: "N/A",
  q2_atencionMedica: "Sí", q2_porque: "Control de rutina", q2_donde: "Clínica Local",
  q3_alergico: "Sí", q3_cuales: "Penicilina",
  q4_hemorragia: "No",
  q5_enfermedades: ["Hipertensión arterial"],
  q6_otraEnfermedad: "No", q6_cual: "N/A",
  q7_medicacionActual: "Sí", q7_cual: "Losartán para la presión",
  q8_embarazada: "No", q8_semanas: "N/A",
  q9_hipertenso: "Sí",
  q10_ultimaConsultaDental: "Hace 6 meses",
};

export const mockPacientesData: Paciente[] = [ 
  {
    id: "paciente-1",
    idPersona: "persona-p1",
    persona: mockPersonasData.find(p => p.id === "persona-p1")!,
    fechaIngreso: "10/01/2024",
    estado: "Activo",
    etiquetas: ["Diabético", "Hipertenso"],
    notas: "Paciente refiere sensibilidad dental al frío. Programar revisión.",
    antecedentesMedicos: initialAntecedentesExample,
  },
  {
    id: "paciente-2",
    idPersona: "persona-p2",
    persona: mockPersonasData.find(p => p.id === "persona-p2")!,
    fechaIngreso: "15/03/2024",
    estado: "Activo",
    etiquetas: ["Menor de Edad"],
    notas: "Acompañado por su madre. Buena higiene bucal.",
    antecedentesMedicos: { ...initialAntecedentesExample, q3_alergico: "No", q3_cuales: "", q5_enfermedades: [] },
  },
  {
    id: "paciente-3",
    idPersona: "persona-3", 
    persona: mockPersonasData.find(p => p.id === "persona-3")!,
    fechaIngreso: "20/05/2023",
    estado: "Inactivo",
    etiquetas: ["Fumador", "Postquirúrgico"],
    notas: "Control post-extracción molar. Cita de seguimiento pendiente.",
    antecedentesMedicos: { ...initialAntecedentesExample, q8_embarazada: "Sí", q8_semanas: "12" },
  }
];


export default function PacientesPage() {
  const router = useRouter(); 
  const [pacienteList, setPacienteList] = React.useState<Paciente[]>(mockPacientesData);
  const [isAddPacienteFormOpen, setIsAddPacienteFormOpen] = React.useState(false);
  const [editingPaciente, setEditingPaciente] = React.useState<Paciente | null>(null);
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

  const handleSavePaciente = (savedPaciente: Paciente) => {
    setPacienteList(prevList => {
      const existingIndex = prevList.findIndex(p => p.id === savedPaciente.id);
      if (existingIndex > -1) {
        const updatedList = [...prevList];
        updatedList[existingIndex] = savedPaciente;
        return updatedList;
      }
      const personaExists = mockPersonasData.find(p => p.id === savedPaciente.idPersona);
      if (!personaExists) {
        mockPersonasData.push(savedPaciente.persona); 
      }
      return [savedPaciente, ...prevList];
    });
    toast({
      title: editingPaciente ? "Paciente Actualizado" : "Paciente Registrado",
      description: `${savedPaciente.persona.nombre} ${savedPaciente.persona.apellidoPaterno} ha sido ${editingPaciente ? 'actualizado' : 'registrado'}.`,
    });
    setIsAddPacienteFormOpen(false);
    setEditingPaciente(null);
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(false);
  };
  
  const handleOpenAddPacienteFlow = () => {
    setEditingPaciente(null); 
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
    router.push(`/gestion-usuario/pacientes/${pacienteId}/detalles`);
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
            setIsAddPacienteFormOpen(isOpen);
            if (!isOpen) {
                setEditingPaciente(null);
                setSelectedPersonaToPreload(null);
                setIsCreatingNewPersonaFlow(false);
            }
        }}
        initialPacienteData={editingPaciente} 
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

