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
import { MoreHorizontal, Edit, ToggleLeft, ToggleRight, ArrowUpDown } from "lucide-react";
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
import type { Persona, Personal, Usuario } from "@/types";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Función para obtener los datos de personal del backend
const fetchPersonalData = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/personal");
    const data = await response.json();
    return data;  // Asegúrate de que los datos estén en el formato correcto
  } catch (error) {
    console.error("Error al obtener los datos del personal:", error);
    return [];
  }
};

// Función para manejar la actualización de un personal
const savePersonalData = async (personalData: Personal, usuarioData: Usuario) => {
  try {
    const response = await fetch("http://localhost:3001/api/personal", {
      method: "POST", // o 'PUT' si deseas actualizar
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ personal: personalData, usuario: usuarioData }),
    });
    return response.json();
  } catch (error) {
    console.error("Error al guardar los datos del personal:", error);
  }
};

export default function PersonalPage() {
  const [personalList, setPersonalList] = React.useState<Personal[]>([]);
  const [isAddPersonalFormOpen, setIsAddPersonalFormOpen] = React.useState(false);
  const [editingPersonal, setEditingPersonal] = React.useState<Personal | null>(null);
  const [editingUsuario, setEditingUsuario] = React.useState<Usuario | null>(null);
  const [selectedPersonaToPreload, setSelectedPersonaToPreload] = React.useState<Persona | null>(null);
  const [isCreatingNewPersonaFlow, setIsCreatingNewPersonaFlow] = React.useState(false);
  const [isSelectPersonaModalOpen, setIsSelectPersonaModalOpen] = React.useState(false);
  
  const { toast } = useToast();
  const [sortBy, setSortBy] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const personalData = await fetchPersonalData();
      setPersonalList(personalData);
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (sortBy) {
        const [id, order] = sortBy.split('_');
        setSorting([{ id, desc: order === 'desc' }]);
    } else {
        setSorting([]);
    }
  }, [sortBy]);

  const handleSavePersonal = async (savedPersonal: Personal, savedUser: Usuario) => {
    const savedData = await savePersonalData(savedPersonal, savedUser);

    setPersonalList((prevList) => [...prevList, savedData]);
    toast({
      title: editingPersonal ? "Personal Actualizado" : "Personal Registrado",
      description: `${savedPersonal.persona.nombre} ${savedPersonal.persona.apellidoPaterno} ha sido ${editingPersonal ? "actualizado" : "registrado"}.`,
    });
    setIsAddPersonalFormOpen(false);
    setEditingPersonal(null);
    setEditingUsuario(null);
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(false);
  };

  const handleOpenAddPersonalFlow = () => {
    setEditingPersonal(null); 
    setEditingUsuario(null);
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
    if (personal.idUsuario) {
      setEditingUsuario({ id: personal.idUsuario, rol: personal.rol });
    }
    setIsCreatingNewPersonaFlow(false);
    setIsAddPersonalFormOpen(true);
  };

  const handleToggleStatus = (personal: Personal) => {
    const newStatus = personal.estado === "Activo" ? "Inactivo" : "Activo";
    setPersonalList((prevList) =>
      prevList.map((p) =>
        p.id === personal.id ? { ...p, estado: newStatus } : p
      )
    );
    toast({
      title: "Estado Actualizado",
      description: `El estado de ${personal.persona.nombre} ${personal.persona.apellidoPaterno} ha sido cambiado a ${newStatus}.`,
    });
  };

  const columns: ColumnDef<Personal>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todas"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "#",
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
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const personal = row.original;
        const nombreCompleto = `${personal.persona.nombre} ${personal.persona.apellidoPaterno} ${personal.persona.apellidoMaterno}`;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={personal.avatarUrl} alt={nombreCompleto} />
              <AvatarFallback>{personal.persona.nombre[0]}{personal.persona.apellidoPaterno[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{nombreCompleto}</div>
              <div className="text-xs text-muted-foreground">{personal.persona.tipoDocumento}: {personal.persona.numeroDocumento}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "persona.telefono",
      header: "Teléfono",
      cell: ({ row }) => {
        const phone = row.original.persona.telefono;
        return phone ? parsePhoneNumberFromString(phone)?.formatInternational() : "N/A";
      }
    },
    {
      id: "rol",
      header: "Rol",
      cell: ({ row }) => {
        const personal = row.original;
        return personal.rol ? <Badge variant="secondary">{personal.rol}</Badge> : <span className="text-xs text-muted-foreground">Sin rol</span>;
      }
    },
    {
      accessorKey: "fechaIngreso",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Fecha de Ingreso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.original.estado === "Activo";
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {row.original.estado}
          </Badge>
        );
      }
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditModal(personal)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(personal)}><ToggleLeft className="mr-2 h-4 w-4" /> Activar/Desactivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
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
        <p className="text-muted-foreground">Administra el personal de la clínica.</p>
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
        existingPersonas={[]}
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
                setEditingUsuario(null);
                setIsCreatingNewPersonaFlow(false);
            }
        }}
        initialPersonalData={editingPersonal}
        initialUsuarioData={editingUsuario}
        selectedPersonaToPreload={selectedPersonaToPreload}
        isCreatingNewPersonaFlow={isCreatingNewPersonaFlow}
        onStaffSaved={handleSavePersonal}
        personalList={personalList}
      />
    </div>
  );
}
