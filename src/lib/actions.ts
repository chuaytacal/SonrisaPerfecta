'use server'
 
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import axios from 'axios'
import { decrypt } from '@/lib/session'

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
 
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            username: username,
            password: password
        });

        // Assume backend returns { token: 'jwt_string' }
        const token = response.data.token;

        if (token) {
            const expires = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
            cookies().set('session', token, { expires, httpOnly: true })
            return { success: true, token: token }
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
  // Destroy the session
  cookies().set('session', '', { expires: new Date(0) })
  redirect('/login')
}
 
export async function getSession() {
  const session = cookies().get('session')?.value
  if (!session) return null
  return await decrypt(session)
}
