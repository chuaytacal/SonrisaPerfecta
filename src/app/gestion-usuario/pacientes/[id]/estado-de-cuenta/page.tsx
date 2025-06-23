
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockPacientesData } from '@/lib/data';
import type { Paciente as PacienteType, Persona, EtiquetaPaciente } from '@/types';
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

// Define ToothIconCustom locally for error display
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

// Dummy data for account statement
const statementData = [
    { fecha: '15/05/2024', concepto: 'Consulta Inicial y Limpieza', cargo: 200.00, abono: 0, saldo: 200.00 },
    { fecha: '15/05/2024', concepto: 'Abono inicial', cargo: 0, abono: 100.00, saldo: 100.00 },
    { fecha: '22/05/2024', concepto: 'Resina Compuesta (2 caras) - Diente 16', cargo: 250.00, abono: 0, saldo: 350.00 },
    { fecha: '22/05/2024', concepto: 'Pago tratamiento', cargo: 0, abono: 250.00, saldo: 100.00 },
    { fecha: '05/06/2024', concepto: 'Control Ortodoncia', cargo: 120.00, abono: 120.00, saldo: 100.00 },
];
const totalCargo = statementData.reduce((acc, item) => acc + item.cargo, 0);
const totalAbono = statementData.reduce((acc, item) => acc + item.abono, 0);
const saldoFinal = totalCargo - totalAbono;

export default function EstadoDeCuentaPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Dummy callbacks for EtiquetasNotasSalud as this page is read-only
  const handleDummySaveNotes = (notes: string) => { console.log("Save notes (dummy):", notes); };
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
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-background min-h-screen">
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
                <CardTitle>Estado de Cuenta</CardTitle>
                <CardDescription>Detalle de cargos, abonos y saldos del paciente.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Fecha</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead className="text-right">Cargo (S/)</TableHead>
                                <TableHead className="text-right">Abono (S/)</TableHead>
                                <TableHead className="text-right">Saldo (S/)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statementData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.fecha}</TableCell>
                                    <TableCell className="font-medium">{item.concepto}</TableCell>
                                    <TableCell className="text-right">{item.cargo > 0 ? item.cargo.toFixed(2) : '-'}</TableCell>
                                    <TableCell className="text-right text-green-600">{item.abono > 0 ? item.abono.toFixed(2) : '-'}</TableCell>
                                    <TableCell className="text-right font-medium">{item.saldo.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50">
                                <TableCell colSpan={2} className="font-bold text-right">Totales</TableCell>
                                <TableCell className="text-right font-bold text-destructive">{totalCargo.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-bold text-green-700">{totalAbono.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-bold text-lg text-primary">{saldoFinal.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                 <div className="flex justify-end mt-4">
                    <Button>Exportar PDF</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
