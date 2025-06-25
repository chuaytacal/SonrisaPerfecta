import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center">
      <Image 
        src="/logo.png" 
        alt="Centro Dental Especializado Loayza Logo" 
        width={200} 
        height={50} 
        priority 
        className="object-contain"
      />
    </Link>
  );
}
