
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Calendar, Users, DollarSign, Award } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, startOfDay, endOfDay, isWithinInterval, format } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Pago, Appointment, Paciente, Personal } from '@/types';
import { mockPagosData, mockAppointmentsData, mockPacientesData, mockPersonalData } from '@/lib/data';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });
  const [doctorFilter, setDoctorFilter] = useState('all');

  const {
    kpis,
    ingresosPorDia,
    distribucionServicios,
    rendimientoPorDoctor
  } = useMemo(() => {
    const from = dateRange?.from ? startOfDay(dateRange.from) : undefined;
    const to = dateRange?.to ? endOfDay(dateRange.to) : undefined;

    if (!from || !to) {
        return { kpis: { totalIngresos: 0, citasAtendidas: 0, nuevosPacientes: 0, servicioPopular: 'N/A' }, ingresosPorDia: [], distribucionServicios: [], rendimientoPorDoctor: [] };
    }
    
    // Filter data based on date range and doctor
    const pagosEnRango: Pago[] = mockPagosData.filter(p => {
        const fechaPago = new Date(p.fechaPago);
        const doctorMatch = doctorFilter === 'all' || p.doctorResponsableId === doctorFilter;
        return isWithinInterval(fechaPago, { start: from, end: to }) && doctorMatch;
    });

    const citasEnRango: Appointment[] = mockAppointmentsData.filter(c => {
        const fechaCita = new Date(c.start);
        const doctorMatch = doctorFilter === 'all' || c.idDoctor === doctorFilter;
        return isWithinInterval(fechaCita, { start: from, end: to });
    });

    const pacientesEnRango: Paciente[] = mockPacientesData.filter(p => {
        const fechaIngreso = new Date(p.fechaIngreso.split('/').reverse().join('-'));
        return isWithinInterval(fechaIngreso, { start: from, end: to });
    });

    // KPI Calculations
    const totalIngresos = pagosEnRango.reduce((sum, pago) => sum + pago.montoTotal, 0);
    const citasAtendidas = citasEnRango.filter(c => c.estado === 'Atendido').length;
    const nuevosPacientes = pacientesEnRango.length;

    // Ingresos por Dia
    const ingresosPorDiaData = pagosEnRango.reduce((acc, pago) => {
        const fecha = format(new Date(pago.fechaPago), 'yyyy-MM-dd');
        acc[fecha] = (acc[fecha] || 0) + pago.montoTotal;
        return acc;
    }, {} as Record<string, number>);

    const ingresosPorDiaArray = Object.entries(ingresosPorDiaData).map(([fecha, total]) => ({
        fecha: format(new Date(fecha), 'dd MMM'),
        Ingresos: total
    })).sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    // Distribucion de Servicios
    const serviciosContador = pagosEnRango.flatMap(p => p.itemsPagados).reduce((acc, item) => {
        acc[item.concepto] = (acc[item.concepto] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const distribucionServiciosArray = Object.entries(serviciosContador).map(([name, value]) => ({
        name,
        value
    })).sort((a,b) => b.value - a.value);

    const servicioPopular = distribucionServiciosArray.length > 0 ? distribucionServiciosArray[0].name : 'N/A';
    
    // Rendimiento por Doctor
    const rendimientoData = mockPersonalData.map(doctor => {
        const pagosDoctor = mockPagosData.filter(p => p.doctorResponsableId === doctor.id && isWithinInterval(new Date(p.fechaPago), { start: from, end: to }));
        const citasDoctor = mockAppointmentsData.filter(c => c.idDoctor === doctor.id && c.estado === 'Atendido' && isWithinInterval(new Date(c.start), { start: from, end: to }));
        
        return {
            id: doctor.id,
            nombre: `${doctor.persona.nombre} ${doctor.persona.apellidoPaterno}`,
            ingresos: pagosDoctor.reduce((sum, p) => sum + p.montoTotal, 0),
            citasAtendidas: citasDoctor.length
        };
    }).filter(d => d.ingresos > 0 || d.citasAtendidas > 0);


    return {
        kpis: { totalIngresos, citasAtendidas, nuevosPacientes, servicioPopular },
        ingresosPorDia: ingresosPorDiaArray,
        distribucionServicios: distribucionServiciosArray,
        rendimientoPorDoctor: rendimientoData,
    };
  }, [dateRange, doctorFilter]);
  
  const doctorOptions = useMemo(() => [
    { value: 'all', label: 'Todos los Doctores' },
    ...mockPersonalData.map(d => ({ value: d.id, label: `${d.persona.nombre} ${d.persona.apellidoPaterno}` }))
  ], []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Reportes y Analíticas</h1>
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Filtrar por doctor..." />
            </SelectTrigger>
            <SelectContent>{doctorOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ingresos</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {kpis.totalIngresos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Atendidas</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.citasAtendidas}</div>
             <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Pacientes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.nuevosPacientes}</div>
             <p className="text-xs text-muted-foreground">Registrados en el período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicio Más Popular</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate" title={kpis.servicioPopular}>{kpis.servicioPopular}</div>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Fecha</CardTitle>
            <CardDescription>Resumen de ingresos diarios en el período seleccionado.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[300px] w-full">
              <RechartsBarChart data={ingresosPorDia}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="fecha" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="Ingresos" fill="hsl(var(--primary))" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Servicios</CardTitle>
            <CardDescription>Servicios más realizados en el período.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <PieChart>
                <Tooltip content={<ChartTooltipContent />} />
                <Pie data={distribucionServicios} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {distribucionServicios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Doctor</CardTitle>
            <CardDescription>Ingresos y citas atendidas por cada doctor en el período seleccionado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-right">Ingresos Generados</TableHead>
                  <TableHead className="text-right">Citas Atendidas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rendimientoPorDoctor.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.nombre}</TableCell>
                    <TableCell className="text-right">S/ {doctor.ingresos.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{doctor.citasAtendidas}</TableCell>
                  </TableRow>
                ))}
                 {rendimientoPorDoctor.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No hay datos de rendimiento para el período y doctor seleccionados.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
