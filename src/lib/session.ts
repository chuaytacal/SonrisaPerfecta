import { SignJWT, jwtVerify } from 'jose'
 
const secretKey = process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key)
}
 
export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        // This can happen if the token is expired or invalid
        // console.log('Failed to verify session');
        return null;
    }
}
