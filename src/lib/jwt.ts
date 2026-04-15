import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Cached JWKS fetcher — auto-refreshes keys from Supabase */
const JWKS = createRemoteJWKSet(
    new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
);

/**
 * Verify a Supabase JWT using the project's JWKS endpoint.
 * Works with both HS256 and ES256 (whatever Supabase is configured to use).
 */
export async function verifyJwt(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, JWKS);
    return payload;
}
