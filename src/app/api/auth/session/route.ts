import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return Response.json({ authenticated: false });
    }

    try {
        const payload = await verifyJwt(token);
        const userMeta = payload.user_metadata as Record<string, string> | undefined;
        const role = userMeta?.role ?? "student";

        return Response.json({
            authenticated: true,
            userId: payload.sub,
            role,
        });
    } catch {
        return Response.json({ authenticated: false });
    }
}
