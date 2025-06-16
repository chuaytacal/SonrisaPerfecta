import Link from 'next/link';
import Image from 'next/image'; // Usamos el componente Image de Next.js para optimizar la carga de imágenes
import logo from './assets/logo.png'; // Importamos la imagen desde la carpeta 'assets'

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center space-x-2">
      {/* Imagen del logo */}
      <Image 
        src={logo} // Usamos la imagen importada
        alt="Centro Dental Especializado Loayza" 
        className="h-10 w-auto" // Puedes ajustar el tamaño con estas clases de Tailwind
        width={150} // Establecemos el tamaño de la imagen
        height={40} // Establecemos el alto específico
      />
      {/* Texto accesible para lectores de pantalla */}
      <span className="sr-only">
        Centro Dental Especializado Loayza
      </span>
    </Link>
  );
}
