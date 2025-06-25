
'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // If it's the login page, render only the children without the main layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Otherwise, render the full application shell with sidebar
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 py-3 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div></div>
            <div className="md:hidden">
              <SidebarTrigger>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SidebarTrigger>
            </div>
          </header>
          <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
