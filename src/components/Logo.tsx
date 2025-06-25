
import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center">
      <Image 
        src="https://placehold.co/200x50.png" 
        alt="Centro Dental Especializado Loayza Logo" 
        width={200} 
        height={50} 
        priority 
        className="object-contain"
        data-ai-hint="company logo"
      />
    </Link>
  );
}
