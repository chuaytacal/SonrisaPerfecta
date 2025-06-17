
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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"; // Import ConfirmationDialog
import { useToast } from "@/hooks/use-toast"; // Import useToast
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export type Personal = {
  id: string;
  avatarUrl?: string;
  nombre: string;
  dni: string;
  contacto: string; // Phone number
  email: string;
  especialidad: string;
  fechaIngreso: string; // "DD/MM/YYYY"
  estado: "Activo" | "Inactivo";
};

const mockPersonalData: Personal[] = [
  {
    id: "1",
    avatarUrl: "https://placehold.co/40x40.png?text=JS",
    nombre: "Joe Schilder",
    dni: "73124568",
    contacto: "+51 943 567 821",
    email: "joe.schilder@example.com",
    especialidad: "Ortodoncia",
    fechaIngreso: "17/02/2023",
    estado: "Inactivo",
  },
  {
    id: "2",
    avatarUrl: "https://placehold.co/40x40.png?text=PV",
    nombre: "Phoebe Venturi",
    dni: "18273645",
    contacto: "+51 981 234 670",
    email: "phoebe.venturi@example.com",
    especialidad: "Endodoncia",
    fechaIngreso: "05/07/2023",
    estado: "Activo",
  },
  {
    id: "3",
    avatarUrl: "https://placehold.co/40x40.png?text=CP",
    nombre: "Caroline Pandolfi",
    dni: "49205873",
    contacto: "+51 967 891 234",
    email: "caroline.pandolfi@example.com",
    especialidad: "Periodoncia",
    fechaIngreso: "11/10/2023",
    estado: "Activo",
  },
  {
    id: "4",
    avatarUrl: "https://placehold.co/40x40.png?text=RM",
    nombre: "Ricardo Marchetti",
    dni: "50938472",
    contacto: "+51 935 648 290",
    email: "ricardo.marchetti@example.com",
    especialidad: "Implantología",
    fechaIngreso: "27/04/2024",
    estado: "Activo",
  },
  {
    id: "5",
    avatarUrl: "https://placehold.co/40x40.png?text=DH",
    nombre: "Dorothy Hussain",
    dni: "63492751",
    contacto: "+51 927 401 356",
    email: "dorothy.hussain@example.com",
    especialidad: "Prostodoncia",
    fechaIngreso: "03/08/2024",
    estado: "Activo",
  },
  {
    id: "6",
    avatarUrl: "https://placehold.co/40x40.png?text=EM",
    nombre: "Eleanor Mann",
    dni: "21073846",
    contacto: "+51 984 123 758",
    email: "eleanor.mann@example.com",
    especialidad: "Odontopediatría",
    fechaIngreso: "18/11/2024",
    estado: "Inactivo",
  },
  {
    id: "7",
    avatarUrl: "https://placehold.co/40x40.png?text=NF",
    nombre: "Nina Francini",
    dni: "85017429",
    contacto: "+51 975 320 461",
    email: "nina.francini@example.com",
    especialidad: "Cirugía",
    fechaIngreso: "22/01/2025",
    estado: "Activo",
  },
  {
    id: "8",
    avatarUrl: "https://placehold.co/40x40.png?text=CM",
    nombre: "Caroline Mallet",
    dni: "76309152",
    contacto: "+51 928 547 103",
    email: "caroline.mallet@example.com",
    especialidad: "Estética Dental",
    fechaIngreso: "09/06/2025",
    estado: "Inactivo",
  },
];


export default function ListaPersonalPage() {
  const [personalList, setPersonalList] = React.useState<Personal[]>(mockPersonalData);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingPersonal, setEditingPersonal] = React.useState<Personal | null>(null);
  const { toast } = useToast();

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false);
  const [personalToAction, setPersonalToAction] = React.useState<Personal | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<(() => void) | null>(null);
  const [confirmDialogProps, setConfirmDialogProps] = React.useState<{title: string, description: string, confirmButtonVariant?: "default" | "destructive", confirmButtonText?: string}>({
    title: "",
    description: ""
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortBy, setSortBy] = React.useState<string>("nombre_asc");


  const handleStaffUpdate = (updatedStaff: Personal) => {
    setPersonalList(prevList =>
      prevList.map(p => p.id === updatedStaff.id ? updatedStaff : p)
    );
    toast({
      title: "Personal Actualizado",
      description: `${updatedStaff.nombre} ha sido actualizado.`,
    });
    setEditingPersonal(null); // Close edit modal which is AddPersonalForm
  };
  
  const handleStaffAdded = (newStaff: Personal) => {
    setPersonalList(prevList => [newStaff, ...prevList]);
    // Toast for adding is handled within AddPersonalForm
    setIsAddModalOpen(false);
  };

  const openEditModal = (personal: Personal) => {
    setEditingPersonal(personal);
    setIsAddModalOpen(true); // AddPersonalForm is used for both add and edit
  };

  const handleDelete = (personal: Personal) => {
    setPersonalToAction(personal);
    setConfirmDialogProps({
        title: "Confirmar Eliminación",
        description: `¿Estás seguro de que deseas eliminar a ${personal.nombre}? Esta acción no se puede deshacer.`,
        confirmButtonText: "Eliminar",
        confirmButtonVariant: "destructive"
    });
    setConfirmAction(() => () => {
        setPersonalList(prev => prev.filter(p => p.id !== personal.id));
        toast({
            title: "Personal Eliminado",
            description: `${personal.nombre} ha sido eliminado.`,
            variant: "destructive"
        });
        setIsConfirmDeleteDialogOpen(false);
    });
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleToggleStatus = (personal: Personal) => {
    setPersonalToAction(personal);
    const newStatus = personal.estado === "Activo" ? "Inactivo" : "Activo";
    setConfirmDialogProps({
        title: `Confirmar Cambio de Estado`,
        description: `¿Estás seguro de que deseas cambiar el estado de ${personal.nombre} a ${newStatus}?`,
        confirmButtonText: newStatus === "Activo" ? "Activar" : "Desactivar",
    });
    setConfirmAction(() => () => {
        setPersonalList(prev => prev.map(p => p.id === personal.id ? {...p, estado: newStatus} : p));
        toast({
            title: "Estado Actualizado",
            description: `El estado de ${personal.nombre} ha sido cambiado a ${newStatus}.`
        });
        setIsConfirmDeleteDialogOpen(false);
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
      const pageSize = table.getState().pagination.pageSize;
      const pageIndex = table.getState().pagination.pageIndex;
      return <span>{pageIndex * pageSize + rowIndex + 1}</span>;
    },
     enableSorting: false,
  },
  {
    accessorKey: "nombre",
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
      return (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={personal.avatarUrl} alt={personal.nombre} data-ai-hint="person portrait" />
            <AvatarFallback>{personal.nombre.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{personal.nombre}</div>
            <div className="text-xs text-muted-foreground">DNI: {personal.dni}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contacto",
    header: "Contacto",
    cell: ({ row }) => {
        const personal = row.original;
        return (
            <div>
                <div>{personal.contacto}</div>
                <div className="text-xs text-muted-foreground">{personal.email}</div>
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(personal.id)}>
              Copiar ID
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
             <DropdownMenuItem onClick={() => alert(`Ver detalles de ${personal.nombre}`)}>
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
    { label: "Nombre (A-Z)", value: "nombre_asc" },
    { label: "Nombre (Z-A)", value: "nombre_desc" },
    { label: "Fecha de Ingreso (Más Reciente)", value: "fechaIngreso_desc" },
    { label: "Fecha de Ingreso (Más Antiguo)", value: "fechaIngreso_asc" },
  ];


  return (
    <div className="space-y-6">
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
        searchColumnId="nombre" 
        statusColumnId="estado"
        statusOptions={statusOptions}
        onAdd={() => {
            setEditingPersonal(null); // Ensure we are in "add" mode
            setIsAddModalOpen(true);
        }}
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
      <AddPersonalForm
        open={isAddModalOpen}
        onOpenChange={(isOpen) => {
            setIsAddModalOpen(isOpen);
            if (!isOpen) setEditingPersonal(null); // Clear editing state when modal closes
        }}
        initialData={editingPersonal}
        onStaffAdded={editingPersonal ? handleStaffUpdate : handleStaffAdded}
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
        />
      )}
    </div>
  );
}
