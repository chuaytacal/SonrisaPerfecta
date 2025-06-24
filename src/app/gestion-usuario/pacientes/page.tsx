
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation'; 
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
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
import { MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, Eye, ArrowUpDown, PlusCircle } from "lucide-react";
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
import type { Persona, Paciente, HistoriaClinica, Presupuesto, ItemPresupuesto } from "@/types"; 
import { mockPacientesData, mockPersonasData, mockHistoriasClinicasData, mockPresupuestosData } from "@/lib/data";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { AddServiceSheet } from '@/components/pacientes/AddServiceSheet';


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
  const [sortBy, setSortBy] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([])
  
  const [isAddServiceSheetOpen, setIsAddServiceSheetOpen] = React.useState(false);
  const [selectedPatientForService, setSelectedPatientForService] = React.useState<Paciente | null>(null);


  React.useEffect(() => {
    if (sortBy) {
        const [id, order] = sortBy.split('_');
        setSorting([{ id, desc: order === 'desc' }]);
    } else {
        setSorting([]);
    }
  }, [sortBy]);

  const personasNoPacientes = React.useMemo(() => {
    const pacientePersonaIds = new Set(pacienteList.map(p => p.idPersona));
    return mockPersonasData.filter(persona => !pacientePersonaIds.has(persona.id));
  }, [pacienteList]);

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

    // 3. Create or Update HistoriaClinica
    let historiaClinicaId = savedPaciente.idHistoriaClinica;
    if (!historiaClinicaId) {
        historiaClinicaId = `hc-${crypto.randomUUID()}`;
        savedPaciente.idHistoriaClinica = historiaClinicaId;
    }

    const nuevaHistoriaClinica: HistoriaClinica = {
      id: historiaClinicaId,
      idPaciente: savedPaciente.id,
      idApoderado: apoderado?.id,
    };

    const hcIndex = mockHistoriasClinicasData.findIndex(hc => hc.id === historiaClinicaId);
    if (hcIndex > -1) {
      mockHistoriasClinicasData[hcIndex] = nuevaHistoriaClinica;
    } else {
      mockHistoriasClinicasData.push(nuevaHistoriaClinica);
    }
  
    // 4. Update/Add Paciente in the "DB"
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === savedPaciente.id);
    if (pacienteIndex > -1) {
      mockPacientesData[pacienteIndex] = savedPaciente;
    } else {
      mockPacientesData.unshift(savedPaciente);
    }
  
    // 5. Update local state from the source of truth to force re-render
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
  
  const handleOpenAddServiceSheet = (paciente: Paciente) => {
    setSelectedPatientForService(paciente);
    setIsAddServiceSheetOpen(true);
  };

  const handleSaveService = (data: {
    items: ItemPresupuesto[],
    nombre: string,
    doctorResponsableId: string,
    estado: Presupuesto['estado'],
    nota?: string
  }) => {
    if (!selectedPatientForService) return;
  
    const historiaClinica = mockHistoriasClinicasData.find(hc => hc.id === selectedPatientForService.idHistoriaClinica);
    if (!historiaClinica) {
        toast({ title: "Error", description: "El paciente no tiene una historia clínica asociada.", variant: "destructive" });
        return;
    }
  
    const newBudget: Presupuesto = {
      id: `presupuesto-${crypto.randomUUID()}`,
      idHistoriaClinica: historiaClinica.id,
      nombre: data.nombre || '',
      fechaCreacion: new Date(),
      fechaAtencion: new Date(),
      estado: data.estado,
      montoPagado: 0,
      items: data.items.map(item => ({
        id: `item-${crypto.randomUUID()}`,
        procedimiento: item.procedimiento,
        cantidad: item.cantidad,
        montoPagado: 0,
      })),
      doctorResponsableId: data.doctorResponsableId,
      nota: data.nota,
    };
    mockPresupuestosData.unshift(newBudget);
    toast({ title: "Presupuesto Creado", description: "El nuevo presupuesto ha sido añadido." });
    
    setIsAddServiceSheetOpen(false);
    setSelectedPatientForService(null);
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
    id: "#",
    header: "#",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      return <span>{row.index + 1 + pageIndex * pageSize}</span>
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
            <DropdownMenuItem onSelect={() => handleViewDetails(paciente.id)}>
                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleOpenAddServiceSheet(paciente)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir servicio
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => openEditModal(paciente)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleToggleStatus(paciente)}>
              {paciente.estado === "Activo" ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
              {paciente.estado === "Activo" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleDelete(paciente)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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
        existingPersonas={personasNoPacientes} 
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
        pacienteList={pacienteList}
      />

      <AddServiceSheet 
        isOpen={isAddServiceSheetOpen}
        onOpenChange={setIsAddServiceSheetOpen}
        onSave={handleSaveService}
        // No editingBudget here since we are creating a new one
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
