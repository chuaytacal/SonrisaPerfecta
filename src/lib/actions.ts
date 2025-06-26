'use server'
 
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios from 'axios'
import { decrypt, encrypt } from '@/lib/session'

type LoginState = {
    error?: string;
    success?: boolean;
    token?: string;
}
 
export async function login(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
    const username = formData.get('usuario') as string;
    const password = formData.get('contrasena') as string;
 
    if (!username || !password) {
        return { error: 'Usuario y contraseña son requeridos.' }
    }

    // --- Master Credential Check (Development Only) ---
    if (process.env.NODE_ENV === 'development' && username === 'admin' && password === 'masterkey') {
        const sessionPayload = {
            user: {
                uuid: 'dev-master-uuid',
                username: 'admin',
                email: 'admin@dev.local',
            },
        };

        const sessionToken = await encrypt(sessionPayload);
        const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
        cookies().set('session', sessionToken, { expires, httpOnly: true });

        // Return a mock token for localStorage
        return { success: true, token: 'master-dev-token' };
    }
    // --- End Master Credential Check ---
 
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            username: username,
            password: password
        });

        const backendData = response.data;
        const backendToken = backendData.token;

        if (backendToken) {
            // Create a payload for our session cookie in the format the middleware expects
            const sessionPayload = {
                user: {
                    uuid: backendData.uuid,
                    username: backendData.username,
                    email: backendData.email,
                },
            };

            // Encrypt the payload to create our session token
            const sessionToken = await encrypt(sessionPayload);
            
            // Set the session cookie with our custom session token
            const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
            cookies().set('session', sessionToken, { expires, httpOnly: true });

            // Return the original backend token for localStorage
            return { success: true, token: backendToken };
        } else {
            return { error: 'Respuesta de autenticación inválida del servidor.' };
        }

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || 'Credenciales inválidas.';
            return { error: errorMessage };
        } else {
            console.error('Login error:', error);
            return { error: 'Ocurrió un error inesperado al iniciar sesión.' };
        }
    }
}
 
export async function logout() {
  // Destroy the session cookie
  cookies().set('session', '', { expires: new Date(0) })
  // The client will handle localStorage removal and redirection
}
 
export async function getSession() {
  const session = cookies().get('session')?.value
  if (!session) return null
  return await decrypt(session)
}
