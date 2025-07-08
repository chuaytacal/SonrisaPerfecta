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
import { es } from "date-fns/locale";

import type {
  Persona,
  Paciente as PacienteType,
  EtiquetaPaciente,
  HistorialOdontograma,
} from "@/types";
import { get } from "http";


const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('authToken'); // Assuming you store your auth token in localStorage
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
};

const OdontogramComponent = dynamic(
  () =>
    import("@/components/odontograma/Odontogram").then((mod) => mod.Odontogram),
  { ssr: false }
);

const fetchPaciente = async (id: string) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`http://localhost:3001/api/patients/${id}`, {
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
    `/api/odontogram-view2/patient/${patientId}/detailed`,
    {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    }
  );
  if (!res.ok) throw new Error("Error al obtener historial");
  return res.json();
};

const createOdontogram = async (patientId: string) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`/api/odontogram-view2`, {
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OdontogramType>("Permanente");
  const [isNewConfirmOpen, setIsNewConfirmOpen] = useState(false);
  const [displayedEtiquetas, setDisplayedEtiquetas] = useState<EtiquetaPaciente[]>([]);
  const [allAvailableTags, setAllAvailableTags] = useState<EtiquetaPaciente[]>([]);

  const API_BASE_URL = "http://localhost:3001/api";

  const getAllTags = async (): Promise<EtiquetaPaciente[]> => {
    return fetcher<EtiquetaPaciente[]>(`${API_BASE_URL}/catalog/tags`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const pacienteData = await fetchPaciente(patientId as string);
        setPaciente(pacienteData);
        setPersona(pacienteData.persona); // persona viene dentro del mismo objeto
        console.log("Fetched paciente:", pacienteData);

        // const historialData = await fetchOdontogramHistory(patientId as string);
        // setHistorial(historialData);

        const tagsCatalog = await getAllTags();
        setAllAvailableTags(tagsCatalog);
        console.log("Fetched all tags:", tagsCatalog);

        const patientTagsRes = await fetch(`${API_BASE_URL}/patient-tags`);
        const patientTagLinks = await patientTagsRes.json();

        const relevantTags = patientTagLinks
          .filter((tag: any) => tag.idPaciente === patientId)
          .map((tag: any) => {
            const tagInfo = tagsCatalog.find((t) => t.uuid === tag.idEtiqueta);
            return tagInfo ? { id: tagInfo.uuid, name: tagInfo.name } : null;
          })
          .filter(Boolean) as EtiquetaPaciente[];

        setDisplayedEtiquetas(relevantTags);

        const historialData = await fetchOdontogramHistory(patientId as string);
        console.log(historialData);

        setHistorial(historialData);
      } catch {
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

  const handleAddTag = async (tagName: string): Promise<boolean> => {
    if (!paciente) return false;

    if (displayedEtiquetas.some(tag => tag.name === tagName)) {
      toast({ title: "Etiqueta duplicada", variant: "destructive" });
      return false;
    }

    const found = allAvailableTags.find(tag => tag.name === tagName);
    if (!found) {
      console.log("Etiquetas: ", allAvailableTags);
      toast({
        title: "Etiqueta no encontrada",
        description: `"${tagName}" no está en el catálogo`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/patient-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          idPaciente: paciente.id,
          idEtiqueta: found.uuid,
        }),
      });

      if (!res.ok) throw new Error("Error al agregar etiqueta");

      setDisplayedEtiquetas((prev) => [...prev, { id: found.uuid, name: found.name }]);
      toast({ title: "Etiqueta agregada" });
      return true;
    } catch (error) {
      toast({
        title: "Error al agregar etiqueta",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };
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
          onClick={() => setActiveTab("Historial")}
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
            etiquetas={displayedEtiquetas || []}
            notas={paciente.notas || "Sin notas"}
            alergias={paciente.alergias || []}
            enfermedades={paciente.enfermedades || []}
            onSaveNotes={() => {}}
            onAddTag={handleAddTag}
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
                <Button onClick={() => setIsNewConfirmOpen(true)}>
                  Nuevo Odontograma
                </Button>
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
                    dientesData={historial[0]?.odontogramaPermanente || {}}
                    odontogramType="Permanent"
                    onDientesChange={(newData) => {
                      const updated = [...historial];
                      if (updated[0])
                        updated[0].odontogramaPermanente = newData;
                      setHistorial(updated);
                    }}
                    onOdontogramDataChange={() => {}}
                  />
                </TabsContent>

                <TabsContent value="Primaria">
                  <OdontogramComponent
                    dientesData={historial[0]?.odontogramaPrimaria || {}}
                    odontogramType="Primary"
                    onDientesChange={(newData) => {
                      const updated = [...historial];
                      if (updated[0]) updated[0].odontogramaPrimaria = newData;
                      setHistorial(updated);
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
