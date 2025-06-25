
import Link from 'next/link';
import Image from 'next/image';
import logoImage from '@/components/assets/logo.png';

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center">
      <Image 
        src={logoImage} 
        alt="Centro Dental Especializado Loayza Logo" 
        width={200} 
        height={50} 
        priority 
        className="object-contain"
        placeholder="blur"
      />
    </Link>
  );
}
