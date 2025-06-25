
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Loader2, User, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dentalPhoto from '@/components/assets/fondo-dental.jpg';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Iniciar Sesión
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gray-100">
        <Image
            src={dentalPhoto}
            alt="Fondo de la clínica dental"
            fill
            style={{ objectFit: 'cover' }}
            className="absolute inset-0 z-0"
            priority
        />
        <div className="absolute inset-0 bg-primary/30 z-10"></div>

        <div className="relative z-20 w-full max-w-4xl lg:h-[600px] lg:grid lg:grid-cols-2 bg-transparent rounded-2xl shadow-2xl overflow-hidden">
            {/* Left Panel: Transparent with Text and S-Curve */}
            <div className="relative hidden h-full lg:flex flex-col justify-center items-center p-12 text-white">
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                 <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-bold mb-4">Centro Dental Especializado Loayza</h2>
                    <p className="text-lg">Comprometidos con tu sonrisa.</p>
                </div>
                {/* S-Curve Separator */}
                <svg
                    className="absolute top-0 right-0 h-full w-24 text-card -translate-x-1/2"
                    viewBox="0 0 100 600"
                    fill="currentColor"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M0 0 C50 150, 50 450, 0 600 L100 600 L100 0 Z" />
                </svg>
            </div>
            
            {/* Right Panel: White Form */}
            <div className="flex flex-col justify-center p-8 sm:p-12 w-full bg-card">
              <div className="mb-6 flex justify-center">
                <Logo width={200} height={50} />
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
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña"
                            className="pl-10 pr-10"
                            required
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
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
                
                <div className="flex justify-center pt-2">
                    <LoginButton />
                </div>
              </form>
            </div>
        </div>
    </main>
  );
}
