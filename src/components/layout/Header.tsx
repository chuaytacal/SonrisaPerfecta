import Link from 'next/link';
import { Home, CalendarDays, ClipboardList, Hospital, Menu } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/appointments', label: 'Agendar Cita', icon: CalendarDays },
  { href: '/services', label: 'Servicios', icon: ClipboardList },
  { href: '/clinic-info', label: 'Clínica', icon: Hospital },
];

export default function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex space-x-2 lg:space-x-4 items-center">
          {navItems.map((item) => (
            <Button key={item.label} variant="ghost" asChild>
              <Link href={item.href} className="flex items-center space-x-2 text-foreground hover:text-primary">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                <Logo />
                {navItems.map((item) => (
                  <Button key={item.label} variant="ghost" className="w-full justify-start" asChild>
                     <Link href={item.href} className="flex items-center space-x-2 text-lg text-foreground hover:text-primary">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
