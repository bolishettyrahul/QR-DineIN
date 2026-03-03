import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

export interface TokenPayload extends JWTPayload {
  staffId: string;
  role: 'ADMIN' | 'KITCHEN';
  name: string;
}

export async function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
