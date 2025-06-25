
import Link from 'next/link';
import Image from 'next/image';
import logoImage from '@/components/assets/logo.png';

interface LogoProps {
  width?: number;
  height?: number;
}

export default function Logo({ width = 150, height = 38 }: LogoProps) { // Default to a smaller size
  return (
    <Link href="/dashboard" className="flex items-center">
      <Image 
        src={logoImage} 
        alt="Centro Dental Especializado Loayza Logo" 
        width={width} 
        height={height} 
        priority 
        className="object-contain"
        placeholder="blur"
      />
    </Link>
  );
}
