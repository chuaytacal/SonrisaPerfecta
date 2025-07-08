
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, ToggleLeft, ArrowUpDown } from "lucide-react";
import { AddPersonalForm } from "@/components/personal/AddPersonalForm";
import { SelectPersonaModal } from "@/components/personal/SelectPersonaModal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Persona, Personal } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Home } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";


const fetchPersonalData = async (): Promise<Personal[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/staff/specialist");
    if (!response.ok) {
      throw new Error('Error al obtener los datos del personal');
    }
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.uuid,
      isActive: item.isActive,
      estado: item.isActive ? 'Activo' : 'Inactivo',
      fechaIngreso: item.fechaIngreso,
      rol: item.rol,
      email: item.email,
      usuario: item.user, // Map 'user' from backend to 'usuario' in frontend type
      uuidUser: item.uuidUser,
      persona: item.persona || {
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        tipoDocumento: '',
        numeroDocumento: '',
        telefono: '',
      },
    }));
  } catch (error) {
    console.error("Error al obtener los datos del personal:", error);
    return [];
  }
};


export default function PersonalPage() {
  const [personalList, setPersonalList] = React.useState<Personal[]>([]);
  const [isAddPersonalFormOpen, setIsAddPersonalFormOpen] = React.useState(false);
  const [editingPersonal, setEditingPersonal] = React.useState<Personal | null>(null);
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

  const handleSavePersonal = (savedPersonal: Personal) => {
    const isEditing = !!editingPersonal;
    
    setPersonalList(prevList => 
      isEditing
        ? prevList.map(p => p.id === savedPersonal.id ? savedPersonal : p)
        : [...prevList, savedPersonal]
    );
      
    toast({
      title: `Personal ${isEditing ? 'Actualizado' : 'Registrado'}`,
      description: `${savedPersonal.persona.nombre} ${savedPersonal.persona.apellidoPaterno} ha sido ${isEditing ? 'actualizado' : 'registrado'} exitosamente.`,
    });
      
    setIsAddPersonalFormOpen(false);
    setEditingPersonal(null);
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(false);
  };

  const handleOpenAddPersonalFlow = () => {
    setEditingPersonal(null); 
    setSelectedPersonaToPreload(null);
    setIsCreatingNewPersonaFlow(true);
    setIsAddPersonalFormOpen(true);
  };

  const openEditModal = (personal: Personal) => {
    setEditingPersonal(personal);
    setSelectedPersonaToPreload(personal.persona);
    setIsCreatingNewPersonaFlow(false);
    setIsAddPersonalFormOpen(true);
  };

  const handleToggleStatus = async (personal: Personal) => {
    const newStatus = personal.estado === "Activo" ? "Inactivo" : "Activo";
    const newIsActive = newStatus === "Activo";

    try {
      const response = await fetch(`http://localhost:3001/api/staff/specialist/${personal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newIsActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }
      
      setPersonalList((prevList) =>
        prevList.map((p) =>
          p.id === personal.id ? { ...p, estado: newStatus, isActive: newIsActive } : p
        )
      );
      
      toast({
        title: "Estado Actualizado",
        description: `El estado de ${personal.persona.nombre} ${personal.persona.apellidoPaterno} ha sido cambiado a ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    }
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
      header: () => <div className="text-center">#</div>,
      cell: ({ row, table }) => {
        const rowIndex = row.index;
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return <div className="text-center">{rowIndex + 1 + (pageIndex * pageSize)}</div>;
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
        if (!personal.persona) return <div className="text-muted-foreground">Datos no disponibles</div>;
        
        const nombreCompleto = `${personal.persona.nombre} ${personal.persona.apellidoPaterno} ${personal.persona.apellidoMaterno}`;
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={personal.avatarUrl} alt={nombreCompleto} />
              <AvatarFallback>
                {(personal.persona.nombre?.[0] || '') + (personal.persona.apellidoPaterno?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{nombreCompleto}</div>
              <div className="text-xs text-muted-foreground">
                {personal.persona.tipoDocumento}: {personal.persona.numeroDocumento}
              </div>
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const personal = row.original;
        const search =
          `${personal.persona.nombre} ${personal.persona.apellidoPaterno} ${personal.persona.apellidoMaterno} ${personal.persona.numeroDocumento}`.toLowerCase();
        return search.includes(String(value).toLowerCase());
      },
    },
    {
      accessorKey: "persona.telefono",
      header: "Teléfono",
      cell: ({ row }) => {
        const phone = row.original.persona?.telefono;
        if (!phone) return <span>N/A</span>;
        
        const phoneNumber = parsePhoneNumberFromString('+' + phone);
        if (phoneNumber) {
          return <span>{phoneNumber.formatInternational()}</span>;
        }
        
        return <span>{phone}</span>; 
      }
    },
    {
      id: "rol",
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => {
        const personal = row.original;
        return personal.rol ? <Badge variant="secondary">{personal.rol}</Badge> : <span className="text-xs text-muted-foreground">Sin rol</span>;
      }
    },
    {
      accessorKey: "fechaIngreso",
      header: ({ column }) => (
        <Button variant="ghost" className="w-full justify-center" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Fecha de Ingreso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const fecha = row.original.fechaIngreso;
        if (!fecha) return <div className="text-center">N/A</div>;
        try {
          const date = new Date(fecha + 'T00:00:00');
          const formattedDate = format(date, "dd/MM/yyyy", { locale: es });
          return (
            <div className="text-center">
              {formattedDate}
            </div>
          );
        } catch (error) {
          return <div className="text-center text-destructive">Fecha inválida</div>;
        }
      }
    },
    {
      accessorKey: "estado",
      header: () => <div className="text-center">Estado</div>,
      cell: ({ row }) => {
        const estado = row.original.estado;
        return (
          <div className="text-center">
            <Badge variant={estado === 'Activo' ? "default" : "destructive"}>
              {estado}
            </Badge>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-center">Acciones</div>,
      cell: ({ row }) => {
        const personal = row.original;
        return (
          <div className="text-center">
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
          </div>
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
    <div className="container mx-auto py-8 space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Lista de Personal</h1>
          <p className="text-muted-foreground">Administra el personal de la clínica.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Volver al Inicio
          </Link>
        </Button>
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

      {/* Se deshabilita temporalmente hasta tener el componente real
      <SelectPersonaModal
        isOpen={isSelectPersonaModalOpen}
        onClose={() => setIsSelectPersonaModalOpen(false)}
        onSelectPersona={() => {}}
        onCreateNewPersona={() => {}}
        existingPersonas={[]}
        modalDescription="Busca una persona por DNI o nombre completo para asignarle un rol en el personal, o crea una nueva persona."
        createButtonLabel="Crear Persona y Asignar como Personal"
      />
      */}

      {isAddPersonalFormOpen && (
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
      )}
    </div>
  );
}
