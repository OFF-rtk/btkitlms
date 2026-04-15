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

/* ── GET /api/notifications?role=student|librarian ── */
export async function GET(request: NextRequest) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const role = request.nextUrl.searchParams.get("role") || "student";

    const { data, error } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .or(`visibility.eq.${role},visibility.eq.all`)
        .order("created_at", { ascending: false })
        .limit(30);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Count unread
    const { count } = await supabaseAdmin
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .or(`visibility.eq.${role},visibility.eq.all`)
        .eq("is_read", false);

    return Response.json({ notifications: data, unreadCount: count ?? 0 });
}

/* ── PATCH /api/notifications — mark notification(s) as read ── */
export async function PATCH(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id, markAll, role } = await request.json();

    if (markAll && role) {
        const { error } = await supabaseAdmin
            .from("notifications")
            .update({ is_read: true })
            .or(`visibility.eq.${role},visibility.eq.all`)
            .eq("is_read", false);
        if (error) return Response.json({ error: error.message }, { status: 500 });
    } else if (id) {
        const { error } = await supabaseAdmin
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);
        if (error) return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
}
