'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarMenuSub, // Not directly used, sub-menus handled by Accordion
  // SidebarMenuSubButton, // Not directly used
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Logo from '@/components/Logo';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserPlus,
  List,
  Tag,
  Briefcase,
  Archive,
  PlusSquare,
  Settings,
  UserCog,
  History,
  CircleDollarSign,
  ClipboardType,
  FilePlus,
  BarChart3,
  ChevronDown, // Still needed for AccordionTrigger's default icon if not overridden
  ChevronUp,   // Potentially for custom use, but not for AccordionTrigger's default
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const sidebarNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays },
  {
    label: 'Gestión Usuario',
    icon: Users,
    subItems: [
      {
        label: 'Pacientes',
        icon: Users, // Or a specific patient icon
        subSubItems: [
          { href: '/gestion-usuario/pacientes/registrar', label: 'Registrar Paciente', icon: UserPlus },
          { href: '/gestion-usuario/pacientes/lista', label: 'Lista de Pacientes', icon: List },
          { href: '/gestion-usuario/pacientes/etiquetas', label: 'Etiquetas', icon: Tag },
        ],
      },
      {
        label: 'Personal',
        icon: Briefcase,
        subSubItems: [
          { href: '/gestion-usuario/personal/registrar', label: 'Registrar Personal', icon: UserPlus },
          { href: '/gestion-usuario/personal/lista', label: 'Lista de Personal', icon: List },
        ],
      },
    ],
  },
  {
    label: 'Inventario',
    icon: Archive,
    subItems: [
      { href: '/inventario/productos/lista', label: 'Lista de Productos', icon: List },
      { href: '/inventario/productos/registrar', label: 'Registrar Productos', icon: PlusSquare },
    ],
  },
  {
    label: 'Administración',
    icon: Settings,
    subItems: [
      { href: '/administracion/perfiles/gestion', label: 'Gestión de Perfiles', icon: UserCog },
      { href: '/administracion/perfiles/lista', label: 'Lista de Perfiles', icon: List },
    ],
  },
  {
    label: 'Historial de Pago',
    icon: History,
    subItems: [
      { href: '/historial-pago/registrar', label: 'Registrar Pago', icon: CircleDollarSign },
      { href: '/historial-pago/lista', label: 'Lista de Pagos', icon: List },
    ],
  },
  {
    label: 'Recetas',
    icon: ClipboardType,
    subItems: [
      { href: '/recetas/registrar', label: 'Registrar Recetas', icon: FilePlus },
      { href: '/recetas/etiquetas', label: 'Etiquetas', icon: Tag },
    ],
  },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItems = (items: any[], level = 0) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = item.href && pathname === item.href;
      // const isMenuOpen = openMenus[item.label] || false; // Not needed if AccordionTrigger handles its own icon state

      if (item.subItems || item.subSubItems) {
        const subItems = item.subItems || item.subSubItems;
        return (
          <SidebarMenuItem key={item.label}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={item.label} className="border-none">
                <AccordionTrigger
                  onClick={() => toggleMenu(item.label)} // toggleMenu might still be useful for other logic if needed
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none",
                    level > 0 && "pl-6",
                     // AccordionTrigger itself doesn't usually have an 'isActive' state tied to path,
                     // but if a parent group is active, you might style it.
                     // For now, assuming isActive here is for styling the trigger if its content is active.
                     // However, the default AccordionTrigger styling for 'open' state might be sufficient.
                     // pathname.startsWith(item.basePathForActive) && "bg-sidebar-accent text-sidebar-accent-foreground" // Example if you had basePathForActive
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                  {/* Chevron is now handled by AccordionTrigger directly from shadcn/ui */}
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-0">
                  <SidebarMenu className={cn("pl-4", level > 0 && "pl-8")}>
                     {renderNavItems(subItems, level + 1)}
                  </SidebarMenu>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SidebarMenuItem>
        );
      }

      return (
        <SidebarMenuItem key={item.href || item.label}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(level > 0 && "pl-6")}
            >
              <a>
                {Icon && <Icon />}
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      );
    });
  };


  return (
    <Sidebar side="right" collapsible="icon" className="border-l">
      <SidebarHeader className="p-2 flex items-center justify-between">
        <Logo />
        <SidebarTrigger className="ml-auto hidden md:flex" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {renderNavItems(sidebarNavItems)}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
