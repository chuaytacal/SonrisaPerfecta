"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import {
  MoreHorizontal,
  Edit,
  ToggleLeft,
  ToggleRight,
  Eye,
  ArrowUpDown,
  PlusCircle,
} from "lucide-react";
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
import type {
  Persona,
  Paciente,
  HistoriaClinica,
  Presupuesto,
  ItemPresupuesto,
  Specialist,
  Procedure,
} from "@/types";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { AddServiceSheet } from "@/components/pacientes/AddServiceSheet";

export default function PacientesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pacienteList, setPacienteList] = React.useState<Paciente[]>([]);
  const [personasNoPacientes, setPersonasNoPacientes] = React.useState<
    Persona[]
  >([]);
  const [combos, setCombos] = React.useState<{
    specialists: Specialist[];
    procedures: Procedure[];
  }>({ specialists: [], procedures: [] });

  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [sortBy, setSortBy] = React.useState<string>("");

  const [isAddPacienteFormOpen, setIsAddPacienteFormOpen] =
    React.useState(false);
  const [editingPaciente, setEditingPaciente] = React.useState<Paciente | null>(
    null
  );
  const [editingApoderado, setEditingApoderado] =
    React.useState<Persona | null>(null);
  const [selectedPersonaToPreload, setSelectedPersonaToPreload] =
    React.useState<Persona | null>(null);
  const [isCreatingNewPersonaFlow, setIsCreatingNewPersonaFlow] =
    React.useState(false);
  const [isSelectPersonaModalOpen, setIsSelectPersonaModalOpen] =
    React.useState(false);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    React.useState(false);
  const [pacienteToAction, setPacienteToAction] =
    React.useState<Paciente | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<(() => void) | null>(
    null
  );
  const [confirmDialogProps, setConfirmDialogProps] = React.useState<{
    title: string;
    description: string;
    confirmButtonVariant?: "default" | "destructive";
    confirmButtonText?: string;
  }>({
    title: "",
    description: "",
  });

  const [isAddServiceSheetOpen, setIsAddServiceSheetOpen] =
    React.useState(false);
  const [selectedPatientForService, setSelectedPatientForService] =
    React.useState<Paciente | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [patientsRes, patientTagsRes, combosRes, personasRes] =
        await Promise.all([
          fetch("http://localhost:3001/api/patients"),
          fetch("http://localhost:3001/api/patient-tags"),
          fetch("http://localhost:3001/api/payments/budget/combos"),
          fetch("http://localhost:3001/api/staff/person"),
        ]);

      if (!patientsRes.ok || !patientTagsRes.ok || !combosRes.ok) {
        throw new Error("Error al obtener los datos del servidor.");
      }

      const patientsData = await patientsRes.json();
      const patientTagsData = await patientTagsRes.json();
      const combosData = await combosRes.json();
      const personasData = await personasRes.json();

      const tagsMap = new Map<string, string[]>();
      patientTagsData.forEach((pt: any) => {
        if (!tagsMap.has(pt.idPaciente)) {
          tagsMap.set(pt.idPaciente, []);
        }
        tagsMap.get(pt.idPaciente)?.push(pt.tag.name);
      });

      const processedPacientes = patientsData.map((p: any) => ({
        ...p,
        id: p.idPaciente,
        etiquetas: tagsMap.get(p.idPaciente) || [],
      }));

      setPacienteList(processedPacientes);
      setCombos(combosData);

      const pacientePersonaIds = new Set(
        processedPacientes.map((p: Paciente) => p.idPersona)
      );
      setPersonasNoPacientes(
        personasData.filter(
          (persona: Persona) => !pacientePersonaIds.has(persona.uuid)
        )
      );
    } catch (error) {
      toast({
        title: "Error de Conexión",
        description:
          "No se pudo conectar con el servidor. Por favor, inténtelo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    if (sortBy) {
      const [id, order] = sortBy.split("_");
      setSorting([{ id, desc: order === "desc" }]);
    } else {
      setSorting([]);
    }
  }, [sortBy]);

  const handleSavePaciente = async (
    savedPaciente: Paciente,
    apoderado?: Persona
  ) => {
    await fetchData();

    toast({
      title: editingPaciente ? "Paciente Actualizado" : "Paciente Registrado",
      description: `${savedPaciente.persona.nombre} ${
        savedPaciente.persona.apellidoPaterno
      } ha sido ${editingPaciente ? "actualizado" : "registrado"}.`,
    });

    setIsAddPacienteFormOpen(false);
    setEditingPaciente(null);
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

  const handleSaveService = async (data: {
    items: any[];
    nombre: string;
    doctorResponsableId: string;
    estado: Presupuesto["estado"];
    nota?: string;
  }) => {
    if (!selectedPatientForService) return;

    try {
      const budgetHeader = {
        idEspecialista: data.doctorResponsableId,
        nombre: data.nombre,
        nota: data.nota || "",
        estado: data.estado,
      };

      const resHeader = await fetch(
        "http://localhost:3001/api/payments/budget",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(budgetHeader),
        }
      );

      if (!resHeader.ok)
        throw new Error("Error al crear la cabecera del presupuesto.");

      const newBudgetData = await resHeader.json();
      const idPresupuesto = newBudgetData.uuid;

      const budgetItems = {
        items: data.items.map((item) => ({
          idProcedimiento: item.idProcedimiento,
          cantidad: item.cantidad,
          precioUnitario: parseFloat(item.precioUnitario),
          idPresupuesto: idPresupuesto,
        })),
      };

      const resItems = await fetch(
        "http://localhost:3001/api/payments/budget-item",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(budgetItems),
        }
      );

      if (!resItems.ok)
        throw new Error("Error al guardar los ítems del presupuesto.");

      toast({
        title: "Presupuesto Creado",
        description: "El nuevo presupuesto ha sido añadido exitosamente.",
      });

      setIsAddServiceSheetOpen(false);
      setSelectedPatientForService(null);
    } catch (error: any) {
      toast({
        title: "Error al Guardar Presupuesto",
        description: error.message,
        variant: "destructive",
      });
    }
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
    setIsAddPacienteFormOpen(true);
  };

  const handleToggleStatus = (paciente: Paciente) => {
    console.log("Toggling status for", paciente.id);
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
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return <span>{row.index + 1 + pageIndex * pageSize}</span>;
      },
    },
    {
      id: "persona.nombre",
      accessorKey: "persona.nombre",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const paciente = row.original;
        const nombreCompleto = `${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} ${paciente.persona.apellidoMaterno}`;
        return (
          <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={paciente.avatarUrl} alt={nombreCompleto} />
                  <AvatarFallback>
                    {(paciente.persona.nombre?.[0] || '') + (paciente.persona.apellidoPaterno?.[0] || '')}
                  </AvatarFallback>
              </Avatar>
            <div>
              <div className="font-medium">{nombreCompleto}</div>
              <div className="text-xs text-muted-foreground">
                {paciente.persona.tipoDocumento}:{" "}
                {paciente.persona.numeroDocumento}
              </div>
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const paciente = row.original;
        const search =
          `${paciente.persona.nombre} ${paciente.persona.apellidoPaterno} ${paciente.persona.apellidoMaterno} ${paciente.persona.numeroDocumento}`.toLowerCase();
        return search.includes(String(value).toLowerCase());
      },
    },
    {
      accessorKey: "persona.telefono",
      header: "Teléfono",
      cell: ({ row }) => {
        const phone = row.original.persona.telefono;
        if (!phone) return <span>N/A</span>;
        const phoneNumber = parsePhoneNumberFromString(phone, "PE");
        return (
          <span>{phoneNumber ? phoneNumber.formatInternational() : phone}</span>
        );
      },
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
      id: "persona.createdAt",
      accessorKey: "persona.createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Ingreso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.persona.createdAt);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "America/Lima", // Cambio clave aquí
        });
      },
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
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
              <DropdownMenuItem
                onSelect={() => handleOpenAddServiceSheet(paciente)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Servicio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => openEditModal(paciente)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleToggleStatus(paciente)}>
                {paciente.estado === "Activo" ? (
                  <ToggleLeft className="mr-2 h-4 w-4" />
                ) : (
                  <ToggleRight className="mr-2 h-4 w-4" />
                )}
                {paciente.estado === "Activo" ? "Desactivar" : "Activar"}
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
    {
      label: "Fecha de Ingreso (Más Reciente)",
      value: "persona.createdAt_desc",
    },
    { label: "Fecha de Ingreso (Más Antiguo)", value: "persona.createdAt_asc" },
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
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
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
          }
          setIsAddPacienteFormOpen(isOpen);
        }}
        initialPacienteData={editingPaciente}
        selectedPersonaToPreload={selectedPersonaToPreload}
        isCreatingNewPersonaFlow={isCreatingNewPersonaFlow}
        onPacienteSaved={handleSavePaciente}
        pacienteList={pacienteList}
      />

      <AddServiceSheet
        isOpen={isAddServiceSheetOpen}
        onOpenChange={setIsAddServiceSheetOpen}
        onSave={handleSaveService}
        specialists={combos.specialists}
        procedures={combos.procedures}
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
