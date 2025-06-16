
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
  SidebarTrigger,
  useSidebar,
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
  // ChevronDown is part of AccordionTrigger from ui/accordion.tsx
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const sidebarNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays },
  {
    label: 'Gestión Usuario',
    icon: Users,
    basePathForActive: '/gestion-usuario',
    subItems: [
      {
        label: 'Pacientes',
        icon: Users, 
        basePathForActive: '/gestion-usuario/pacientes',
        subSubItems: [
          { href: '/gestion-usuario/pacientes/registrar', label: 'Registrar Paciente', icon: UserPlus },
          { href: '/gestion-usuario/pacientes/lista', label: 'Lista de Pacientes', icon: List },
          { href: '/gestion-usuario/pacientes/etiquetas', label: 'Etiquetas', icon: Tag },
        ],
      },
      {
        label: 'Personal',
        icon: Briefcase,
        basePathForActive: '/gestion-usuario/personal',
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
    basePathForActive: '/inventario',
    subItems: [
      { href: '/inventario/productos/lista', label: 'Lista de Productos', icon: List },
      { href: '/inventario/productos/registrar', label: 'Registrar Productos', icon: PlusSquare },
    ],
  },
  {
    label: 'Administración',
    icon: Settings,
    basePathForActive: '/administracion',
    subItems: [
      { href: '/administracion/perfiles/gestion', label: 'Gestión de Perfiles', icon: UserCog },
      { href: '/administracion/perfiles/lista', label: 'Lista de Perfiles', icon: List },
    ],
  },
  {
    label: 'Historial de Pago',
    icon: History,
    basePathForActive: '/historial-pago',
    subItems: [
      { href: '/historial-pago/registrar', label: 'Registrar Pago', icon: CircleDollarSign },
      { href: '/historial-pago/lista', label: 'Lista de Pagos', icon: List },
    ],
  },
  {
    label: 'Recetas',
    icon: ClipboardType,
    basePathForActive: '/recetas',
    subItems: [
      { href: '/recetas/registrar', label: 'Registrar Recetas', icon: FilePlus },
      { href: '/recetas/etiquetas', label: 'Etiquetas', icon: Tag },
    ],
  },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const sidebarCtx = useSidebar();

  // isDesktopCollapsed determines if the desktop sidebar should show only icons.
  // It relies on context values which are stable for server render (isMobile=false, open=defaultOpen).
  const isDesktopCollapsed = !sidebarCtx.isMobile && !sidebarCtx.open;

  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(() => {
    const activeItems: string[] = [];
    // Pre-calculate active items based on initial state (server/first client render)
    // If sidebar is initially collapsed on desktop, no accordions should be open.
    if (!(!sidebarCtx.isMobile && !sidebarCtx.open)) { // Check if NOT initially desktop collapsed
        function findActive(items: any[], currentPath: string) {
          for (const item of items) {
            if (item.basePathForActive && currentPath.startsWith(item.basePathForActive)) {
              activeItems.push(item.label);
              if (item.subItems || item.subSubItems) {
                findActive(item.subItems || item.subSubItems, currentPath);
              }
            }
          }
        }
        findActive(sidebarNavItems, pathname);
    }
    return activeItems;
  });

  useEffect(() => {
    // This effect runs on the client after hydration and when context values change.
    if (isDesktopCollapsed) {
      setOpenAccordionItems([]); 
    } else {
        const activeItems: string[] = [];
        function findActive(items: any[], currentPath: string) {
          for (const item of items) {
            if (item.basePathForActive && currentPath.startsWith(item.basePathForActive)) {
              activeItems.push(item.label);
              if (item.subItems || item.subSubItems) {
                findActive(item.subItems || item.subSubItems, currentPath);
              }
            }
          }
        }
        findActive(sidebarNavItems, pathname);
        setOpenAccordionItems(activeItems);
    }
  // Recalculate open accordions if desktop collapsed state changes or pathname changes.
  }, [isDesktopCollapsed, pathname]);


  const renderNavItems = (items: any[], level = 0) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = item.href && pathname === item.href;
      const isParentActive = item.basePathForActive && pathname.startsWith(item.basePathForActive);

      if (item.subItems || item.subSubItems) {
        const subItems = item.subItems || item.subSubItems;
        
        return (
          <SidebarMenuItem key={item.label}>
            <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems} className="w-full">
              <AccordionItem value={item.label} className="border-none">
                <AccordionTrigger
                  className={cn(
                    "flex w-full items-center rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none",
                    level > 0 && "pl-6", 
                    isParentActive && !isActive && "text-sidebar-primary font-medium",
                    isDesktopCollapsed && "!size-8 !p-2 justify-center", // Styles for collapsed desktop
                    !isDesktopCollapsed && "gap-2" // Gap only when expanded
                  )}
                  title={isDesktopCollapsed ? item.label : undefined} 
                >
                  {Icon && <Icon className={cn("h-4 w-4 shrink-0", isParentActive && "text-sidebar-primary")} />}
                  { !isDesktopCollapsed && <span className="ml-0 flex-1 truncate">{item.label}</span>}
                </AccordionTrigger>
                <AccordionContent className={cn("pt-0 pb-0", isDesktopCollapsed && "hidden")}>
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
              className={cn(level > 0 && "pl-6", isDesktopCollapsed && "justify-center")}
              tooltip={isDesktopCollapsed ? item.label : undefined} // Tooltip only when collapsed
            >
              <a>
                {Icon && <Icon className="shrink-0" />}
                { !isDesktopCollapsed && <span className="truncate">{item.label}</span>}
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      );
    });
  };


  return (
    <Sidebar side="left" collapsible="icon" className="border-r group/app-sidebar">
      <SidebarHeader className={cn("p-2 flex items-center justify-between", isDesktopCollapsed && "justify-center")}>
        <div className={cn(isDesktopCollapsed && "[&_text]:hidden")}>
            <Logo />
        </div>
        <SidebarTrigger className={cn("ml-auto md:flex", isDesktopCollapsed && "hidden")} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {renderNavItems(sidebarNavItems)}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
