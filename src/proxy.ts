import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const JWKS = createRemoteJWKSet(
    new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("access_token")?.value;

    /* ── Public auth pages: always allow ── */
    if (pathname.startsWith("/auth")) {
        return NextResponse.next();
    }

    /* ── Protected zones ── */
    const isApi = pathname.startsWith("/api/onboarding");
    const isDashboard =
        pathname.startsWith("/student/dashboard") ||
        pathname.startsWith("/librarian/dashboard");
    const isOnboarding = pathname.startsWith("/onboarding");

    if (!isApi && !isDashboard && !isOnboarding) {
        return NextResponse.next();
    }

    /* ── Missing token ── */
    if (!token) {
        if (isApi) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const loginUrl = new URL("/auth/student/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    /* ── Verify JWT ── */
    try {
        await jwtVerify(token, JWKS);
        return NextResponse.next();
    } catch {
        if (isApi) {
            return Response.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }
        const loginUrl = new URL("/auth/student/login", request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        "/api/onboarding",
        "/student/dashboard/:path*",
        "/librarian/dashboard/:path*",
        "/onboarding/:path*",
    ],
};
