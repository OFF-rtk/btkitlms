import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabase";

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

/* ── GET /api/admin/procurement — fetch pending book requests ── */
export async function GET() {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from("book_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}

/* ── PATCH /api/admin/procurement — update a book request status ── */
export async function PATCH(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, status } = await request.json();
        if (!id || !status) {
            return Response.json({ error: "id and status are required" }, { status: 400 });
        }
        if (!["ordered", "rejected"].includes(status)) {
            return Response.json({ error: "status must be 'ordered' or 'rejected'" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("book_requests")
            .update({ status })
            .eq("id", id);

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ success: true });
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
}
