
"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  mockPagosData,
  mockPersonalData,
  mockPacientesData,
  mockPresupuestosData
} from "@/lib/data";
import type { Pago, Persona, Personal, Paciente, MetodoPago } from "@/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown } from 'lucide-react';
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";


interface EnhancedPago extends Pago {
  paciente?: Paciente;
  doctor?: Personal;
}

export default function HistorialPagosPage() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'fechaPago', desc: true }
  ]);
  const [pacienteFilter, setPacienteFilter] = React.useState('all');
  const [doctorFilter, setDoctorFilter] = React.useState('all');
  const [conceptoFilter, setConceptoFilter] = React.useState('');
  const [medioPagoFilter, setMedioPagoFilter] = React.useState('all');


  const enhancedPagos: EnhancedPago[] = React.useMemo(() => {
    return mockPagosData.map(pago => {
      const firstItem = pago.itemsPagados[0];
      let paciente: Paciente | undefined;
      if (firstItem) {
          const presupuesto = mockPresupuestosData.find(p => p.id === firstItem.idPresupuesto);
          if (presupuesto) {
              paciente = mockPacientesData.find(p => p.idHistoriaClinica === presupuesto.idHistoriaClinica);
          }
      }

      return {
        ...pago,
        paciente: paciente,
        doctor: mockPersonalData.find(d => d.id === pago.doctorResponsableId),
      };
    });
  }, []);
  
  const filteredPagos = React.useMemo(() => {
    return enhancedPagos.filter(pago => {
        const pacienteMatch = pacienteFilter === 'all' || pago.paciente?.id === pacienteFilter;
        const doctorMatch = doctorFilter === 'all' || pago.doctor?.id === doctorFilter;
        const medioPagoMatch = medioPagoFilter === 'all' || pago.metodoPago === medioPagoFilter;
        const conceptoMatch = !conceptoFilter || pago.descripcion.toLowerCase().includes(conceptoFilter.toLowerCase());
        return pacienteMatch && doctorMatch && medioPagoMatch && conceptoMatch;
    });
  }, [enhancedPagos, pacienteFilter, doctorFilter, conceptoFilter, medioPagoFilter]);

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
      id: 'paciente',
      accessorKey: 'paciente.persona.nombre',
      header: 'Paciente',
      cell: ({ row }) => row.original.paciente ? `${row.original.paciente.persona.nombre} ${row.original.paciente.persona.apellidoPaterno}` : 'N/A'
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

  const pacienteOptions = React.useMemo(() => [
    { value: 'all', label: 'Todos los Pacientes' },
    ...mockPacientesData.map(p => ({ value: p.id, label: `${p.persona.nombre} ${p.persona.apellidoPaterno}` }))
  ], []);

  const doctorOptions = React.useMemo(() => [
    { value: 'all', label: 'Todos los Doctores' },
    ...mockPersonalData.map(d => ({ value: d.id, label: `${d.persona.nombre} ${d.persona.apellidoPaterno}` }))
  ], []);

  const medioPagoOptions: { value: MetodoPago | 'all', label: string }[] = [
    { value: 'all', label: 'Todos los Medios' },
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Transferencia', label: 'Transferencia' },
    { value: 'Otro', label: 'Otro' },
  ];

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
            <Combobox
                options={pacienteOptions}
                value={pacienteFilter}
                onChange={setPacienteFilter}
                placeholder="Filtrar por paciente..."
                searchPlaceholder="Buscar paciente..."
            />
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
