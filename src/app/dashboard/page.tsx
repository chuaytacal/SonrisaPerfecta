
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Calendar, Users, DollarSign, CheckCircle, FileClock } from "lucide-react";
import { mockAppointmentsData, mockPacientesData, mockPagosData, mockPresupuestosData } from "@/lib/data";
import { isToday, isYesterday, isThisMonth, isSameMonth, subMonths, subDays, format } from "date-fns";
import { es } from "date-fns/locale";

export default function DashboardPage() {

  // KPI Calculations
  const today = new Date();
  const yesterday = subDays(today, 1);
  const lastMonth = subMonths(today, 1);

  // 1. Citas Hoy
  const citasHoy = mockAppointmentsData.filter(c => isToday(c.start)).length;
  const citasAyer = mockAppointmentsData.filter(c => isSameMonth(c.start, yesterday) && c.start.getDate() === yesterday.getDate()).length;
  const citasHoyChange = (() => {
    if (citasAyer === 0) return citasHoy > 0 ? 100 : 0;
    return Math.round(((citasHoy - citasAyer) / citasAyer) * 100);
  })();

  // 2. Pacientes Activos
  const pacientesActivos = mockPacientesData.filter(p => p.estado === 'Activo').length;
  const nuevosPacientesEsteMes = mockPacientesData.filter(p => isThisMonth(new Date(p.fechaIngreso.split('/').reverse().join('-')))).length;

  // 3. Ingresos del Mes
  const ingresosEsteMes = mockPagosData
    .filter(p => isThisMonth(p.fechaPago))
    .reduce((sum, pago) => sum + pago.montoTotal, 0);
  const ingresosMesPasado = mockPagosData
    .filter(p => isSameMonth(p.fechaPago, lastMonth))
    .reduce((sum, pago) => sum + pago.montoTotal, 0);
  const ingresosChange = (() => {
    if (ingresosMesPasado === 0) return ingresosEsteMes > 0 ? 100 : 0;
    return Math.round(((ingresosEsteMes - ingresosMesPasado) / ingresosMesPasado) * 100);
  })();
  
  // 4. Actividad Reciente
  const sortedAppointments = [...mockAppointmentsData].sort((a,b) => b.start.getTime() - a.start.getTime());
  const sortedPagos = [...mockPagosData].sort((a,b) => b.fechaPago.getTime() - a.fechaPago.getTime());
  
  const actividadReciente = [
      ...sortedAppointments.slice(0, 3).map(a => ({ type: 'cita', data: a, date: a.start })),
      ...sortedPagos.slice(0, 3).map(p => ({ type: 'pago', data: p, date: p.fechaPago }))
  ]
  .sort((a,b) => b.date.getTime() - a.date.getTime())
  .slice(0, 5);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard Principal</h1>
      <p className="text-muted-foreground">Resumen general de la actividad de la clínica.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasHoy}</div>
            <p className="text-xs text-muted-foreground">
              {citasHoyChange >= 0 ? `+${citasHoyChange}%` : `${citasHoyChange}%`} desde ayer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pacientesActivos}</div>
            <p className="text-xs text-muted-foreground">+{nuevosPacientesEsteMes} nuevos este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {ingresosEsteMes.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">
              {ingresosChange >= 0 ? `+${ingresosChange}%` : `${ingresosChange}%`} vs mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock Bajo</CardTitle>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Dato estático (sin data)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones registradas en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {actividadReciente.length > 0 ? (
                actividadReciente.map((act, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {act.type === 'cita' ? 
                        <FileClock className="h-5 w-5 text-muted-foreground mt-0.5" /> : 
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                    <div>
                      {act.type === 'cita' ? (
                        <>
                          <span className="font-semibold">{act.data.estado}</span> para <span className="font-semibold">{act.data.paciente?.persona.nombre}</span>
                          <p className="text-xs text-muted-foreground">{format(act.date, "dd MMM yyyy, HH:mm", { locale: es })}</p>
                        </>
                      ) : (
                        <>
                          Pago de <span className="font-semibold">S/ {act.data.montoTotal.toFixed(2)}</span> recibido.
                          <p className="text-xs text-muted-foreground">
                            {mockPacientesData.find(p => p.idHistoriaClinica === mockPresupuestosData.find(pr => pr.id === act.data.itemsPagados[0]?.idPresupuesto)?.idHistoriaClinica)?.persona.nombre || 'Paciente no encontrado'} - {format(act.date, "dd MMM yyyy", { locale: es })}
                          </p>
                        </>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground">No hay actividad reciente.</p>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximas Tareas</CardTitle>
            <CardDescription>Recordatorios y tareas pendientes.</CardDescription>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2 text-sm">
              <li>Contactar a <span className="font-semibold">Maria Luna</span> para confirmar cita.</li>
              <li>Realizar pedido de <span className="font-semibold">guantes de nitrilo</span>.</li>
              <li>Preparar reporte mensual de ingresos.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
