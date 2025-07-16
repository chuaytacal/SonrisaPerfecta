# 🦷 Dental Loayza - Centro Dental Especializado


Sistema de gestión integral para clínicas dentales que incluye administración de pacientes, citas, historiales médicos y más.

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)

## 🛠️ Tecnologías

### Frontend
- **Next.js 15.2.3** - Framework React para producción
- **React 19.1.0** - Biblioteca de UI
- **TypeScript 5.0** - Tipado estático
- **Tailwind CSS 3.4.1** - Framework CSS utilitario
- **shadcn/ui** - Componentes de UI reutilizables

### Backend & APIs
- **Axios** - Cliente HTTP

### Librerías Adicionales
- **React Hook Form** - Gestión de formularios
- **React Big Calendar** - Calendario interactivo
- **Konva & React Konva** - Canvas para odontograma
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos
- **date-fns** - Manipulación de fechas

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git**

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sonrisa-perfecta.git
cd sonrisa-perfecta
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://tu-api.com/api

```

## 🎯 Uso

### Desarrollo Local

```bash
# Modo desarrollo con Turbopack
npm run dev
```

### Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start
```

## 📁 Estructura del Proyecto

```
src/
├── ai/                     # Configuración de IA
│   ├── dev.ts             # Desarrollo con Genkit
│   └── genkit.ts          # Configuración principal
├── app/                   # App Router de Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal
│   ├── globals.css        # Estilos globales
│   ├── administracion/    # Módulo de administración
│   ├── calendario/        # Módulo de calendario
│   ├── catalogo/          # Catálogo de servicios
│   ├── dashboard/         # Panel principal
│   ├── gestion-usuario/   # Gestión de usuarios
│   ├── historial-pago/    # Historial de pagos
│   ├── inventario/        # Gestión de inventario
│   ├── login/             # Autenticación
│   ├── recetas/           # Recetas médicas
│   └── reportes/          # Reportes y analytics
├── components/            # Componentes reutilizables
│   ├── ui/                # Componentes base de UI
│   ├── layout/            # Componentes de layout
│   ├── pacientes/         # Componentes de pacientes
│   ├── personal/          # Componentes de personal
│   ├── calendario/        # Componentes de calendario
│   ├── catalogo/          # Componentes de catálogo
│   └── odontograma/       # Odontograma interactivo
├── hooks/                 # Hooks personalizados
├── lib/                   # Utilidades y configuración
├── types/                 # Definiciones de tipos
└── middleware.ts          # Middleware de Next.js
```

