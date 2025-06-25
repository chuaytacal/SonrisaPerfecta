import Link from 'next/link';
import Image from 'next/image';
import logo from '@/components/assets/logo.png';

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center">
      <Image 
        src={logo} 
        alt="Sonrisa Perfecta Logo" 
        width={160} 
        height={40} 
        priority 
        className="object-contain"
      />
    </Link>
  );
}
