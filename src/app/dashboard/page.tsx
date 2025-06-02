import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Calendar, Users, DollarSign } from "lucide-react";

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+5% desde ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">350</div>
            <p className="text-xs text-muted-foreground">+10 nuevos este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 12,500</div>
            <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock Bajo</CardTitle>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Necesitan reabastecimiento</p>
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
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold">Dr. Pérez</span> registró nuevo paciente: Juan Quispe.</li>
              <li>Pago registrado para <span className="font-semibold">Ana Torres</span> (S/ 150).</li>
              <li>Producto <span className="font-semibold">'Resina Compuesta A2'</span> bajo en stock.</li>
              <li>Cita confirmada para <span className="font-semibold">Carlos Vega</span> - 10:00 AM.</li>
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
