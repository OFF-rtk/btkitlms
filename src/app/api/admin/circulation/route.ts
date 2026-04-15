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

/* ── GET /api/admin/circulation — pending requests + active loans ── */
export async function GET() {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [reqResult, loanResult] = await Promise.all([
        supabaseAdmin
            .from("requests")
            .select("*, students(full_name, roll_number), books(title, author, isbn)")
            .eq("status", "pending")
            .order("created_at", { ascending: true }),
        supabaseAdmin
            .from("borrowings")
            .select("*, students(full_name, roll_number), books(title, author, isbn)")
            .in("status", ["active", "overdue"])
            .order("due_date", { ascending: true }),
    ]);

    if (reqResult.error) return Response.json({ error: reqResult.error.message }, { status: 500 });
    if (loanResult.error) return Response.json({ error: loanResult.error.message }, { status: 500 });

    return Response.json({
        pendingRequests: reqResult.data,
        activeLoans: loanResult.data,
    });
}
