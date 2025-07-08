"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResumenPaciente from "@/app/gestion-usuario/pacientes/ResumenPaciente";
import EtiquetasNotasSalud from "@/app/gestion-usuario/pacientes/EtiquetasNotasSalud";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type {
  DientesMap,
  OdontogramDataItem,
} from "@/components/odontograma/setting";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es, tr } from "date-fns/locale";

import type {
  Persona,
  Paciente as PacienteType,
  EtiquetaPaciente,
  HistorialOdontograma,
} from "@/types";

const API_BASE_URL = 'http://localhost:3001/api';

const OdontogramComponent = dynamic(
  () =>
    import("@/components/odontograma/Odontogram").then((mod) => mod.Odontogram),
  { ssr: false }
);

const fetchPaciente = async (id: string) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("No se pudo cargar el paciente.");
  return res.json();
};

const fetchOdontogramHistory = async (patientId: string) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(
    `${API_BASE_URL}/odontogram-view2/patient/${patientId}/all`,
    {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    }
  );
  if (!res.ok) throw new Error("Error al obtener historial");
  return res.json();
};

const latestOdontogram = async (patientId: string) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(
    `${API_BASE_URL}/odontogram-view2/patient/${patientId}/latest`,
    {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    }
  );
  if (!res.ok) throw new Error("Error al obtener el último odontograma");
  return res.json();
}


const createOdontogram = async (patientId: string) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_URL}/odontogram-view2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ patientId }),
  });
  if (!res.ok) throw new Error("Error al crear odontograma");
  return res.json();
};

type OdontogramType = "Permanente" | "Primaria" | "Historial";

export default function OdontogramaPage() {
  const { id: patientId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [historial, setHistorial] = useState<HistorialOdontograma[]>([]);
  const [dientes, setDientes] = useState<DientesMap>({});
  const [dientesPrimaria, setDientesPrimaria] = useState<DientesMap>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OdontogramType>("Permanente");
  const [isNewConfirmOpen, setIsNewConfirmOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const pacienteData = await fetchPaciente(patientId as string);
        setPaciente(pacienteData);
        setPersona(pacienteData.persona); // persona viene dentro del mismo objeto
        console.log("Paciente cargado:", pacienteData);
        try {
          const historialData = await fetchOdontogramHistory(patientId as string);
          setHistorial(historialData);
          console.log("Historial de odontogramas:", historialData);
          // Cargar el último odontograma si existe
          const latest = await latestOdontogram(patientId as string);
          if (latest.type === "Permanente") {
            setDientes(latest.data[0]);
            setActiveTab("Permanente");
          }else if (latest.type === "Primaria") {
            setDientesPrimaria(latest.data[0]);
            setActiveTab("Primaria");
          }
            
        } catch (error) {
          console.error("Error al cargar historial de odontogramas:", error);
          setHistorial([]);
        }
      } catch {
        console.log("Error al cargar los datos del paciente u odontograma 🦷");
        toast({
          title: "Error",
          description: "No se pudo cargar los datos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (patientId) load();
  }, [patientId, toast]);

  const handleNewOdontogram = async () => {
    try {
      await createOdontogram(patientId as string);
      toast({ title: "Odontograma creado" });
      const updated = await fetchOdontogramHistory(patientId as string);
      setHistorial(updated);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear odontograma",
        variant: "destructive",
      });
    } finally {
      setIsNewConfirmOpen(false);
    }
  };

  const SaveOdontogram = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (activeTab === "Primaria") {
        const response = await fetch(`${API_BASE_URL}/odontogram-view2`, {
          method: "POST", // Or PUT if you're updating — adjust based on backend behavior
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            patientId: patientId,
            data: [dientesPrimaria], 
            type: "Primaria", 
          }),
        });
        console.log("Saving odontogram with data:", {
          patientId: patientId,
          data: [dientesPrimaria],
        });
        if (!response.ok) {
          throw new Error("Error al guardar el odontograma");
        }

        toast({
          title: "Guardado exitosamente",
          description: "El odontograma fue actualizado",
        });

        // Optional: refetch historial if needed
        const updated = await fetchOdontogramHistory(patientId as string);
        setHistorial(updated);
      } else if (activeTab === "Permanente") {
        const response = await fetch(`${API_BASE_URL}/odontogram-view2`, {
          method: "POST", // Or PUT if you're updating — adjust based on backend behavior
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            patientId: patientId,
            data: [dientes], 
            type: "Permanente", 
          }),
        });
        console.log("Saving odontogram with data:", {
          patientId: patientId,
          data: [dientes],
        });
        if (!response.ok) {
          throw new Error("Error al guardar el odontograma");
        }

        toast({
          title: "Guardado exitosamente",
          description: "El odontograma fue actualizado",
        });

        // Optional: refetch historial if needed
        const updated = await fetchOdontogramHistory(patientId as string);
        setHistorial(updated);
      }
    } catch (error) {
      console.error("Error guardando odontograma:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el odontograma",
        variant: "destructive",
      });
    }
  };

  //make a petition to get odontogram data
  const getOdontogramData = async (odontogramId) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE_URL}/odontogram-view2/${odontogramId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("No se pudo cargar el odontograma.");
    //setdientes as res
    const data = await res.json();
    setDientes(data.data[0]);
    setActiveTab("Permanente");
  }

  const getOdontogramPrimariaData = async (odontogramId) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE_URL}/odontogram-view2/${odontogramId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("No se pudo cargar el odontograma.");
    const data = await res.json();
    setDientesPrimaria(data.data[0]);
    setActiveTab("Primaria");
  }

  const columns: ColumnDef<HistorialOdontograma>[] = [
    {
      accessorKey: "createdAt",
      header: "Fecha de Creación",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd MMM yyyy, HH:mm", {
          locale: es,
        }),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          // if row.original.type is "Permanente" then call getOdontogramData else call getOdontogramPrimariaData
          onClick={() =>
            row.original.type === "Permanente"
              ? getOdontogramData(row.original.id)
              : getOdontogramPrimariaData(row.original.id)
          }
        >
          Ver Detalle
        </Button>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );

  if (!paciente || !persona)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">
          Paciente no encontrado
        </h1>
        <p className="text-muted-foreground mb-6">
          Verifica el ID del paciente.
        </p>
        <Button onClick={() => router.push("/gestion-usuario/pacientes")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 bg-background min-h-screen">
        <ResumenPaciente
          paciente={paciente}
          persona={persona}
          onBack={() => router.push("/gestion-usuario/pacientes")}
        />
        <div className="flex-1 space-y-6">
          <EtiquetasNotasSalud
            etiquetas={paciente.etiquetas || []}
            notas={paciente.notas || "Sin notas"}
            alergias={paciente.alergias || []}
            enfermedades={paciente.enfermedades || []}
            onSaveNotes={() => {}}
            onAddTag={() => true}
            patientId={patientId as string}
          />
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Odontograma</CardTitle>
                  <CardDescription>
                    Gestione los hallazgos dentales del paciente.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setIsNewConfirmOpen(true)}>
                    Nuevo Odontograma
                  </Button>
                  <div className="inline-block bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition duration-200 cursor-pointer select-none"
                  onClick={() => SaveOdontogram()}
                  >
                    + Guardar
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as OdontogramType)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="Permanente">Permanente</TabsTrigger>
                  <TabsTrigger value="Primaria">Primaria</TabsTrigger>
                  <TabsTrigger value="Historial">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="Permanente">
                  <OdontogramComponent
                    dientesData={dientes}
                    odontogramType="Permanent"
                    onDientesChange={(newData) => { // aqui un ejemplo de como se guardar correctamente los cambios ya que no sabia como manejarlo de la otra forma     
                      setDientes(newData);
                    }}
                    onOdontogramDataChange={() => {}}
                  />
                </TabsContent>

                <TabsContent value="Primaria">
                  <OdontogramComponent
                    dientesData={dientesPrimaria}
                    odontogramType="Primary"
                    onDientesChange={(newData) => {
                      setDientesPrimaria(newData);
                    }}
                    onOdontogramDataChange={() => {}}
                  />
                </TabsContent>

                <TabsContent value="Historial">
                  <DataTable
                    columns={columns}
                    data={historial}
                    searchPlaceholder="Buscar..."
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isNewConfirmOpen}
        onOpenChange={setIsNewConfirmOpen}
        onConfirm={handleNewOdontogram}
        title="Nuevo Odontograma"
        description="¿Seguro que deseas crear un nuevo odontograma?"
        confirmButtonText="Crear"
      />
    </>
  );
}
