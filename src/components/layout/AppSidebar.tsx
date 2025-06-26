
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
  SidebarFooter
} from '@/components/ui/sidebar';
import Logo from '@/components/Logo';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Briefcase,
  BookMarked,
  History,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '../ui/button';
import { logout } from '@/lib/actions';


const sidebarNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays },
  {
    label: 'Gestión Usuario',
    icon: Users,
    basePathForActive: '/gestion-usuario',
    subItems: [
      { href: '/gestion-usuario/pacientes', label: 'Pacientes', icon: Users },
      { href: '/gestion-usuario/personal', label: 'Personal', icon: Briefcase },
    ],
  },
  { href: '/historial-pago', label: 'Historial de Pagos', icon: History },
  { href: '/catalogo', label: 'Catálogo', icon: BookMarked },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const sidebarCtx = useSidebar();
  const router = useRouter();

  const isDesktopCollapsed = !sidebarCtx.isMobile && !sidebarCtx.open;

  // Initialize with an empty array to prevent server-side errors.
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  // Calculate open accordion items inside useEffect to ensure it only runs on the client.
  useEffect(() => {
    if (isDesktopCollapsed) {
      setOpenAccordionItems([]);
    } else {
        const activeItems: string[] = [];
        function findActive(items: any[], currentPath: string | null) {
          // Guard against null pathname on server or during initial client render
          if (!currentPath) {
            return;
          }
          for (const item of items) {
            if (item.basePathForActive && currentPath.startsWith(item.basePathForActive)) {
              activeItems.push(item.label);
              if (item.subItems) {
                findActive(item.subItems, currentPath);
              }
            }
          }
        }
        findActive(sidebarNavItems, pathname);
        setOpenAccordionItems(activeItems);
    }
  }, [isDesktopCollapsed, pathname]);


  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    await logout();
    router.push('/login');
  };

  const renderNavItems = (items: any[], level = 0) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = item.href && pathname === item.href;
      // Add a guard for pathname to prevent errors on server
      const isParentActive = item.basePathForActive && pathname && pathname.startsWith(item.basePathForActive);

      if (item.subItems) { // Items like "Gestión Usuario" will enter here
        const subItems = item.subItems;

        return (
          <SidebarMenuItem key={item.label}>
            <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems} className="w-full">
              <AccordionItem value={item.label} className="border-none">
                <AccordionTrigger
                  className={cn(
                    "flex w-full items-center rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none",
                    isParentActive && !isActive && "text-sidebar-primary font-medium",
                    isDesktopCollapsed && "!size-8 !p-2 justify-center",
                    !isDesktopCollapsed && "gap-2"
                  )}
                  title={isDesktopCollapsed ? item.label : undefined}
                >
                  {Icon && <Icon className={cn("h-4 w-4 shrink-0", isParentActive && "text-sidebar-primary")} />}
                  { !isDesktopCollapsed && <span className="ml-0 flex-1 truncate">{item.label}</span>}
                </AccordionTrigger>
                <AccordionContent className={cn("pt-0 pb-0", isDesktopCollapsed && "hidden")}>
                  <SidebarMenu className={cn("pl-4")}> {/* Indent content of accordion */}
                     {renderNavItems(subItems, level + 1)} {/* Render sub-items */}
                  </SidebarMenu>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SidebarMenuItem>
        );
      }

      // Direct links or items within an accordion
      return (
        <SidebarMenuItem key={item.href || item.label}>
          <Link href={item.href || '#'} legacyBehavior passHref>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(level > 0 && "pl-6", isDesktopCollapsed && "justify-center")} // Apply padding if it's a sub-item
              tooltip={isDesktopCollapsed ? item.label : undefined}
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
      <SidebarFooter className={cn("p-2 mt-auto", isDesktopCollapsed && "pt-2")}>
          <SidebarMenuButton onClick={handleLogout} variant="ghost" className={cn("w-full", isDesktopCollapsed && "justify-center")} tooltip="Cerrar Sesión">
              <LogOut />
              <span className={cn(isDesktopCollapsed && "hidden")}>Cerrar Sesión</span>
          </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
