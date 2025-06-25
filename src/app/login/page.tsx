'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Loader2, User } from 'lucide-react';
import Logo from '@/components/Logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Iniciar Sesión
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary/10 p-4">
      <div className="relative w-full max-w-4xl lg:h-[600px] lg:grid lg:grid-cols-2 rounded-2xl bg-card shadow-2xl overflow-hidden">
        
        {/* Left Panel: Image */}
        <div className="relative hidden h-full lg:block">
          <Image
            src="https://placehold.co/600x600.png"
            alt="Clínica Dental Loayza"
            fill
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint="dental clinic"
          />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
        </div>
        
        {/* SVG Curve Separator */}
        <div className="absolute top-0 bottom-0 left-1/2 w-32 -translate-x-1/2 hidden lg:block">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 100 0 C 0 20, 0 80, 100 100 Z" fill="hsl(var(--card))" />
            </svg>
        </div>

        {/* Right Panel: Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 w-full">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de Vuelta</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingrese sus credenciales para acceder al panel.
            </p>
          </div>
          
          <form action={formAction} className="mt-8 space-y-4">
            <div className="space-y-2">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="usuario"
                        name="usuario"
                        type="text"
                        placeholder="Usuario"
                        className="pl-10"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="contrasena"
                        name="contrasena"
                        type="password"
                        placeholder="Contraseña"
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            {state?.error && (
              <Alert variant="destructive">
                <KeyRound className="h-4 w-4" />
                <AlertTitle>Error de Autenticación</AlertTitle>
                <AlertDescription>
                  {state.error}
                </AlertDescription>
              </Alert>
            )}

            <LoginButton />
          </form>
        </div>
      </div>
    </main>
  );
}
