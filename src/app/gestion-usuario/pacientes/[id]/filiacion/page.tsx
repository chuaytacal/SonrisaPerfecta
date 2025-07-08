"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone, ArrowLeft, Edit, Save, X, UserSquare, User, ClipboardList, Megaphone, Search, ArrowUpDown, Settings2 } from 'lucide-react';
// Asegúrate de que EtiquetaPaciente se importa correctamente con su nueva definición
import type { Paciente as PacienteType, Persona, AntecedentesMedicosData, EtiquetaPaciente } from '@/types';
import { format, differenceInYears, parse as parseDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { AddPacienteForm } from '@/components/pacientes/AddPacienteForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResumenPaciente from '@/app/gestion-usuario/pacientes/ResumenPaciente';
import EtiquetasNotasSalud from '@/app/gestion-usuario/pacientes/EtiquetasNotasSalud'; // Corrected path assumption
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface BackendPaciente {
  id: string; // Patient ID
  idPersona: string; // UUID of the associated Persona
  idApoderado?: string; // Optional UUID of the associated Apoderado Persona
  fechaIngreso: string;
  estado: string;
  notas?: string;
  etiquetas?: BackendTag[]; // Ahora son objetos TagResponseDto del backend
  antecedentesMedicosUuid?: string; // UUID for medical antecedents
}

interface BackendPersona {
  uuid: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string; // ISO string
  sexo: string;
  direccion: string;
  telefono: string;
}

interface BackendAntecedentesMedicos {
  uuid: string; // UUID for the antecedent details
  q1_hospitalizado: 'Sí' | 'No';
  q1_porque?: string;
  q1_donde?: string;
  q2_atencionMedica: 'Sí' | 'No';
  q2_porque?: string;
  q2_donde?: string;
  q3_alergico: 'Sí' | 'No';
  q3_cuales?: string;
  q4_hemorragia: 'Sí' | 'No';
  q5_enfermedades: string[];
  q6_otraEnfermedad: 'Sí' | 'No';
  q6_cual?: string;
  q7_medicacionActual: 'Sí' | 'No';
  q7_cual?: string;
  q8_embarazada?: 'Sí' | 'No'; // Only for females
  q8_semanas?: string; // Only for females
  q9_hipertenso: 'Sí' | 'No';
  q10_ultimaConsultaDental?: string;
  q11_motivoConsulta?: string;
}

interface BackendAppointment {
    idCita: string;
    idPaciente: string;
    idDoctor: string;
    start: string; // ISO Date String
    end: string;   // ISO Date String
    title: string;
    estado: string;
    doctor?: BackendPersonal; // Assuming doctor details are nested
}

interface BackendPersonal {
  id: string; // Doctor ID
  persona: BackendPersona;
  // Other doctor fields if any
}

interface BackendTag {
  uuid: string;
  name: string;
}

// --- API Service ---
const API_BASE_URL = 'http://localhost:3001/api'; // Replace with your actual backend URL

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

const getPatientById = async (id: string): Promise<BackendPaciente> => {
  return fetcher<BackendPaciente>(`${API_BASE_URL}/patients/${id}`);
};

const updatePatient = async (id: string, data: Partial<BackendPaciente>): Promise<BackendPaciente> => {
  return fetcher<BackendPaciente>(`${API_BASE_URL}/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

const getPersonByUuid = async (uuid: string): Promise<BackendPersona> => {
  return fetcher<BackendPersona>(`${API_BASE_URL}/staff/person/${uuid}`);
};

const updatePerson = async (uuid: string, data: Partial<BackendPersona>): Promise<BackendPersona> => {
  return fetcher<BackendPersona>(`${API_BASE_URL}/staff/person/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

const createPerson = async (data: Omit<BackendPersona, 'uuid'>): Promise<BackendPersona> => {
  return fetcher<BackendPersona>(`${API_BASE_URL}/staff/person`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const getAntecedentsByUuid = async (uuid: string): Promise<BackendAntecedentesMedicos> => {
  return fetcher<BackendAntecedentesMedicos>(`${API_BASE_URL}/antecedent-patients/by-patient/${uuid}`);
};

const updateAntecedents = async (id: string, data: Partial<BackendAntecedentesMedicos>): Promise<BackendAntecedentesMedicos> => {
  return fetcher<BackendAntecedentesMedicos>(`${API_BASE_URL}/antecedent-patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

const createAntecedents = async (data: BackendAntecedentesMedicos): Promise<BackendAntecedentesMedicos> => {
  return fetcher<BackendAntecedentesMedicos>(`${API_BASE_URL}/antecedent-patients`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const getAllAppointments = async (uuid: string): Promise<BackendAppointment[]> => {
  try {
    return await fetcher<BackendAppointment[]>(`${API_BASE_URL}/appointments/by-patient/${uuid}`);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return []; // gracefully handle "no appointments"
    }
    throw error; // rethrow other errors
  }
};

const getAllTags = async (): Promise<BackendTag[]> => {
  return fetcher<BackendTag[]>(`${API_BASE_URL}/catalog/tags`);
};

const createPatientTag = async (idPaciente: string, idEtiqueta: string): Promise<any> => {
  return fetcher<any>(`${API_BASE_URL}/patient-tags`, {
    method: 'POST',
    body: JSON.stringify({ idPaciente, idEtiqueta }),
  });
};

const emptyAntecedentesMedicosData: AntecedentesMedicosData = {
  q1_hospitalizado: "No",
  q1_porque: "",
  q1_donde: "",
  q2_atencionMedica: "No",
  q2_porque: "",
  q2_donde: "",
  q3_alergico: "No",
  q3_cuales: "",
  q4_hemorragia: "No",
  q5_enfermedades: [],
  q6_otraEnfermedad: "No",
  q6_cual: "",
  q7_medicacionActual: "No",
  q7_cual: "",
  q8_embarazada: "No",
  q8_semanas: "",
  q9_hipertenso: "No",
  q10_ultimaConsultaDental: "",
  q11_motivoConsulta: "",
};

const enfermedadesOptions = [
  "Cardiopatía", "Fiebre Reumática", "Artritis", "Tuberculosis", "Anemia",
  "Epilepsia", "Lesiones cardíacas", "Hepatitis", "Tratamiento psíquico",
  "Marcapasos", "Tratamiento oncológico", "Hipertensión arterial", "Diabetes",
  "Apoplejía", "Accidentes vasculares", "Pérdida de peso"
];

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

const getPatientAppointments = (allAppointments: BackendAppointment[], patientId: string | undefined): Appointment[] => {
  if (!patientId) return [];
  return allAppointments.filter(appt => appt.idPaciente === patientId).map(appt => ({
      id: appt.idCita, // Usamos el idCita directamente
      idPaciente: appt.idPaciente,
      idDoctor: appt.idSpecialist,  // Asegúrate de que idDoctor se derive de idSpecialist
      start: new Date(`${appt.fechaCita}T${appt.horaInicio}`), // Concatenar fecha y horaInicio para obtener un timestamp
      end: new Date(`${appt.fechaCita}T${appt.horaFin}`), // Concatenar fecha y horaFin para obtener un timestamp
      title: appt.appointmentReason.name, // Título basado en el motivo de la cita
      estado: appt.estadoCita,
      doctor: appt.specialist ? { // Si existe especialista, lo mapeamos
          id: appt.specialist.uuid, // Asumiendo que el uuid del especialista está en el campo uuid
          persona: {
            id: appt.specialist.persona.uuid, // Usamos el uuid para el doctor
            nombre: appt.specialist.persona.nombre,  // Nombre del especialista
            apellidoPaterno: appt.specialist.persona.apellidoPaterno,
            apellidoMaterno: appt.specialist.persona.apellidoMaterno,
          }
      } : undefined
}));
};

export default function FiliacionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const patientId = params.id as string;

  const [paciente, setPaciente] = useState<PacienteType | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [apoderado, setApoderado] = useState<Persona | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const [age, setAge] = useState<string | number>('Calculando...');
  const [createdDate, setCreatedDate] = useState<string>('Calculando...');
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [antecedentesForm, setAntecedentesForm] = useState<AntecedentesMedicosData>(emptyAntecedentesMedicosData);
  const [antecedentesUuid, setAntecedentesUuid] = useState<string | null>(null); // To store the UUID for antecedent details
  const [isAddPacienteFormOpen, setIsAddPacienteFormOpen] = useState(false);
  const [allAvailableTags, setAllAvailableTags] = useState<BackendTag[]>([]); // To store all tags from catalog

  // States for EtiquetasNotasSalud to receive as props
  const [displayedNotas, setDisplayedNotas] = useState<string>("Sin notas registradas.");
  // Usa la nueva interfaz EtiquetaPaciente
  const [displayedEtiquetas, setDisplayedEtiquetas] = useState<EtiquetaPaciente[]>([]); 
  const [displayedAlergias, setDisplayedAlergias] = useState<string[]>([]);
  const [displayedEnfermedades, setDisplayedEnfermedades] = useState<string[]>([]);
  
  // New states for the appointments table
  const [appointmentSortConfig, setAppointmentSortConfig] = useState<{ key: keyof Appointment; direction: 'asc' | 'desc' }>({ key: 'start', direction: 'desc' });
  const [appointmentDoctorFilter, setAppointmentDoctorFilter] = useState('all');
  const [appointmentMotiveFilter, setAppointmentMotiveFilter] = useState('');
  const [appointmentColumnVisibility, setAppointmentColumnVisibility] = useState<Record<string, boolean>>({
    start: true,
    doctor: true,
    title: true,
    estado: true,
  });

  const deriveAlergiasFromAntecedentes = (antecedentes?: AntecedentesMedicosData): string[] => {
    if (antecedentes && antecedentes.q3_cuales && antecedentes.q3_alergico === "Sí") {
      return antecedentes.q3_cuales.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const deriveEnfermedadesFromAntecedentes = (antecedentes?: AntecedentesMedicosData): string[] => {
    return antecedentes?.q5_enfermedades || [];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
          const fetchedPaciente = await getPatientById(patientId);
          setPaciente({
              ...fetchedPaciente,
              persona: {} as Persona, // Temporarily set, will be filled by next fetch
              antecedentesMedicos: emptyAntecedentesMedicosData, // Temporarily set 
          });
  
          const allTags = await getAllTags(); // [{ uuid: '...', name: '...' }]
          setAllAvailableTags(allTags); // For Select dropdowns
  
          const allPatientTags = await fetcher<any[]>(`${API_BASE_URL}/patient-tags`);
  
          const thisPatientTags = allPatientTags
            .filter(tag => tag.idPaciente === patientId)
            .map(tagLink => {
              const tagInfo = allTags.find(t => t.uuid === tagLink.idEtiqueta);
              return tagInfo ? { id: tagInfo.uuid, name: tagInfo.name } : null;
            })
            .filter(Boolean); // Remove any nulls
  
          setDisplayedEtiquetas(thisPatientTags as EtiquetaPaciente[]);
  
          const fetchedPersona = await getPersonByUuid(fetchedPaciente.idPersona);
          setPersona({
              id: fetchedPersona.uuid, // Use uuid as local id
              ...fetchedPersona
          });
  
          if (fetchedPaciente.idApoderado) {
              const fetchedApoderado = await getPersonByUuid(fetchedPaciente.idApoderado);
              setApoderado({
                  id: fetchedApoderado.uuid,
                  ...fetchedApoderado
              });
          } else {
              setApoderado(null);
          }
  
          if (fetchedPaciente) {
            console.log("✅ Entering antecedentes fetch block...", fetchedPaciente);
            try{
              const data = await getAntecedentsByUuid(fetchedPaciente.idPaciente);
              const {
                patient,
                createdAt,
                updatedAt,
                idAntecedentePaciente,
                ...cleanedForm
              } = data;
              setAntecedentesForm(cleanedForm);
              setAntecedentesUuid(data.idAntecedentePaciente);
              setDisplayedAlergias(deriveAlergiasFromAntecedentes(data));
              setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(data));
            } catch (error) {
              console.log("No data bro...");
              console.log("Setting empty antecedentes form...:", fetchedPaciente);
              setAntecedentesForm(emptyAntecedentesMedicosData);
              setAntecedentesUuid(null);
              setDisplayedAlergias([]);
              setDisplayedEnfermedades([]);
            }
          } else {
            console.log("No data bro...");
            console.log("Setting empty antecedentes form...:", fetchedPaciente);
            setAntecedentesForm(emptyAntecedentesMedicosData);
            setAntecedentesUuid(null);
            setDisplayedAlergias([]);
            setDisplayedEnfermedades([]);
          }
  
          // Modificado para manejar las citas correctamente con el nuevo formato
          try{
            const fetchedAppointments = await getAllAppointments(patientId);
            console.log("Fetched appointments:", fetchedAppointments);
            setPatientAppointments(getPatientAppointments(fetchedAppointments, patientId));
          }catch (error) {
            const emptyAppointments: BackendAppointment[] = [];
            console.log("Error fetching appointments:", error);
            setPatientAppointments([]); // Set empty appointments if fetch fails
          }
          // const allAppointments = await getAllAppointments(patientId);
          // console.log("All appointments fetched:", allAppointments);
          // setPatientAppointments(getPatientAppointments(allAppointments, patientId));
  
          const tags = await getAllTags();
          setAllAvailableTags(tags);
  
          setDisplayedNotas(fetchedPaciente.notas || "Sin notas registradas.");
          setDisplayedEtiquetas(thisPatientTags as EtiquetaPaciente[]);
  
          const calculatedAge = fetchedPersona.fechaNacimiento ? differenceInYears(new Date(), new Date(fetchedPersona.fechaNacimiento)) : NaN;
          setIsMinor(!isNaN(calculatedAge) && calculatedAge < 18);
          setAge(calculatedAge);
  
          // Mejora en la lógica de parsing de la fecha de ingreso
          try {
              const fetchedDateString = fetchedPaciente.fechaIngreso;
              let parsedDate = new Date(fetchedDateString); // Intenta parsear directamente como ISO 8601
              
              // Fallback si el parseo directo da una fecha inválida (ej. formato yyyy-MM-dd sin hora)
              if (isNaN(parsedDate.getTime()) && fetchedDateString) {
                  parsedDate = parseDate(fetchedDateString, 'yyyy-MM-dd', new Date());
              }
  
              if (!isNaN(parsedDate.getTime())) {
                  setCreatedDate(format(parsedDate, 'dd MMM yyyy', { locale: es }));
              } else {
                  setCreatedDate('Fecha no disponible');
              }
          } catch (error) {
              console.error("Error parsing fechaIngreso:", error);
              setCreatedDate('Fecha no disponible');
          }
  


      } catch (error) {
          console.error("Failed to fetch patient data:", error);
          toast({
            title: "Error",
            description: `No se pudieron cargar los datos del paciente: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive"
          });
          setPaciente(null);
          setPersona(null);
          setApoderado(null);
          setDisplayedNotas("Sin notas registradas.");
          setDisplayedEtiquetas([]);
          setDisplayedAlergias([]);
          setDisplayedEnfermedades([]);
          setAntecedentesForm(emptyAntecedentesMedicosData);
      } finally {
          setLoading(false);
      }
  };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);


  const handleAntecedentesChange = (field: keyof AntecedentesMedicosData, value: string | string[] | boolean) => {
    setAntecedentesForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAntecedentes = async () => {
    const patientUuid = paciente?.idPaciente;

    if (!patientUuid) {
      toast({
        title: "Error",
        description: "ID del paciente no disponible.",
        variant: "destructive",
      });
      return;
    }

    if (!antecedentesUuid) {
      try {
        const createdAntecedents = await createAntecedents({
          idPaciente: patientUuid,
          ...antecedentesForm,
        });

        console.log("Creating antecedentes with uuid:", createdAntecedents.uuid);
        // Save UUID locally so future updates work
        setAntecedentesUuid(createdAntecedents.uuid);

        // Update local state
        setAntecedentesForm(createdAntecedents);
        setDisplayedAlergias(deriveAlergiasFromAntecedentes(createdAntecedents));
        setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(createdAntecedents));

        toast({
          title: "Antecedentes creados",
          description: "Los antecedentes médicos del paciente han sido guardados.",
        });
      } catch (error) {
        console.error("Error al crear antecedentes:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
      return;
    }else {
      try {
        console.log("🧪 Payload before PATCH:", antecedentesForm);
        const {
          patient,
          createdAt,
          updatedAt,
          idAntecedentePaciente,
          idPaciente,
          ...cleanedForm
        } = antecedentesForm;
        console.log("🧪 Payload after cleaning:", cleanedForm);
        console.log("Updating antecedentes with uuid:", antecedentesUuid);
        const updatedAntecedents = await updateAntecedents(antecedentesUuid, cleanedForm);
        console.log("Id antecedentes updated:", antecedentesUuid);
        setAntecedentesForm(updatedAntecedents);
        setDisplayedAlergias(deriveAlergiasFromAntecedentes(updatedAntecedents));
        setDisplayedEnfermedades(deriveEnfermedadesFromAntecedentes(updatedAntecedents));
        toast({
          title: "Antecedentes Actualizados",
          description: "Los antecedentes médicos del paciente han sido guardados.",
          variant: "default"
        });
      } catch (error) {
        console.log("Error al actualizar antecedentes:", antecedentesUuid);
        console.error("Failed to save antecedents:", error);
        toast({
          title: "Error al guardar",
          description: `No se pudieron guardar los antecedentes médicos: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive"
        });
      }
    }
  };
  
  const handleUpdateNotesInDetalles = async (newNotes: string) => {
    if (!paciente) return;
    try {
      const updatedPatient = await updatePatient(paciente.id, { notas: newNotes });
      setPaciente(prev => prev ? { ...prev, notas: updatedPatient.notas } : null);
      setDisplayedNotas(newNotes);
      toast({ title: "Notas Guardadas", description: "Las notas del paciente han sido actualizadas."});
    } catch (error) {
      console.error("Failed to update notes:", error);
      toast({
        title: "Error al guardar notas",
        description: `No se pudieron actualizar las notas: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  };

  const handleAddTagInDetalles = async (newTagText: string): Promise<boolean> => {
    if (!paciente) return false;

    // Ahora `displayedEtiquetas` es un array de objetos { id, name }
    if (displayedEtiquetas.some(tag => tag.name === newTagText)) {
        toast({ title: "Etiqueta Duplicada", description: "Esta etiqueta ya existe para el paciente.", variant: "destructive"});
        return false;
    }

    const foundTag = allAvailableTags.find(tag => tag.name === newTagText);
    let tagId: string;

    if (foundTag) {
        tagId = foundTag.uuid;
    } else {
        // Si la etiqueta no existe en el catálogo, puedes manejarla aquí (crearla si el backend lo permite)
        // Por ahora, si no se encuentra, se mostrará un error.
        toast({ title: "Error", description: `La etiqueta "${newTagText}" no existe en el catálogo de etiquetas.`, variant: "destructive"});
        return false;
    }

    try {
        await createPatientTag(patientId, tagId); 
        // Añade el objeto completo de la etiqueta (con id y name) a displayedEtiquetas
        const updatedTags = [...displayedEtiquetas, { id: tagId, name: newTagText }];
        setDisplayedEtiquetas(updatedTags);
        
        // También actualiza el estado principal del paciente
        setPaciente(prev => prev ? { 
            ...prev, 
            // Asegúrate de que las etiquetas del paciente sean del formato BackendTag si el backend lo espera así
            etiquetas: updatedTags.map(t => ({ uuid: t.id, name: t.name })) 
        } : null);

        toast({ title: "Etiqueta Agregada", description: `Etiqueta "${newTagText}" agregada al paciente.`});
        return true;
    } catch (error) {
        console.error("Failed to add tag:", error);
        toast({
            title: "Error al agregar etiqueta",
            description: `No se pudo agregar la etiqueta: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive"
        });
        return false;
    }
  };

  const handleSavePacienteDetails = async (updatedPacienteFromForm: PacienteType, updatedApoderado?: Persona) => {
    if (!paciente || !persona) return;

    try {
        // Update Persona (patient's personal details)
        const updatedPersonaBackend = await updatePerson(persona.id, { // persona.id is actually uuid
            tipoDocumento: updatedPacienteFromForm.persona.tipoDocumento,
            numeroDocumento: updatedPacienteFromForm.persona.numeroDocumento,
            nombre: updatedPacienteFromForm.persona.nombre,
            apellidoPaterno: updatedPacienteFromForm.persona.apellidoPaterno,
            apellidoMaterno: updatedPacienteFromForm.persona.apellidoMaterno,
            fechaNacimiento: updatedPacienteFromForm.persona.fechaNacimiento,
            sexo: updatedPacienteFromForm.persona.sexo,
            direccion: updatedPacienteFromForm.persona.direccion,
            telefono: updatedPacienteFromForm.persona.telefono,
        });
        setPersona({ id: updatedPersonaBackend.uuid, ...updatedPersonaBackend }); // Update local state

        // Update Apoderado (if exists or updated)
        let newApoderadoUuid: string | undefined = undefined;
        if (updatedApoderado) {
            if (apoderado && apoderado.id) { // Existing apoderado
                const updatedApoderadoBackend = await updatePerson(apoderado.id, { // apoderado.id is actually uuid
                    tipoDocumento: updatedApoderado.tipoDocumento,
                    numeroDocumento: updatedApoderado.numeroDocumento,
                    nombre: updatedApoderado.nombre,
                    apellidoPaterno: updatedApoderado.apellidoPaterno,
                    apellidoMaterno: updatedApoderado.apellidoMaterno,
                    fechaNacimiento: updatedApoderado.fechaNacimiento,
                    sexo: updatedApoderado.sexo,
                    direccion: updatedApoderado.direccion,
                    telefono: updatedApoderado.telefono,
                });
                setApoderado({ id: updatedApoderadoBackend.uuid, ...updatedApoderadoBackend });
                newApoderadoUuid = updatedApoderadoBackend.uuid;
            } else { // New apoderado
                const createdApoderadoBackend = await createPerson({
                    tipoDocumento: updatedApoderado.tipoDocumento,
                    numeroDocumento: updatedApoderado.numeroDocumento,
                    nombre: updatedApoderado.nombre,
                    apellidoPaterno: updatedApoderado.apellidoPaterno,
                    apellidoMaterno: updatedApoderado.apellidoMaterno,
                    fechaNacimiento: updatedApoderado.fechaNacimiento,
                    sexo: updatedApoderado.sexo,
                    direccion: updatedApoderado.direccion,
                    telefono: updatedApoderado.telefono,
                });
                setApoderado({ id: createdApoderadoBackend.uuid, ...createdApoderadoBackend });
                newApoderadoUuid = createdApoderadoBackend.uuid;
            }
        } else {
            setApoderado(null);
        }

        // Update Paciente
        const updatedPatientBackend = await updatePatient(paciente.id, {
            estado: updatedPacienteFromForm.estado,
            fechaIngreso: updatedPacienteFromForm.fechaIngreso,
            idApoderado: newApoderadoUuid || null, // Ensure it's null if no apoderado
            // notas and etiquetas are updated via their own handlers
        }); 
        setPaciente(prev => prev ? { ...prev, ...updatedPatientBackend, persona: updatedPersonaBackend } : null);

        // Re-calculate age and minority status
        const calculatedAge = updatedPersonaBackend.fechaNacimiento
            ? differenceInYears(new Date(), new Date(updatedPersonaBackend.fechaNacimiento))
            : NaN;
        setIsMinor(!isNaN(calculatedAge) && calculatedAge < 18);
        setAge(calculatedAge);

        setIsAddPacienteFormOpen(false);
        toast({
            title: "Paciente Actualizado",
            description: "Los datos del paciente han sido actualizados.",
        });

    } catch (error) {
        console.error("Failed to save patient details:", error);
        toast({
            title: "Error al actualizar paciente",
            description: `No se pudieron actualizar los datos del paciente: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive"
        });
    }
  };

  const appointmentDoctorOptions = useMemo(() => {
    const uniqueDoctors = new Map<string, any>();
    patientAppointments.forEach(appt => {
        if (appt.doctor) {
            uniqueDoctors.set(appt.doctor.id, appt.doctor);
        }
    });
    return [{ value: 'all', label: 'Todos los Doctores' }, ...Array.from(uniqueDoctors.values()).map(d => ({ value: d.id, label: `${d.persona?.nombre || ''} ${d.persona?.apellidoPaterno || ''}` }))];
  }, [patientAppointments]);

  const requestAppointmentSort = (key: keyof Appointment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (appointmentSortConfig.key === key && appointmentSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setAppointmentSortConfig({ key, direction });
  };
  
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...patientAppointments];

    if (appointmentDoctorFilter !== 'all') {
      filtered = filtered.filter(appt => appt.idDoctor === appointmentDoctorFilter);
    }
    if (appointmentMotiveFilter) {
      filtered = filtered.filter(appt =>
        appt.title.toLowerCase().includes(appointmentMotiveFilter.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
        const key = appointmentSortConfig.key;
        const direction = appointmentSortConfig.direction;

        let valA: any;
        let valB: any;

        if (key === 'start') {
            valA = a.start.getTime();
            valB = b.start.getTime();
        } else if (key === 'doctor') {
            valA = `${a.doctor?.persona?.nombre || ''} ${a.doctor?.persona?.apellidoPaterno || ''}`;
            valB = `${b.doctor?.persona?.nombre || ''} ${b.doctor?.persona?.apellidoPaterno || ''}`;
        } else if (key === 'title' || key === 'estado') {
            valA = String(a[key]);
            valB = String(b[key]);
        } else {
            return 0; 
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
            return direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
    });
    return filtered;
  }, [patientAppointments, appointmentDoctorFilter, appointmentMotiveFilter, appointmentSortConfig]);

  const appointmentColumnNames: Record<string, string> = {
    start: 'Fecha y Hora',
    doctor: 'Doctor',
    title: 'Servicio/Motivo',
    estado: 'Estado',
  };
  const visibleAppointmentColumnsCount = Object.values(appointmentColumnVisibility).filter(Boolean).length;


  if (loading) return <div className="flex justify-center items-center h-screen"><p>Cargando datos de filiación...</p></div>;
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

  const renderAntecedentesMedicos = () => (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q1_hospitalizado">1. ¿Hospitalizado últimos años?</Label>
            <Select value={antecedentesForm.q1_hospitalizado || "No"} onValueChange={(val) => handleAntecedentesChange('q1_hospitalizado', val as 'Sí' | 'No')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q1_porque">¿Por qué?</Label><Input id="q1_porque" value={antecedentesForm.q1_porque || ""} onChange={(e) => handleAntecedentesChange('q1_porque', e.target.value)} disabled={antecedentesForm.q1_hospitalizado !== 'Sí'} /></div>
        <div className="md:col-span-3"><Label htmlFor="q1_donde">¿Dónde?</Label><Textarea id="q1_donde" value={antecedentesForm.q1_donde || ""} onChange={(e) => handleAntecedentesChange('q1_donde', e.target.value)} disabled={antecedentesForm.q1_hospitalizado !== 'Sí'} /></div>
      </div>
      <Separator />
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q2_atencionMedica">2. ¿Atención médica últimos años?</Label>
            <Select value={antecedentesForm.q2_atencionMedica || "No"} onValueChange={(val) => handleAntecedentesChange('q2_atencionMedica', val as 'Sí' | 'No')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q2_porque">¿Por qué?</Label><Input id="q2_porque" value={antecedentesForm.q2_porque || ""} onChange={(e) => handleAntecedentesChange('q2_porque', e.target.value)} disabled={antecedentesForm.q2_atencionMedica !== 'Sí'}/></div>
        <div className="md:col-span-3"><Label htmlFor="q2_donde">¿Dónde?</Label><Textarea id="q2_donde" value={antecedentesForm.q2_donde || ""} onChange={(e) => handleAntecedentesChange('q2_donde', e.target.value)} disabled={antecedentesForm.q2_atencionMedica !== 'Sí'}/></div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q3_alergico">3. ¿Alérgico a droga/anestesia/antibiótico?</Label>
            <Select value={antecedentesForm.q3_alergico || "No"} onValueChange={(val) => handleAntecedentesChange('q3_alergico', val as 'Sí' | 'No')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q3_cuales">¿Cuáles?</Label><Input id="q3_cuales" value={antecedentesForm.q3_cuales || ""} onChange={(e) => handleAntecedentesChange('q3_cuales', e.target.value)} placeholder="Ej: Penicilina, Aspirina" disabled={antecedentesForm.q3_alergico !== 'Sí'}/></div>
      </div>
      <Separator />
      <div>
        <Label htmlFor="q4_hemorragia">4. ¿Hemorragia tratada?</Label>
        <Select value={antecedentesForm.q4_hemorragia || "No"} onValueChange={(val) => handleAntecedentesChange('q4_hemorragia', val as 'Sí' | 'No')}>
            <SelectTrigger className="w-full md:w-1/3"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
        </Select>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>5. Si ha tenido alguna de estas enfermedades, márquela:</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
          {enfermedadesOptions.map(enf => (
            <div key={enf} className="flex items-center space-x-2">
              <Checkbox
                id={`enf-${enf.replace(/\s+/g, '-')}`}
                checked={(antecedentesForm.q5_enfermedades || []).includes(enf)}
                onCheckedChange={(checked) => {
                    const currentEnfermedades = antecedentesForm.q5_enfermedades || [];
                    if (checked) {
                        handleAntecedentesChange('q5_enfermedades', [...currentEnfermedades, enf]);
                    } else {
                        handleAntecedentesChange('q5_enfermedades', currentEnfermedades.filter(item => item !== enf));
                    }
                }}
              />
              <Label htmlFor={`enf-${enf.replace(/\s+/g, '-')}`} className="font-normal">{enf}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q6_otraEnfermedad">6. ¿Alguna otra enfermedad?</Label>
             <Select value={antecedentesForm.q6_otraEnfermedad || "No"} onValueChange={(val) => handleAntecedentesChange('q6_otraEnfermedad', val as 'Sí' | 'No')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q6_cual">¿Cuál?</Label><Input id="q6_cual" value={antecedentesForm.q6_cual || ""} onChange={(e) => handleAntecedentesChange('q6_cual', e.target.value)} disabled={antecedentesForm.q6_otraEnfermedad !== 'Sí'}/></div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
            <Label htmlFor="q7_medicacionActual">7. ¿Medicación actualmente?</Label>
            <Select value={antecedentesForm.q7_medicacionActual || "No"} onValueChange={(val) => handleAntecedentesChange('q7_medicacionActual', val as 'Sí' | 'No')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="q7_cual">¿Cuál?</Label><Input id="q7_cual" value={antecedentesForm.q7_cual || ""} onChange={(e) => handleAntecedentesChange('q7_cual', e.target.value)} disabled={antecedentesForm.q7_medicacionActual !== 'Sí'}/></div>
      </div>
      <Separator />
      {persona?.sexo === 'F' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
                <Label htmlFor="q8_embarazada">8. ¿Está embarazada?</Label>
                <Select value={antecedentesForm.q8_embarazada || "No"} onValueChange={(val) => handleAntecedentesChange('q8_embarazada', val as 'Sí' | 'No')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
            </div>
            <div className="md:col-span-2"><Label htmlFor="q8_semanas">¿Cuántas semanas?</Label><Input id="q8_semanas" value={antecedentesForm.q8_semanas || ""} onChange={(e) => handleAntecedentesChange('q8_semanas', e.target.value)} disabled={antecedentesForm.q8_embarazada !== 'Sí'}/></div>
        </div>
        <Separator />
        </>
      )}
      <div>
        <Label htmlFor="q9_hipertenso">9. ¿Hipertenso o presión alta?</Label>
          <Select value={antecedentesForm.q9_hipertenso || "No"} onValueChange={(val) => handleAntecedentesChange('q9_hipertenso', val as 'Sí' | 'No')}>
            <SelectTrigger className="w-full md:w-1/3"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Sí">Sí</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
        </Select>
      </div>
      <Separator />
      <div><Label htmlFor="q10_ultimaConsultaDental">10. Última consulta dental:</Label><Input id="q10_ultimaConsultaDental" value={antecedentesForm.q10_ultimaConsultaDental || ""} onChange={(e) => handleAntecedentesChange('q10_ultimaConsultaDental', e.target.value)} /></div>
      <Separator />
      <div><Label htmlFor="q11_motivoConsulta">11. Motivo actual de la consulta:</Label><Input id="q11_motivoConsulta" value={antecedentesForm.q11_motivoConsulta || ""} onChange={(e) => handleAntecedentesChange('q11_motivoConsulta', e.target.value)} /></div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveAntecedentes}><Save className="mr-2 h-4 w-4"/> Guardar Cambios</Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-background min-h-screen">
      <ResumenPaciente paciente={paciente} persona={persona} onBack={() => router.push('/gestion-usuario/pacientes')} />

      <div className="flex-1">
        <EtiquetasNotasSalud
          etiquetas={displayedEtiquetas}
          notas={displayedNotas}
          alergias={displayedAlergias}
          enfermedades={displayedEnfermedades}
          onSaveNotes={handleUpdateNotesInDetalles}
          onAddTag={handleAddTagInDetalles} // `onAddTag` ahora espera el nombre de la etiqueta
          patientId={patientId}
          />

        <Tabs defaultValue="datosPersonales" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="datosPersonales">Datos Personales</TabsTrigger>
            <TabsTrigger value="antecedentesMedicos">Antecedentes Médicos</TabsTrigger>
            <TabsTrigger value="historialCitas">Historial de Citas</TabsTrigger>
          </TabsList>
          <TabsContent value="datosPersonales">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    Información del Paciente
                </CardTitle>
                <CardDescription>Detalles personales y de contacto del paciente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div><Label className="text-xs text-muted-foreground">Nombres</Label><p className="font-medium">{persona.nombre}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Apellidos</Label><p className="font-medium">{`${persona.apellidoPaterno} ${persona.apellidoMaterno}`}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Tipo Documento</Label><p className="font-medium">{persona.tipoDocumento}</p></div>
                  <div><Label className="text-xs text-muted-foreground">N° Documento</Label><p className="font-medium">{persona.numeroDocumento}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label><p className="font-medium">{persona.fechaNacimiento ? format(new Date(persona.fechaNacimiento), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Sexo</Label><p className="font-medium">{persona.sexo === "M" ? "Masculino" : "Femenino"}</p></div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Teléfono Celular</Label>
                    <p className="font-medium">
                      {(() => {
                          const phone = persona.telefono;
                          if (!phone) return 'N/A';
                          try {
                              const phoneNumber = parsePhoneNumberFromString(phone);
                              if (phoneNumber) {
                                  return <span><span className="text-muted-foreground">{`+${phoneNumber.countryCallingCode}`}</span> {phoneNumber.nationalNumber}</span>
                              }
                          } catch (error) {}
                          return phone;
                      })()}
                    </p>
                  </div>
                  <div><Label className="text-xs text-muted-foreground">Dirección</Label><p className="font-medium">{persona.direccion}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Fecha de Ingreso (Paciente)</Label><p className="font-medium">{format(new Date(persona.createdAt), 'dd-MM-yy')}</p></div>
                  <div><Label className="text-xs text-muted-foreground">N° Historia Clínica</Label><p className="font-medium">{paciente?.id ? paciente.id.substring(paciente.id.length-6).toUpperCase() : 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Estado (Paciente)</Label><div className="font-medium"><Badge variant={paciente.estado === 'Activo' ? 'default' : 'destructive'}>{paciente.estado}</Badge></div></div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="outline" size="sm" onClick={() => setIsAddPacienteFormOpen(true)}><Edit className="mr-1 h-3 w-3"/> Editar Campos</Button>
                </div>
              </CardContent>
            </Card>

            {isMinor && apoderado && (
              <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center"><UserSquare className="mr-2 h-5 w-5 text-primary" />Información del Apoderado</CardTitle>
                    <CardDescription>Detalles personales y de contacto del apoderado.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div><Label className="text-xs text-muted-foreground">Nombres</Label><p className="font-medium">{apoderado.nombre}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Apellidos</Label><p className="font-medium">{`${apoderado.apellidoPaterno} ${apoderado.apellidoMaterno}`}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Tipo Documento</Label><p className="font-medium">{apoderado.tipoDocumento}</p></div>
                      <div><Label className="text-xs text-muted-foreground">N° Documento</Label><p className="font-medium">{apoderado.numeroDocumento}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Fecha de Nacimiento</Label><p className="font-medium">{apoderado.fechaNacimiento ? format(new Date(apoderado.fechaNacimiento), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Sexo</Label><p className="font-medium">{apoderado.sexo === "M" ? "Masculino" : "Femenino"}</p></div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Teléfono Celular</Label>
                        <p className="font-medium">
                          {(() => {
                              const phone = apoderado.telefono;
                              if (!phone) return 'N/A';
                              try {
                                  const phoneNumber = parsePhoneNumberFromString(phone);
                                  if (phoneNumber) {
                                      return <span><span className="text-muted-foreground">{`+${phoneNumber.countryCallingCode}`}</span> {phoneNumber.nationalNumber}</span>
                                  }
                              } catch (error) {}
                              return phone;
                          })()}
                        </p>
                      </div>
                      <div><Label className="text-xs text-muted-foreground">Dirección</Label><p className="font-medium">{apoderado.direccion}</p></div>
                    </div>
                  </CardContent>
              </Card>
            )}
            {isAddPacienteFormOpen && (
                <AddPacienteForm
                    isOpen={isAddPacienteFormOpen}
                    onClose={() => setIsAddPacienteFormOpen(false)}
                    onSave={handleSavePacienteDetails}
                    paciente={paciente}
                    persona={persona}
                    apoderado={apoderado}
                />
            )}
          </TabsContent>
          <TabsContent value="antecedentesMedicos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                  Antecedentes Médicos
                </CardTitle>
                <CardDescription>Historial de salud y respuestas a preguntas médicas relevantes.</CardDescription>
              </CardHeader>
              <CardContent>
                {renderAntecedentesMedicos()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="historialCitas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Megaphone className="mr-2 h-5 w-5 text-primary" />
                  Historial de Citas
                </CardTitle>
                <CardDescription>Todas las citas agendadas y completadas para este paciente.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filtrar por motivo..."
                      value={appointmentMotiveFilter}
                      onChange={(e) => setAppointmentMotiveFilter(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select
                    value={appointmentDoctorFilter}
                    onValueChange={setAppointmentDoctorFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentDoctorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        <Settings2 className="mr-2 h-4 w-4" /> Columnas <span className="ml-2 opacity-50">({visibleAppointmentColumnsCount})</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {Object.entries(appointmentColumnNames).map(([key, value]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          className="capitalize"
                          checked={appointmentColumnVisibility[key]}
                          onCheckedChange={(checked) =>
                            setAppointmentColumnVisibility((prev) => ({ ...prev, [key]: checked }))
                          }
                        >
                          {value}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {filteredAndSortedAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {appointmentColumnVisibility.start && (
                          <TableHead onClick={() => requestAppointmentSort('start')} className="cursor-pointer">
                            Fecha y Hora {appointmentSortConfig.key === 'start' && (appointmentSortConfig.direction === 'asc' ? '▲' : '▼')}
                          </TableHead>
                        )}
                        {appointmentColumnVisibility.doctor && (
                          <TableHead onClick={() => requestAppointmentSort('doctor')} className="cursor-pointer">
                            Doctor {appointmentSortConfig.key === 'doctor' && (appointmentSortConfig.direction === 'asc' ? '▲' : '▼')}
                          </TableHead>
                        )}
                        {appointmentColumnVisibility.title && (
                          <TableHead onClick={() => requestAppointmentSort('title')} className="cursor-pointer">
                            Servicio/Motivo {appointmentSortConfig.key === 'title' && (appointmentSortConfig.direction === 'asc' ? '▲' : '▼')}
                          </TableHead>
                        )}
                        {appointmentColumnVisibility.estado && (
                          <TableHead onClick={() => requestAppointmentSort('estado')} className="cursor-pointer">
                            Estado {appointmentSortConfig.key === 'estado' && (appointmentSortConfig.direction === 'asc' ? '▲' : '▼')}
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          {appointmentColumnVisibility.start && (
                            <TableCell>{format(appointment.start, 'dd MMM yyyy HH:mm', { locale: es })}</TableCell>
                          )}
                          {appointmentColumnVisibility.doctor && (
                            <TableCell>{appointment.doctor?.persona ? `${appointment.doctor.persona.nombre} ${appointment.doctor.persona.apellidoPaterno}` : 'N/A'}</TableCell>
                          )}
                          {appointmentColumnVisibility.title && (
                            <TableCell>{appointment.title}</TableCell>
                          )}
                          {appointmentColumnVisibility.estado && (
                            <TableCell>
                              <Badge variant={appointment.estado === 'Completada' ? 'secondary' : 'outline'}>
                                {appointment.estado}
                              </Badge>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay citas para mostrar.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}