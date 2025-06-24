
"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
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
import { MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, ArrowUpDown } from "lucide-react";
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
import type { Persona, Personal } from "@/types";
import { mockPersonasData, mockPersonalData } from "@/lib/data";
import { parsePhoneNumberFromString } from "libphonenumber-js";


export default function PersonalPage() {
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
  const [sortBy, setSortBy] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([])

  React.useEffect(() => {
    if (sortBy) {
        const [id, order] = sortBy.split('_');
        setSorting([{ id, desc: order === 'desc' }]);
    } else {
        setSorting([]);
    }
  }, [sortBy]);

  const personasNoPersonal = React.useMemo(() => {
    const personalPersonaIds = new Set(personalList.map(p => p.idPersona));
    return mockPersonasData.filter(persona => !personalPersonaIds.has(persona.id));
  }, [personalList]);

  const handleSavePersonal = (savedPersonal: Personal) => {
    const personaIndex = mockPersonasData.findIndex(p => p.id === savedPersonal.idPersona);
    if (personaIndex > -1) {
      mockPersonasData[personaIndex] = savedPersonal.persona;
    } else {
      mockPersonasData.push(savedPersonal.persona);
    }
  
    const personalIndex = mockPersonalData.findIndex(p => p.id === savedPersonal.id);
    if (personalIndex > -1) {
      mockPersonalData[personalIndex] = savedPersonal;
    } else {
      mockPersonalData.unshift(savedPersonal);
    }
    
    setPersonalList([...mockPersonalData]);

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
    setEditingPersonal(null); 
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
    setSelectedPersonaToPreload(personal.persona);
    setIsCreatingNewPersonaFlow(false); 
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
    id: '#',
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
    filterFn: (row, id, value) => {
        const personal = row.original;
        const nombreCompleto = `${personal.persona.nombre} ${personal.persona.apellidoPaterno} ${personal.persona.apellidoMaterno}`.toLowerCase();
        const numeroDocumento = personal.persona.numeroDocumento.toLowerCase();
        const searchTerm = String(value).toLowerCase();
        return nombreCompleto.includes(searchTerm) || numeroDocumento.includes(searchTerm);
    }
  },
  {
    accessorKey: "persona.telefono",
    header: "Teléfono",
    cell: ({ row }) => {
        const phone = row.original.persona.telefono;
        if (!phone) return <span>N/A</span>;
        
        try {
            const phoneNumber = parsePhoneNumberFromString(phone);
            if (phoneNumber) {
                const countryCode = `+${phoneNumber.countryCallingCode}`;
                const nationalNumber = phoneNumber.nationalNumber;
                return <span><span className="text-muted-foreground">{countryCode}</span> {nationalNumber}</span>
            }
        } catch (error) {
             // Fallback for any parsing error
        }
        return <span>{phone}</span>;
    }
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
    <div className="w-full space-y-6">
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
        sorting={sorting}
        onSortingChange={setSorting}
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
        existingPersonas={personasNoPersonal}
        modalDescription="Busca una persona por DNI o nombre completo para asignarle un rol en el personal, o crea una nueva persona."
        createButtonLabel="Crear Persona y Asignar como Personal"
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
        personalList={personalList}
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
            isLoading={false}
        />
      )}
    </div>
  );
}
