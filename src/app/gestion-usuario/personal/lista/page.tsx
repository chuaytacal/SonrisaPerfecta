
"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AddPersonalForm } from "@/components/personal/AddPersonalForm";
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
import type { Persona, TipoDocumento, Sexo } from "@/types";


// Representa la tabla 'especialista' que es el Personal
export type Personal = {
  id: string; // ID del registro de Personal/Especialista
  idPersona: string; // FK a la tabla Persona
  persona: Persona; // Datos de la persona anidados
  especialidad: string; // "Ortodoncia", "Endodoncia", etc.
  fechaIngreso: string; // "DD/MM/YYYY" - Fecha de ingreso como personal
  estado: "Activo" | "Inactivo";
  avatarUrl?: string; // Específico del rol de personal
};

const mockPersonasData: Persona[] = [
  { id: "persona-1", tipoDocumento: "DNI", numeroDocumento: "73124568", nombre: "Joe", apellidoPaterno: "Schilder", apellidoMaterno: "Mann", fechaNacimiento: new Date("1985-05-15"), sexo: "M", direccion: "Av. Siempre Viva 123", telefono: "+51 943 567 821", email: "joe.schilder@example.com" },
  { id: "persona-2", tipoDocumento: "DNI", numeroDocumento: "18273645", nombre: "Phoebe", apellidoPaterno: "Venturi", apellidoMaterno: "Ross", fechaNacimiento: new Date("1990-08-22"), sexo: "F", direccion: "Calle Falsa 456", telefono: "+51 981 234 670", email: "phoebe.venturi@example.com" },
  { id: "persona-3", tipoDocumento: "DNI", numeroDocumento: "49205873", nombre: "Caroline", apellidoPaterno: "Pandolfi", apellidoMaterno: "Geller", fechaNacimiento: new Date("1988-11-30"), sexo: "F", direccion: "Jr. Desconocido 789", telefono: "+51 967 891 234", email: "caroline.pandolfi@example.com" },
  { id: "persona-4", tipoDocumento: "DNI", numeroDocumento: "50938472", nombre: "Ricardo", apellidoPaterno: "Marchetti", apellidoMaterno: "Tribbiani", fechaNacimiento: new Date("1992-03-10"), sexo: "M", direccion: "Pje. Oculto 101", telefono: "+51 935 648 290", email: "ricardo.marchetti@example.com" },
  { id: "persona-5", tipoDocumento: "EXTRANJERIA", numeroDocumento: "X6349275", nombre: "Dorothy", apellidoPaterno: "Hussain", apellidoMaterno: "Bing", fechaNacimiento: new Date("1980-07-01"), sexo: "F", direccion: "Av. Central 202", telefono: "+51 927 401 356", email: "dorothy.hussain@example.com" },
  { id: "persona-6", tipoDocumento: "PASAPORTE", numeroDocumento: "P2107384", nombre: "Eleanor", apellidoPaterno: "Mann", apellidoMaterno: "Buffay", fechaNacimiento: new Date("1995-01-20"), sexo: "F", direccion: "Calle Sol 303", telefono: "+51 984 123 758", email: "eleanor.mann@example.com" },
  { id: "persona-7", tipoDocumento: "DNI", numeroDocumento: "85017429", nombre: "Nina", apellidoPaterno: "Francini", apellidoMaterno: "Green", fechaNacimiento: new Date("1989-09-05"), sexo: "F", direccion: "Av. Luna 404", telefono: "+51 975 320 461", email: "nina.francini@example.com" },
  { id: "persona-8", tipoDocumento: "DNI", numeroDocumento: "76309152", nombre: "Caroline", apellidoPaterno: "Mallet", apellidoMaterno: "Peralta", fechaNacimiento: new Date("1993-12-12"), sexo: "F", direccion: "Jr. Estrella 505", telefono: "+51 928 547 103", email: "caroline.mallet@example.com" },
];

const mockPersonalData: Personal[] = [
  {
    id: "personal-1",
    idPersona: "persona-1",
    persona: mockPersonasData[0],
    especialidad: "Ortodoncia",
    fechaIngreso: "17/02/2023",
    estado: "Inactivo",
    avatarUrl: "https://placehold.co/40x40.png?text=JS",
  },
  {
    id: "personal-2",
    idPersona: "persona-2",
    persona: mockPersonasData[1],
    especialidad: "Endodoncia",
    fechaIngreso: "05/07/2023",
    estado: "Activo",
    avatarUrl: "https://placehold.co/40x40.png?text=PV",
  },
  {
    id: "personal-3",
    idPersona: "persona-3",
    persona: mockPersonasData[2],
    especialidad: "Periodoncia",
    fechaIngreso: "11/10/2023",
    estado: "Activo",
    avatarUrl: "https://placehold.co/40x40.png?text=CP",
  },
];


export default function ListaPersonalPage() {
  const [personalList, setPersonalList] = React.useState<Personal[]>(mockPersonalData);
  const [isAddPersonalFormOpen, setIsAddPersonalFormOpen] = React.useState(false);
  const [editingPersonal, setEditingPersonal] = React.useState<Personal | null>(null);
  const [selectedPersonaToPreload, setSelectedPersonaToPreload] = React.useState<Persona | null>(null);
  const [isCreatingNewPersonaFlow, setIsCreatingNewPersonaFlow] = React.useState(false);
  const [isSelectPersonaModalOpen, setIsSelectPersonaModalOpen] = React.useState(false);
  
  const { toast } = useToast();

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false);
  const [personalToAction, setPersonalToAction] = React.useState<Personal | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<(() => void) | null>(null);
  const [confirmDialogProps, setConfirmDialogProps] = React.useState<{title: string, description: string, confirmButtonVariant?: "default" | "destructive", confirmButtonText?: string}>({
    title: "",
    description: ""
  });
  const [sortBy, setSortBy] = React.useState<string>("nombre_asc");

  const handleSavePersonal = (savedPersonal: Personal) => {
    setPersonalList(prevList => {
      const existingIndex = prevList.findIndex(p => p.id === savedPersonal.id);
      if (existingIndex > -1) {
        const updatedList = [...prevList];
        updatedList[existingIndex] = savedPersonal;
        return updatedList;
      }
      // If new, ensure mockPersonasData is updated if a new Persona was created
      // This is a simplification; in a real app, data would refetch or be managed globally
      const personaExists = mockPersonasData.find(p => p.id === savedPersonal.idPersona);
      if (!personaExists) {
        mockPersonasData.push(savedPersonal.persona);
      }
      return [savedPersonal, ...prevList];
    });
    toast({
      title: editingPersonal ? "Personal Actualizado" : "Personal Registrado",
      description: `${savedPersonal.persona.nombre} ${savedPersonal.persona.apellidoPaterno} ha sido ${editingPersonal ? 'actualizado' : 'registrado'}.`,
    });
    setIsAddPersonalFormOpen(false);
    setEditingPersonal(null);
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(false);
  };
  
  const handleOpenAddPersonalFlow = () => {
    setEditingPersonal(null); // Clear any existing edit state
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(false);
    setIsSelectPersonaModalOpen(true);
  };

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersonaToPreload(persona);
    setIsCreatingNewPersonaFlow(false);
    setIsSelectPersonaModalOpen(false);
    setIsAddPersonalFormOpen(true);
  };

  const handleCreateNewPersona = () => {
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(true);
    setIsSelectPersonaModalOpen(false);
    setIsAddPersonalFormOpen(true);
  };
  
  const openEditModal = (personal: Personal) => {
    setEditingPersonal(personal);
    setSelectedPersonaToPreload(personal.persona); // Preload with existing persona data
    setIsCreatingNewPersonaFlow(false); // Not creating a new persona, but editing
    setIsAddPersonalFormOpen(true);
  };

  const handleDelete = (personal: Personal) => {
    setPersonalToAction(personal);
    setConfirmDialogProps({
        title: "Confirmar Eliminación",
        description: `¿Estás seguro de que deseas eliminar a ${personal.persona.nombre} ${personal.persona.apellidoPaterno}? Esta acción no se puede deshacer.`,
        confirmButtonText: "Eliminar",
        confirmButtonVariant: "destructive"
    });
    setConfirmAction(() => () => {
        setPersonalList(prev => prev.filter(p => p.id !== personal.id));
        toast({
            title: "Personal Eliminado",
            description: `${personal.persona.nombre} ${personal.persona.apellidoPaterno} ha sido eliminado.`,
            variant: "destructive"
        });
        setIsConfirmDeleteDialogOpen(false);
        setPersonalToAction(null);
    });
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleToggleStatus = (personal: Personal) => {
    setPersonalToAction(personal);
    const newStatus = personal.estado === "Activo" ? "Inactivo" : "Activo";
    setConfirmDialogProps({
        title: `Confirmar Cambio de Estado`,
        description: `¿Estás seguro de que deseas cambiar el estado de ${personal.persona.nombre} ${personal.persona.apellidoPaterno} a ${newStatus}?`,
        confirmButtonText: newStatus === "Activo" ? "Activar" : "Desactivar",
    });
    setConfirmAction(() => () => {
        setPersonalList(prev => prev.map(p => p.id === personal.id ? {...p, estado: newStatus} : p));
        toast({
            title: "Estado Actualizado",
            description: `El estado de ${personal.persona.nombre} ${personal.persona.apellidoPaterno} ha sido cambiado a ${newStatus}.`
        });
        setIsConfirmDeleteDialogOpen(false);
        setPersonalToAction(null);
    });
    setIsConfirmDeleteDialogOpen(true);
  };


const columns: ColumnDef<Personal>[] = [
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
    id: "persona.nombre", // Explicitly set the ID
    accessorKey: "persona.nombre", // Access nested property
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
      const personal = row.original;
      const nombreCompleto = `${personal.persona.nombre} ${personal.persona.apellidoPaterno} ${personal.persona.apellidoMaterno}`;
      return (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={personal.avatarUrl} alt={nombreCompleto} data-ai-hint="person portrait" />
            <AvatarFallback>{personal.persona.nombre.substring(0, 1)}{personal.persona.apellidoPaterno.substring(0,1)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{nombreCompleto}</div>
            <div className="text-xs text-muted-foreground">{personal.persona.tipoDocumento}: {personal.persona.numeroDocumento}</div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => { // Custom filter for full name
        const personal = row.original;
        const nombreCompleto = `${personal.persona.nombre} ${personal.persona.apellidoPaterno} ${personal.persona.apellidoMaterno}`.toLowerCase();
        const numeroDocumento = personal.persona.numeroDocumento.toLowerCase();
        const searchTerm = String(value).toLowerCase();
        return nombreCompleto.includes(searchTerm) || numeroDocumento.includes(searchTerm);
    }
  },
  {
    accessorKey: "persona.telefono",
    header: "Contacto",
    cell: ({ row }) => {
        const personal = row.original;
        return (
            <div>
                <div>{personal.persona.telefono}</div>
                <div className="text-xs text-muted-foreground">{personal.persona.email}</div>
            </div>
        )
    }
  },
  {
    accessorKey: "especialidad",
    header: "Especialidad",
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
      const personal = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(personal.idPersona)}>
              Copiar ID Persona
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openEditModal(personal)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(personal)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(personal)}>
              {personal.estado === "Activo" ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
              {personal.estado === "Activo" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => alert(`Ver detalles de ${personal.persona.nombre}`)}>
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
    { label: "Nombre (A-Z)", value: "persona.nombre_asc" }, // Updated for nested property
    { label: "Nombre (Z-A)", value: "persona.nombre_desc" },
    { label: "Fecha de Ingreso (Más Reciente)", value: "fechaIngreso_desc" },
    { label: "Fecha de Ingreso (Más Antiguo)", value: "fechaIngreso_asc" },
  ];


  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lista de Personal</h1>
        <p className="text-muted-foreground">
          Administra el personal de la clínica.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={personalList}
        searchPlaceholder="Buscar por nombre o DNI..."
        searchColumnId="persona.nombre" 
        statusColumnId="estado"
        statusOptions={statusOptions}
        onAdd={handleOpenAddPersonalFlow}
        addButtonLabel="Añadir Personal"
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
        existingPersonas={mockPersonasData} // Pass mock data here
      />

      <AddPersonalForm
        open={isAddPersonalFormOpen}
        onOpenChange={(isOpen) => {
            setIsAddPersonalFormOpen(isOpen);
            if (!isOpen) {
                setEditingPersonal(null);
                setSelectedPersonaToPreload(null);
                setIsCreatingNewPersonaFlow(false);
            }
        }}
        initialPersonalData={editingPersonal}
        selectedPersonaToPreload={selectedPersonaToPreload}
        isCreatingNewPersonaFlow={isCreatingNewPersonaFlow}
        onStaffSaved={handleSavePersonal}
      />
      {personalToAction && confirmAction && (
        <ConfirmationDialog
            isOpen={isConfirmDeleteDialogOpen}
            onOpenChange={setIsConfirmDeleteDialogOpen}
            onConfirm={confirmAction}
            title={confirmDialogProps.title}
            description={confirmDialogProps.description}
            confirmButtonText={confirmDialogProps.confirmButtonText}
            confirmButtonVariant={confirmDialogProps.confirmButtonVariant}
            isLoading={false} // Assuming no async operation for now
        />
      )}
    </div>
  );
}

