
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { mockPacientesData, mockPresupuestosData, mockPagosData, mockPersonalData } from '@/lib/data';
import type { Paciente as PacienteType, Persona, EtiquetaPaciente, Presupuesto, Pago, Procedimiento } from '@/types';
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetCard } from '@/components/pacientes/BudgetCard';
import { AddServiceSheet } from '@/components/pacientes/AddServiceSheet';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ToothIconCustom = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.36 3.55A2 2 0 0 1 10.77 3h2.46a2 2 0 0 1 1.41.55L17 6h-2.53a2 2 0 0 0-1.64.88L12 8.34l-.83-1.46A2 2 0 0 0 9.53 6H7l2.36-2.45Z"/>
      <path d="M19 10c0 2-2 4-2 4H7s-2-2-2-4a5 5 0 0 1 8-4h2a5 5 0 0 1 4 4Z"/>
      <path d="M17.61 14a5.22 5.22 0 0 1-1.11 1.39 3.82 3.82 0 0 1-2.29.98c-.43.04-.81.18-1.21.22a4 4 0 0 1-2.5-.26 3.8 3.8 0 0 1-2.28-1 5.2 5.2 0 0 1-1.15-1.38"/>
      <path d="M7.25 16.5c.64.92 1.57 1.5 2.58 1.5h4.34c1.01 0 1.94-.58 2.58-1.5"/>
    </svg>
  );

export default function EstadoDeCuentaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Presupuesto | null>(null);


  useEffect(() => {
    refreshBudgetsAndPayments();
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    if (foundPaciente) {
      setPaciente(foundPaciente);
      setPersona(foundPaciente.persona);
    } else {
      setPaciente(null);
      setPersona(null);
    }
    setLoading(false);
  }, [patientId]);

  const refreshBudgetsAndPayments = () => {
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    if (foundPaciente) {
        const sortedBudgets = mockPresupuestosData
            .filter(p => p.idPaciente === patientId)
            .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        setPresupuestos(sortedBudgets);
        setPagos([...mockPagosData.filter(p => p.idPaciente === patientId)].sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()))
    }
  };

  const handleOpenAddSheet = () => {
    setEditingBudget(null);
    setIsSheetOpen(true);
  };
  
  const handleEditBudget = (budget: Presupuesto) => {
    setEditingBudget(budget);
    setIsSheetOpen(true);
  };

  const handleSaveBudget = (data: {
    id?: string;
    items: { id: string, procedimiento: Procedimiento; cantidad: number; montoPagado?: number; }[],
    nombre: string,
    doctorResponsableId: string,
    estado: Presupuesto['estado'],
    nota?: string
  }) => {
    if (!paciente) return;

    if (data.id) { // UPDATE LOGIC
        const budgetIndex = mockPresupuestosData.findIndex(b => b.id === data.id);
        if (budgetIndex === -1) return;

        const originalBudget = mockPresupuestosData[budgetIndex];
        const originalItemIds = new Set(originalBudget.items.map(item => item.id));
        const finalItemIds = new Set(data.items.map(item => item.id));
        const deletedItemIds = [...originalItemIds].filter(id => !finalItemIds.has(id));

        if (deletedItemIds.length > 0) {
            const paymentsToKeep = mockPagosData.filter(pago => 
                !pago.itemsPagados.some(itemPagado => 
                    itemPagado.idPresupuesto === data.id && deletedItemIds.includes(itemPagado.idItem)
                )
            );
            mockPagosData.length = 0;
            Array.prototype.push.apply(mockPagosData, paymentsToKeep);
        }

        const updatedBudget: Presupuesto = {
            ...originalBudget,
            nombre: data.nombre,
            doctorResponsableId: data.doctorResponsableId,
            estado: data.estado,
            nota: data.nota,
            items: data.items,
            montoPagado: data.items.reduce((acc, item) => acc + (item.montoPagado || 0), 0)
        };

        mockPresupuestosData[budgetIndex] = updatedBudget;
        toast({ title: "Presupuesto Actualizado", description: "Los cambios han sido guardados." });

    } else { // CREATE LOGIC
        const newBudget: Presupuesto = {
          id: `presupuesto-${crypto.randomUUID()}`,
          idPaciente: paciente.id,
          nombre: data.nombre || 'Presupuesto sin nombre',
          fechaCreacion: new Date(),
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
    }
    
    setIsSheetOpen(false);
    setEditingBudget(null);
    refreshBudgetsAndPayments();
  };

  const handleDummySaveNotes = (notes: string) => console.log("Save notes (dummy):", notes);
  const handleDummyAddTag = (tag: EtiquetaPaciente): boolean => { console.log("Add tag (dummy):", tag); return true; };

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Cargando estado de cuenta...</p></div>;
  if (!paciente || !persona) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <ToothIconCustom className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Paciente no Encontrado</h1>
        <p className="text-muted-foreground mb-6">No pudimos encontrar los detalles para el paciente solicitado.</p>
        <Button onClick={() => router.push('/gestion-usuario/pacientes')}><ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista</Button>
      </div>
    );
  }

  const displayedAlergias = paciente.antecedentesMedicos?.q3_cuales && paciente.antecedentesMedicos?.q3_alergico === "Sí" ? paciente.antecedentesMedicos.q3_cuales.split(',').map(s => s.trim()).filter(Boolean) : [];
  const displayedEnfermedades = paciente.antecedentesMedicos?.q5_enfermedades || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-background min-h-screen">
      <ResumenPaciente paciente={paciente} persona={persona} onBack={() => router.push('/gestion-usuario/pacientes')} />
      <div className="flex-1">
        <EtiquetasNotasSalud
          etiquetas={paciente.etiquetas || []}
          notas={paciente.notas || "Sin notas registradas."}
          alergias={displayedAlergias}
          enfermedades={displayedEnfermedades}
          onSaveNotes={handleDummySaveNotes}
          onAddTag={handleDummyAddTag}
          patientId={patientId}
        />
        
        <Tabs defaultValue="presupuestos" className="w-full">
            <div className="flex justify-between items-center mb-4">
                <TabsList>
                    <TabsTrigger value="presupuestos">Presupuestos</TabsTrigger>
                    <TabsTrigger value="historial">Historial de pagos</TabsTrigger>
                </TabsList>
                <Button onClick={handleOpenAddSheet}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Servicio
                </Button>
            </div>
            <TabsContent value="presupuestos">
                <div className="space-y-4">
                    {presupuestos.length > 0 ? (
                        presupuestos.map(presupuesto => (
                            <BudgetCard key={presupuesto.id} presupuesto={presupuesto} paciente={paciente} onUpdate={refreshBudgetsAndPayments} onEdit={handleEditBudget}/>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                No hay presupuestos registrados para este paciente.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="historial">
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Pagos</CardTitle>
                        <CardDescription>Lista de todos los pagos registrados para este paciente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Medio de Pago</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagos.length > 0 ? (
                            pagos.map(pago => {
                              const doctor = mockPersonalData.find(d => d.id === pago.doctorResponsableId);
                              return (
                                <TableRow key={pago.id}>
                                  <TableCell>{format(new Date(pago.fechaPago), 'dd/MM/yyyy')}</TableCell>
                                  <TableCell>{doctor ? `${doctor.persona.nombre} ${doctor.persona.apellidoPaterno}` : 'N/A'}</TableCell>
                                  <TableCell>{pago.descripcion}</TableCell>
                                  <TableCell>{pago.metodoPago}</TableCell>
                                  <TableCell className="text-right">S/ {pago.montoTotal.toFixed(2)}</TableCell>
                                </TableRow>
                              )
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center h-24">No hay pagos registrados.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>

      <AddServiceSheet 
        isOpen={isSheetOpen}
        onOpenChange={(open) => {
            if (!open) setEditingBudget(null);
            setIsSheetOpen(open);
        }}
        onSave={handleSaveBudget}
        editingBudget={editingBudget}
      />
    </div>
  );
}
