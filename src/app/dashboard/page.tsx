"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  FileClock,
  FileText,
  FilePlus,
} from "lucide-react";
import {
  mockAppointmentsData,
  mockPacientesData,
  mockPagosData,
  mockPresupuestosData,
} from "@/lib/data";
import {
  isToday,
  isYesterday,
  isThisMonth,
  isSameMonth,
  subMonths,
  subDays,
  format,
  parse,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { AppointmentState } from "@/types/calendar";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
}: any) => {
  if (percent < 0.05) {
    // Don't render for small slices to prevent clutter
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      stroke="black"
      strokeWidth={0.5}
      paintOrder="stroke"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-bold pointer-events-none"
    >
      {`${(percent * 100).toFixed(0)}% (${value})`}
    </text>
  );
};

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // KPI Calculations
  const today = new Date();
  const yesterday = subDays(today, 1);
  const lastMonth = subMonths(today, 1);

  // 1. Citas Hoy
  const citasHoy = mockAppointmentsData.filter(
    (c) => isToday(c.start) && c.estado !== "Cancelada"
  ).length;
  const citasAyer = mockAppointmentsData.filter(
    (c) =>
      isSameMonth(c.start, yesterday) &&
      c.start.getDate() === yesterday.getDate() &&
      c.estado !== "Cancelada"
  ).length;
  const citasHoyChange = (() => {
    if (citasAyer === 0) return citasHoy > 0 ? 100 : 0;
    return Math.round(((citasHoy - citasAyer) / citasAyer) * 100);
  })();

  // 2. Pacientes Activos
  const pacientesActivos = mockPacientesData.filter(
    (p) => p.estado === "Activo"
  ).length;
  const nuevosPacientesEsteMes = mockPacientesData.filter((p) =>
    isThisMonth(parse(p.fechaIngreso, "dd/MM/yyyy", new Date()))
  ).length;

  // 3. Ingresos del Mes
  const ingresosEsteMes = mockPagosData
    .filter((p) => isThisMonth(p.fechaPago) && p.estado === "activo")
    .reduce((sum, pago) => sum + pago.montoTotal, 0);
  const ingresosMesPasado = mockPagosData
    .filter((p) => isSameMonth(p.fechaPago, lastMonth) && p.estado === "activo")
    .reduce((sum, pago) => sum + pago.montoTotal, 0);
  const ingresosChange = (() => {
    if (ingresosMesPasado === 0) return ingresosEsteMes > 0 ? 100 : 0;
    return Math.round(
      ((ingresosEsteMes - ingresosMesPasado) / ingresosMesPasado) * 100
    );
  })();

  // 4. Presupuestos Pendientes
  const presupuestosPendientes = mockPresupuestosData.filter(
    (p) => p.estado === "Creado"
  ).length;

  // 5. Actividad Reciente
  const sortedAppointments = [...mockAppointmentsData].sort(
    (a, b) => b.start.getTime() - a.start.getTime()
  );
  const sortedPagos = [...mockPagosData]
    .filter((p) => p.estado === "activo")
    .sort((a, b) => b.fechaPago.getTime() - a.fechaPago.getTime());
  const sortedPacientes = [...mockPacientesData].sort(
    (a, b) =>
      parse(b.fechaIngreso, "dd/MM/yyyy", new Date()).getTime() -
      parse(a.fechaIngreso, "dd/MM/yyyy", new Date()).getTime()
  );
  const sortedPresupuestos = [...mockPresupuestosData].sort(
    (a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()
  );

  const actividadReciente = [
    ...sortedAppointments
      .slice(0, 5)
      .map((a) => ({ type: "cita", data: a, date: a.start })),
    ...sortedPagos
      .slice(0, 5)
      .map((p) => ({ type: "pago", data: p, date: p.fechaPago })),
    ...sortedPacientes
      .slice(0, 5)
      .map((p) => ({
        type: "paciente",
        data: p,
        date: parse(p.fechaIngreso, "dd/MM/yyyy", new Date()),
      })),
    ...sortedPresupuestos
      .slice(0, 5)
      .map((p) => ({ type: "presupuesto", data: p, date: p.fechaCreacion })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // 6. Citas por Estado (Este Mes)
  const appointmentsThisMonth = mockAppointmentsData.filter((a) =>
    isThisMonth(a.start)
  );
  const appointmentStatusData = appointmentsThisMonth.reduce((acc, curr) => {
    acc[curr.estado] = (acc[curr.estado] || 0) + 1;
    return acc;
  }, {} as Record<AppointmentState, number>);

  const appointmentStatusChartData = Object.entries(appointmentStatusData).map(
    ([name, value]) => ({ name, value })
  );

  const STATUS_COLORS: Record<AppointmentState, string> = {
    pendiente: "#f59e0b", // amber-500
    confirmada: "#5625b3", // purple
    completada: "#16a34a", // green-600
    cancelada: "#dc2626", // red-600
    reprogramada: "#6b7280", // gray-500
  };

  const chartConfig = {
    value: { label: "Citas" },
    ...Object.keys(STATUS_COLORS).reduce((acc, status) => {
      acc[status] = {
        label: status,
        color: STATUS_COLORS[status as AppointmentState],
      };
      return acc;
    }, {} as any),
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Principal
        </h1>
        <p className="text-muted-foreground">
          Resumen general de la actividad de la clínica.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasHoy}</div>
            <p className="text-xs text-muted-foreground">
              {citasHoyChange >= 0
                ? `+${citasHoyChange}%`
                : `${citasHoyChange}%`}{" "}
              desde ayer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes Activos
            </CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pacientesActivos}</div>
            <p className="text-xs text-muted-foreground">
              +{nuevosPacientesEsteMes} nuevos este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Mes
            </CardTitle>
            <DollarSign className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/{" "}
              {ingresosEsteMes.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {ingresosChange >= 0
                ? `+${ingresosChange}%`
                : `${ingresosChange}%`}{" "}
              vs mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Presupuestos Pendientes
            </CardTitle>
            <FileText className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presupuestosPendientes}</div>
            <p className="text-xs text-muted-foreground">En estado "Creado"</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones registradas en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {isClient && actividadReciente.length > 0 ? (
                actividadReciente.map((act, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {act.type === "cita" ? (
                      <FileClock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    ) : act.type === "pago" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : act.type === "paciente" ? (
                      <Users className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    ) : (
                      <FilePlus className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      {act.type === "cita" ? (
                        <>
                          Cita{" "}
                          <span className="font-semibold">
                            {act.data.estado}
                          </span>{" "}
                          para{" "}
                          <span className="font-semibold">
                            {act.data.paciente?.persona.nombre}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {format(act.date, "dd MMM yyyy, HH:mm", {
                              locale: es,
                            })}
                          </p>
                        </>
                      ) : act.type === "pago" ? (
                        <>
                          Pago de{" "}
                          <span className="font-semibold">
                            S/ {act.data.montoTotal.toFixed(2)}
                          </span>{" "}
                          recibido.
                          <p className="text-xs text-muted-foreground">
                            {mockPacientesData.find(
                              (p) =>
                                p.idHistoriaClinica ===
                                mockPresupuestosData.find(
                                  (pr) =>
                                    pr.id ===
                                    act.data.itemsPagados[0]?.idPresupuesto
                                )?.idHistoriaClinica
                            )?.persona.nombre || "Paciente no encontrado"}{" "}
                            - {format(act.date, "dd MMM yyyy", { locale: es })}
                          </p>
                        </>
                      ) : act.type === "paciente" ? (
                        <>
                          Nuevo paciente:{" "}
                          <span className="font-semibold">
                            {act.data.persona.nombre}{" "}
                            {act.data.persona.apellidoPaterno}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Registrado el{" "}
                            {format(act.date, "dd MMM yyyy", { locale: es })}
                          </p>
                        </>
                      ) : (
                        // presupuesto
                        <>
                          Presupuesto creado para{" "}
                          <span className="font-semibold">
                            {
                              mockPacientesData.find(
                                (p) =>
                                  p.idHistoriaClinica ===
                                  act.data.idHistoriaClinica
                              )?.persona.nombre
                            }
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {format(act.date, "dd MMM yyyy", { locale: es })}
                          </p>
                        </>
                      )}
                    </div>
                  </li>
                ))
              ) : isClient && actividadReciente.length === 0 ? (
                <p className="text-muted-foreground md:col-span-2">
                  No hay actividad reciente.
                </p>
              ) : (
                Array.from({ length: 10 }).map((_, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                    <div className="space-y-1 w-full">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-3/5" />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Citas del Mes por Estado</CardTitle>
            <CardDescription>
              Distribución de los estados de las citas programadas para este
              mes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[250px]">
            {isClient && appointmentStatusChartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={appointmentStatusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {appointmentStatusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name as AppointmentState]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    content={<ChartLegendContent className="flex-wrap" />}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground">
                {isClient
                  ? "No hay datos de citas para este mes."
                  : "Cargando gráfico..."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
