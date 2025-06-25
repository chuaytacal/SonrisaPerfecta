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
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-primary/10">
      <div className="relative w-full max-w-7xl min-h-[80vh] bg-card rounded-2xl shadow-2xl flex overflow-hidden">
          
          <div className="w-1/2 hidden md:block relative">
              <Image
                  src={dentalPhoto}
                  alt="Fondo de la clínica dental"
                  fill
                  className="object-cover"
                  priority
              />
              <div className="absolute inset-0 bg-primary/50"></div>
              
              <div className="absolute top-0 right-0 h-full w-32 -mr-16 z-10">
                  <svg viewBox="0 0 100 700" className="h-full w-full" fill="hsl(var(--card))" preserveAspectRatio="none">
                      <path d="M 25 0 C -40 175, 90 525, 25 700 L 100 700 L 100 0 Z" />
                  </svg>
              </div>
          </div>

          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-card">
              <div className="mx-auto w-full max-w-sm">
                  <div className="mb-8 flex justify-center">
                      <Logo width={200} height={50} />
                  </div>
                  
                  <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de Vuelta</h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                          Ingrese sus credenciales para acceder al panel.
                      </p>
                  </div>
                  
                  <form action={formAction} className="space-y-4">
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
      </div>
    </main>
  );
}
