
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, ArrowUpDown } from 'lucide-react';
import { mockPacientesData, mockAppointmentsData, mockPresupuestosData, mockPersonalData } from '@/lib/data';
import type { Paciente as PacienteType, Persona, EtiquetaPaciente, Personal } from '@/types';
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Define ToothIconCustom locally for error display or import from a shared location if available
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

interface ClinicalHistoryItem {
  fecha: Date;
  doctor?: Personal;
  tratamiento: string;
  notas: string;
  honorarios: number;
}

export default function HistoriaClinicaPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinicalHistory, setClinicalHistory] = useState<ClinicalHistoryItem[]>([]);

  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClinicalHistoryItem; direction: 'asc' | 'desc' }>({ key: 'fecha', direction: 'desc' });

  useEffect(() => {
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
  
  useEffect(() => {
    if (paciente) {
        const historiaClinicaId = paciente.idHistoriaClinica;
        const budgetsForPatient = mockPresupuestosData.filter(p => p.idHistoriaClinica === historiaClinicaId);
        
        const historyItems: ClinicalHistoryItem[] = [];

        budgetsForPatient.forEach(budget => {
            const doctor = mockPersonalData.find(d => d.id === budget.doctorResponsableId);
            budget.items.forEach(item => {
                historyItems.push({
                    fecha: new Date(budget.fechaAtencion),
                    doctor: doctor,
                    tratamiento: item.procedimiento.denominacion,
                    notas: budget.nota || 'Sin notas para este presupuesto.',
                    honorarios: item.procedimiento.precioBase * item.cantidad,
                });
            });
        });
        
        historyItems.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        setClinicalHistory(historyItems);
    }
  }, [paciente]);

  const doctorOptions = useMemo(() => {
    const uniqueDoctors = new Map<string, Personal>();
    clinicalHistory.forEach(item => {
        if (item.doctor) {
            uniqueDoctors.set(item.doctor.id, item.doctor);
        }
    });
    return [{ value: 'all', label: 'Todos los Doctores' }, ...Array.from(uniqueDoctors.values()).map(d => ({ value: d.id, label: `${d.persona.nombre} ${d.persona.apellidoPaterno}` }))];
  }, [clinicalHistory]);

  const requestSort = (key: keyof ClinicalHistoryItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = [...clinicalHistory];

    if (doctorFilter !== 'all') {
        filtered = filtered.filter(item => item.doctor?.id === doctorFilter);
    }

    if (treatmentFilter) {
        filtered = filtered.filter(item =>
            item.tratamiento.toLowerCase().includes(treatmentFilter.toLowerCase())
        );
    }

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [clinicalHistory, doctorFilter, treatmentFilter, sortConfig]);

  // Dummy callbacks for EtiquetasNotasSalud as this is a placeholder page
  const handleDummySaveNotes = (notes: string) => { console.log("Save notes (dummy):", notes); };
  const handleDummyAddTag = (tag: EtiquetaPaciente): boolean => { console.log("Add tag (dummy):", tag); return true; };


  if (loading) return <div className="flex justify-center items-center h-screen"><p>Cargando datos de historia clínica...</p></div>;
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
        <Card>
            <CardHeader>
                <CardTitle>Historia Clínica</CardTitle>
                <CardDescription>Resumen de los procedimientos y tratamientos realizados al paciente.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                  <div className="relative w-full sm:w-auto flex-grow">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                          placeholder="Buscar por tratamiento..."
                          value={treatmentFilter}
                          onChange={(e) => setTreatmentFilter(e.target.value)}
                          className="pl-8 w-full"
                      />
                  </div>
                  <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Filtrar por doctor..." />
                      </SelectTrigger>
                      <SelectContent>
                          {doctorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[150px]">
                                <Button variant="ghost" onClick={() => requestSort('fecha')} className="px-1">
                                  FECHA
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="w-[200px]">DOCTOR</TableHead>
                            <TableHead>TRATAMIENTO</TableHead>
                            <TableHead>NOTAS</TableHead>
                            <TableHead className="text-right w-[120px]">HONORARIOS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedHistory.length > 0 ? (
                            filteredAndSortedHistory.map((item, index) => (
                                <TableRow key={index}>
                                <TableCell>{format(item.fecha, 'dd/MM/yyyy', { locale: es })}</TableCell>
                                <TableCell>{item.doctor ? `${item.doctor.persona.nombre} ${item.doctor.persona.apellidoPaterno}` : 'N/A'}</TableCell>
                                <TableCell className="font-medium">{item.tratamiento}</TableCell>
                                <TableCell className="text-muted-foreground">{item.notas}</TableCell>
                                <TableCell className="text-right font-mono">S/ {item.honorarios.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No se encontraron tratamientos que coincidan con los filtros.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
