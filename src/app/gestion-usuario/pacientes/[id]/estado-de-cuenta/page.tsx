
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Search, ArrowUpDown, Settings2 } from 'lucide-react';
import { mockPacientesData, mockPresupuestosData, mockPagosData, mockPersonalData, mockHistoriasClinicasData } from '@/lib/data';
import type { Paciente as PacienteType, Persona, EtiquetaPaciente, Presupuesto, Pago, Procedimiento, HistoriaClinica, Personal, MetodoPago } from '@/types';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


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
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaClinica | null>(null);
  const [loading, setLoading] = useState(true);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Presupuesto | null>(null);
  const [summaryTotals, setSummaryTotals] = useState({ pagado: 0, porPagar: 0 });

  // State for payment history filtering and sorting
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [conceptoFilter, setConceptoFilter] = useState('');
  const [medioPagoFilter, setMedioPagoFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Pago; direction: 'asc' | 'desc' }>({ key: 'fechaPago', direction: 'desc' });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
      id: true,
      fechaPago: true,
      doctorResponsableId: true,
      descripcion: true,
      metodoPago: true,
      montoTotal: true,
  });

  const [displayedNotas, setDisplayedNotas] = useState<string>("Sin notas registradas.");
  const [displayedEtiquetas, setDisplayedEtiquetas] = useState<EtiquetaPaciente[]>([]);
  const [displayedAlergias, setDisplayedAlergias] = useState<string[]>([]);
  const [displayedEnfermedades, setDisplayedEnfermedades] = useState<string[]>([]);

  const deriveAlergiasFromAntecedentes = (antecedentes?: PacienteType['antecedentesMedicos']): string[] => {
    if (antecedentes && antecedentes.q3_cuales && antecedentes.q3_alergico === "Sí") {
      return antecedentes.q3_cuales.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const deriveEnfermedadesFromAntecedentes = (antecedentes?: PacienteType['antecedentesMedicos']): string[] => {
    return antecedentes?.q5_enfermedades || [];
  };

  useEffect(() => {
    refreshData();
  }, [patientId]);
  
  const refreshData = () => {
    const foundPaciente = mockPacientesData.find(p => p.id === patientId);
    if (foundPaciente) {
      setPaciente(foundPaciente);
      setPersona(foundPaciente.persona);
      const foundHistoriaClinica = mockHistoriasClinicasData.find(hc => hc.id === foundPaciente.idHistoriaClinica);
      setHistoriaClinica(foundHistoriaClinica || null);
      
      setDisplayedNotas(foundPaciente.notas || "Sin notas registradas.");
      setDisplayedEtiquetas(foundPaciente.etiquetas || []);
      setDisplayedAlergias(deriveAlergiasFromAntecedentes(foundPaciente.antecedentesMedicos));
      setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(foundPaciente.antecedentesMedicos));
      
      if (foundHistoriaClinica) {
        const sortedBudgets = mockPresupuestosData
          .filter(p => p.idHistoriaClinica === foundHistoriaClinica.id)
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        setPresupuestos(sortedBudgets);
        
        const presupuestoIds = sortedBudgets.map(p => p.id);
        const filteredPagos = mockPagosData
            .filter(p => p.itemsPagados.some(ip => presupuestoIds.includes(ip.idPresupuesto)))
            .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
        setPagos(filteredPagos);

        const totalGeneral = sortedBudgets.reduce((acc, presupuesto) => {
            const totalItems = presupuesto.items.reduce((itemAcc, item) => itemAcc + (item.procedimiento.precioBase * item.cantidad), 0);
            return acc + totalItems;
        }, 0);
        const totalAbonado = sortedBudgets.reduce((acc, presupuesto) => acc + presupuesto.montoPagado, 0);
        setSummaryTotals({ pagado: totalAbonado, porPagar: totalGeneral - totalAbonado });

      }
    } else {
      setPaciente(null);
      setPersona(null);
      setHistoriaClinica(null);
      setPresupuestos([]);
      setPagos([]);
      setSummaryTotals({ pagado: 0, porPagar: 0 });
    }
    setLoading(false);
  };
  
  const doctorOptions = useMemo(() => {
    const uniqueDoctors = new Map<string, Personal>();
    pagos.forEach(pago => {
        const doctor = mockPersonalData.find(d => d.id === pago.doctorResponsableId);
        if (doctor) {
            uniqueDoctors.set(doctor.id, doctor);
        }
    });
    return [{ value: 'all', label: 'Todos los Doctores' }, ...Array.from(uniqueDoctors.values()).map(d => ({ value: d.id, label: `${d.persona.nombre} ${d.persona.apellidoPaterno}` }))];
  }, [pagos]);

  const medioPagoOptions = useMemo(() => {
    const uniqueMethods = new Set(pagos.map(p => p.metodoPago));
    return [{ value: 'all', label: 'Todos los Medios' }, ...Array.from(uniqueMethods).map(m => ({ value: m, label: m }))];
  }, [pagos]);

  const requestSort = (key: keyof Pago) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const filteredAndSortedPagos = useMemo(() => {
      let filtered = [...pagos];

      if (doctorFilter !== 'all') {
          filtered = filtered.filter(p => p.doctorResponsableId === doctorFilter);
      }
      if (medioPagoFilter !== 'all') {
          filtered = filtered.filter(p => p.metodoPago === medioPagoFilter);
      }
      if (conceptoFilter) {
          filtered = filtered.filter(p =>
              p.descripcion.toLowerCase().includes(conceptoFilter.toLowerCase())
          );
      }

      filtered.sort((a, b) => {
          const aValue = new Date(a[sortConfig.key as 'fechaPago']).getTime();
          const bValue = new Date(b[sortConfig.key as 'fechaPago']).getTime();
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });

      return filtered;
  }, [pagos, doctorFilter, conceptoFilter, medioPagoFilter, sortConfig]);

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
    if (!paciente || !historiaClinica) return;

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
            estado: 'Creado',
            nota: data.nota,
            items: data.items,
            montoPagado: data.items.reduce((acc, item) => acc + (item.montoPagado || 0), 0)
        };
        
        mockPagosData.forEach(pago => {
            if (pago.itemsPagados.some(itemPagado => itemPagado.idPresupuesto === updatedBudget.id)) {
                pago.doctorResponsableId = updatedBudget.doctorResponsableId!;
            }
        });

        mockPresupuestosData[budgetIndex] = updatedBudget;
        toast({ title: "Presupuesto Actualizado", description: "Los cambios han sido guardados." });

    } else { // CREATE LOGIC
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
    }
    
    setIsSheetOpen(false);
    setEditingBudget(null);
    refreshData();
  };

  const handleUpdateNotes = (newNotes: string) => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1 && paciente) {
        const updatedPatient = { ...paciente, notas: newNotes };
        mockPacientesData[pacienteIndex] = updatedPatient;
        setPaciente(updatedPatient); 
        setDisplayedNotas(newNotes);
        toast({ title: "Notas Guardadas", description: "Las notas del paciente han sido actualizadas."});
    }
  };

  const handleAddTag = (newTag: EtiquetaPaciente): boolean => {
    const pacienteIndex = mockPacientesData.findIndex(p => p.id === patientId);
    if (pacienteIndex > -1 && paciente) {
        if (paciente.etiquetas && paciente.etiquetas.includes(newTag)) {
            toast({ title: "Etiqueta Duplicada", description: "Esta etiqueta ya existe para el paciente.", variant: "destructive"});
            return false;
        }
        const newTags = [...(paciente.etiquetas || []), newTag];
        const updatedPatient = { ...paciente, etiquetas: newTags };
        mockPacientesData[pacienteIndex] = updatedPatient;
        setPaciente(updatedPatient);
        setDisplayedEtiquetas(newTags);
        toast({ title: "Etiqueta Agregada", description: `Etiqueta "${newTag}" agregada al paciente.`});
        return true;
    }
    return false;
  };

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
  
  const columnNames: Record<string, string> = {
    id: 'ID Pago',
    fechaPago: 'Fecha',
    doctorResponsableId: 'Doctor',
    descripcion: 'Concepto',
    metodoPago: 'Medio de Pago',
    montoTotal: 'Monto',
  };
  
  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-background min-h-screen">
      <ResumenPaciente
        paciente={paciente}
        persona={persona}
        onBack={() => router.push('/gestion-usuario/pacientes')}
        totalPagado={summaryTotals.pagado}
        porPagar={summaryTotals.porPagar}
      />
      <div className="flex-1">
        <EtiquetasNotasSalud
          etiquetas={displayedEtiquetas}
          notas={displayedNotas}
          alergias={displayedAlergias}
          enfermedades={displayedEnfermedades}
          onSaveNotes={handleUpdateNotes}
          onAddTag={handleAddTag}
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
                            <BudgetCard key={presupuesto.id} presupuesto={presupuesto} paciente={paciente} onUpdate={refreshData} onEdit={handleEditBudget}/>
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
                       <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                          <div className="relative w-full sm:w-auto flex-grow">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                  placeholder="Buscar por concepto..."
                                  value={conceptoFilter}
                                  onChange={(e) => setConceptoFilter(e.target.value)}
                                  className="pl-8 w-full"
                              />
                          </div>
                          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filtrar por doctor..." /></SelectTrigger>
                              <SelectContent>{doctorOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                          </Select>
                          <Select value={medioPagoFilter} onValueChange={(val) => setMedioPagoFilter(val as MetodoPago | 'all')}>
                              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filtrar por medio..." /></SelectTrigger>
                              <SelectContent>{medioPagoOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                          </Select>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto"><Settings2 className="mr-2 h-4 w-4" /> Columnas</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            {Object.keys(columnVisibility).map((key) => (
                                <DropdownMenuCheckboxItem key={key} className="capitalize" checked={columnVisibility[key]} onCheckedChange={(value) => setColumnVisibility((prev) => ({ ...prev, [key]: !!value }))}>
                                    {columnNames[key]}
                                </DropdownMenuCheckboxItem>
                            ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                       <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {columnVisibility.id && <TableHead>ID Pago</TableHead>}
                                {columnVisibility.fechaPago && (
                                  <TableHead className="w-[150px]">
                                      <Button variant="ghost" onClick={() => requestSort('fechaPago')} className="px-1">
                                          Fecha <ArrowUpDown className="ml-2 h-4 w-4" />
                                      </Button>
                                  </TableHead>
                                )}
                                {columnVisibility.doctorResponsableId && <TableHead>Doctor</TableHead>}
                                {columnVisibility.descripcion && <TableHead>Concepto</TableHead>}
                                {columnVisibility.metodoPago && <TableHead>Medio de Pago</TableHead>}
                                {columnVisibility.montoTotal && <TableHead className="text-right">Monto</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredAndSortedPagos.length > 0 ? (
                                filteredAndSortedPagos.map(pago => {
                                  const doctor = mockPersonalData.find(d => d.id === pago.doctorResponsableId);
                                  return (
                                    <TableRow key={pago.id}>
                                      {columnVisibility.id && <TableCell className="font-mono text-xs">#{pago.id.slice(-6).toUpperCase()}</TableCell>}
                                      {columnVisibility.fechaPago && <TableCell>{format(new Date(pago.fechaPago), 'dd/MM/yyyy')}</TableCell>}
                                      {columnVisibility.doctorResponsableId && <TableCell>{doctor ? `${doctor.persona.nombre} ${doctor.persona.apellidoPaterno}` : 'N/A'}</TableCell>}
                                      {columnVisibility.descripcion && <TableCell>{pago.descripcion}</TableCell>}
                                      {columnVisibility.metodoPago && <TableCell>{pago.metodoPago}</TableCell>}
                                      {columnVisibility.montoTotal && <TableCell className="text-right">S/ {pago.montoTotal.toFixed(2)}</TableCell>}
                                    </TableRow>
                                  )
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={visibleColumnCount} className="text-center h-24">No hay pagos registrados que coincidan con los filtros.</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                       </div>
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

