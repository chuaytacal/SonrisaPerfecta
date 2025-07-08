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
  const [actividadReciente, setActividadReciente] = useState<any[]>([]);
  const [kpi, setKpi] = useState({
    conteoCita: 0,
    conteoPaciente: 0,
    conteoIngresos: 0,
    conteoPresupuestos: 0,
  });
  const [citasMes, setCitasMes] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);

    // Fetch KPIs
    fetch("http://localhost:3001/api/dashboard/specialist")
      .then((res) => res.json())
      .then((data) => {
        setKpi({
          conteoCita: data.conteoCita || 23,
          conteoPaciente: data.conteoPaciente || 0,
          conteoIngresos: data.conteoIngresos || 0,
          conteoPresupuestos: data.conteoPresupuestos || 0,
        });
      })
      .catch((err) => console.error("Error al obtener KPIs:", err));

    // Fetch Citas del Mes
    fetch("http://localhost:3001/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        // Filtramos por mes actual
        const citasFiltradas = data.filter((cita: any) =>
          isThisMonth(new Date(cita.fechaCita))
        );
        setCitasMes(citasFiltradas);
      })
      .catch((err) => console.error("Error al obtener citas:", err));
  }, []);

  // KPI Calculations
  const today = new Date();
  const yesterday = subDays(today, 1);
  const lastMonth = subMonths(today, 1);

  // 1. Citas Hoy
  const citasHoy = citasMes.filter(
    (c) => isToday(new Date(c.fechaCita)) && c.estadoCita !== "cancelada"
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
  const pacientesActivos = kpi.conteoPaciente;
  const nuevosPacientesEsteMes = mockPacientesData.filter((p) =>
    isThisMonth(parse(p.fechaIngreso, "dd/MM/yyyy", new Date()))
  ).length;

  // 3. Ingresos del Mes
  const ingresosEsteMes = kpi.conteoIngresos;
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
  const presupuestosPendientes = kpi.conteoPresupuestos;

  // 6. Citas por Estado (Este Mes)
  const appointmentsThisMonth = citasMes;
  const appointmentStatusData = appointmentsThisMonth.reduce((acc, curr) => {
    acc[curr.estadoCita] = (acc[curr.estadoCita] || 0) + 1;
    return acc;
  }, {} as Record<AppointmentState, number>);

  const appointmentStatusChartData = Object.entries(appointmentStatusData).map(
    ([name, value]) => ({ name, value })
  );

  // Fetch Actividad Reciente (solo citas)
  fetch("http://localhost:3001/api/appointments")
    .then((res) => res.json())
    .then((data) => {
      const citasOrdenadas = data
        .sort(
          (a: any, b: any) =>
            new Date(b.fechaCita + "T" + b.horaInicio).getTime() -
            new Date(a.fechaCita + "T" + a.horaInicio).getTime()
        )
        .slice(0, 10)
        .map((cita: any) => ({
          type: "cita",
          data: cita,
          date: new Date(`${cita.fechaCita}T${cita.horaInicio}`),
        }));
      setActividadReciente(citasOrdenadas);
    })
    .catch((err) => console.error("Error al obtener actividad reciente:", err));


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
            <p className="text-xs text-muted-foreground">En estado "Pendiente" o "Creado"</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas citas registradas en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {isClient && actividadReciente.length > 0 ? (
                actividadReciente.map((act, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FileClock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      Cita{" "}
                      <span className="font-semibold">
                        {act.data.estadoCita}
                      </span>{" "}
                      para{" "}
                      <span className="font-semibold">
                        {act.data.paciente?.persona?.nombre || "Paciente"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {format(act.date, "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
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
