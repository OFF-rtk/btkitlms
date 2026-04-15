import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

async function getAuthUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    try {
        const payload = await verifyJwt(token);
        return (payload.sub as string) ?? null;
    } catch {
        return null;
    }
}

/* ── POST /api/scan-sessions — create a new scan session ── */
export async function POST() {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const id = crypto.randomUUID();

    const { error } = await supabaseAdmin
        .from("scan_sessions")
        .insert({ id, isbn: null });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ id }, { status: 201 });
}

/* ── PATCH /api/scan-sessions — mobile scanner updates ISBN ── */
export async function PATCH(request: Request) {
    // No auth required — mobile scanner uses session ID as auth
    const { session_id, isbn } = await request.json();
    if (!session_id || !isbn) {
        return Response.json({ error: "session_id and isbn required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("scan_sessions")
        .update({ isbn: isbn.replace(/-/g, "").trim() })
        .eq("id", session_id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
}

/* ── DELETE /api/scan-sessions?id=<id> — cleanup session ── */
export async function DELETE(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    await supabaseAdmin.from("scan_sessions").delete().eq("id", id);
    return Response.json({ success: true });
}
