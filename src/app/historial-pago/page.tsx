
"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { Pago, Persona, Personal, Paciente, MetodoPago } from "@/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown, Search } from 'lucide-react';
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface EnhancedPago extends Pago {
  paciente?: Paciente; // Keep optional for now
  doctor?: Personal;
}

export default function HistorialPagosPage() {
  const { toast } = useToast();
  const [pagos, setPagos] = React.useState<EnhancedPago[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'fechaPago', desc: true }
  ]);
  const [doctorFilter, setDoctorFilter] = React.useState('all');
  const [conceptoFilter, setConceptoFilter] = React.useState('');
  const [medioPagoFilter, setMedioPagoFilter] = React.useState('all');

  React.useEffect(() => {
    const fetchPagos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/payments/payment');
        const dataFromApi = response.data;

        const enhancedData: EnhancedPago[] = dataFromApi.map((pago: any): EnhancedPago => ({
          id: pago.uuid,
          fechaPago: new Date(pago.createdAt),
          montoTotal: parseFloat(pago.monto),
          metodoPago: pago.metodoPago,
          tipoComprobante: pago.comprobante,
          descripcion: pago.concepto,
          estado: pago.isActive ? 'activo' : 'desactivo',
          doctorResponsableId: pago.especialista.uuid,
          doctor: {
            id: pago.especialista.uuid,
            idPersona: pago.especialista.persona.uuid,
            fechaIngreso: pago.especialista.fechaIngreso,
            estado: pago.especialista.isActive ? 'Activo' : 'Inactivo',
            persona: {
              id: pago.especialista.persona.uuid,
              tipoDocumento: pago.especialista.persona.tipoDocumento,
              numeroDocumento: pago.especialista.persona.numeroDocumento,
              nombre: pago.especialista.persona.nombre,
              apellidoPaterno: pago.especialista.persona.apellidoPaterno,
              apellidoMaterno: pago.especialista.persona.apellidoMaterno,
              fechaNacimiento: new Date(pago.especialista.persona.fechaNacimiento),
              sexo: pago.especialista.persona.sexo,
              direccion: pago.especialista.persona.direccion,
              telefono: pago.especialista.persona.telefono,
              email: '', // Not provided
            }
          },
          itemsPagados: pago.items.map((item: any) => ({
             idPresupuesto: '', // Not available in this endpoint
             idItem: item.uuid,
             monto: parseFloat(item.montoAbonado),
             concepto: '',
          })),
        }));

        setPagos(enhancedData);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast({
          title: "Error al cargar pagos",
          description: "No se pudo conectar con el servidor.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, [toast]);
  
  const filteredPagos = React.useMemo(() => {
    return pagos.filter(pago => {
        const doctorMatch = doctorFilter === 'all' || pago.doctor?.id === doctorFilter;
        const medioPagoMatch = medioPagoFilter === 'all' || pago.metodoPago === medioPagoFilter;
        const conceptoMatch = !conceptoFilter || pago.descripcion.toLowerCase().includes(conceptoFilter.toLowerCase());
        return doctorMatch && medioPagoMatch && conceptoMatch;
    });
  }, [pagos, doctorFilter, conceptoFilter, medioPagoFilter]);

  const columns: ColumnDef<EnhancedPago>[] = [
    {
      accessorKey: 'id',
      header: 'ID Pago',
      cell: ({ row }) => <div className="font-mono text-xs">#{row.original.id.slice(-6).toUpperCase()}</div>
    },
    {
      accessorKey: 'fechaPago',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Fecha <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(new Date(row.original.fechaPago), 'dd/MM/yyyy')
    },
    {
      id: 'doctor',
      accessorKey: 'doctor.persona.nombre',
      header: 'Doctor',
      cell: ({ row }) => row.original.doctor ? `${row.original.doctor.persona.nombre} ${row.original.doctor.persona.apellidoPaterno}` : 'N/A'
    },
    {
      accessorKey: 'descripcion',
      header: 'Concepto',
      cell: ({ row }) => (
          <div className="max-w-xs whitespace-normal break-words">
              {row.original.descripcion}
          </div>
      )
    },
    {
      accessorKey: 'metodoPago',
      header: 'Medio de Pago'
    },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
            <Badge variant={row.original.estado === 'desactivo' ? 'destructive' : 'default'} className="capitalize">
                {row.original.estado}
            </Badge>
        )
    },
    {
      accessorKey: 'montoTotal',
      header: () => <div className="text-right">Monto</div>,
      cell: ({ row }) => <div className="text-right font-medium">S/ {row.original.montoTotal.toFixed(2)}</div>
    }
  ];

  const doctorOptions = React.useMemo(() => {
    const uniqueDoctors = new Map<string, { value: string, label: string }>();
    pagos.forEach(p => {
      if (p.doctor) {
        uniqueDoctors.set(p.doctor.id, {
          value: p.doctor.id,
          label: `${p.doctor.persona.nombre} ${p.doctor.persona.apellidoPaterno}`
        });
      }
    });
    return [{ value: 'all', label: 'Todos los Doctores' }, ...Array.from(uniqueDoctors.values())];
  }, [pagos]);

  const medioPagoOptions: { value: MetodoPago | 'all', label: string }[] = [
    { value: 'all', label: 'Todos los Medios' },
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Transferencia', label: 'Transferencia' },
    { value: 'Otro', label: 'Otro' },
  ];

  if (loading) {
    return (
        <div className="w-full space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Historial de Pagos</h1>
              <p className="text-muted-foreground">
                Consulta y filtra todos los pagos registrados en la clínica.
              </p>
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-full sm:w-[250px]" />
                    <Skeleton className="h-10 w-full sm:w-[200px]" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Pagos</h1>
        <p className="text-muted-foreground">
          Consulta y filtra todos los pagos registrados en la clínica.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={filteredPagos}
        searchPlaceholder="Buscar por concepto..."
        searchColumnId="descripcion"
        sorting={sorting}
        onSortingChange={setSorting}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
            
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                    <SelectValue placeholder="Filtrar por doctor..." />
                </SelectTrigger>
                <SelectContent>
                    {doctorOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={medioPagoFilter} onValueChange={(val) => setMedioPagoFilter(val as MetodoPago | 'all')}>
                <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                    <SelectValue placeholder="Filtrar por medio..." />
                </SelectTrigger>
                <SelectContent>
                    {medioPagoOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </DataTable>
    </div>
  );
}
