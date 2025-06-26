
'use server'
 
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { mockUsuariosData } from './data'
import { encrypt, decrypt } from './session'

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
 
    const user = mockUsuariosData.find(u => u.usuario.toLowerCase() === username.toLowerCase() && u.contrasena === password);
 
    if (!user) {
        return { error: 'Credenciales inválidas.' };
    }
 
    // Create the session
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now
    const sessionToken = await encrypt({ user, expires })
 
    // Save the session in a cookie
    cookies().set('session', sessionToken, { expires, httpOnly: true })
      
    // Return the token to the client for localStorage
    return { success: true, token: sessionToken }
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
