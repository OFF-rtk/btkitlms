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

/* ── GET /api/admin/requests — fetch pending requests ── */
export async function GET() {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from("requests")
        .select("*, students(full_name, roll_number), books(title, author, isbn, available_copies)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}

/* ── PATCH /api/admin/requests — approve or reject a request ── */
export async function PATCH(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { request_id, action, student_id, book_id, requested_days } = await request.json();

    if (!request_id || !action) {
        return Response.json({ error: "request_id and action are required" }, { status: 400 });
    }

    if (action === "approve") {
        // 1. Update request status
        const { error: updateError } = await supabaseAdmin
            .from("requests")
            .update({ status: "approved" })
            .eq("id", request_id);

        if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

        // 2. Create borrowing record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (requested_days || 7));

        const { error: borrowError } = await supabaseAdmin
            .from("borrowings")
            .insert({
                student_id,
                book_id,
                request_id,
                due_date: dueDate.toISOString(),
            });

        if (borrowError) return Response.json({ error: borrowError.message }, { status: 500 });

        // 3. Decrement available_copies
        const { data: book } = await supabaseAdmin
            .from("books")
            .select("available_copies")
            .eq("id", book_id)
            .single();

        if (book) {
            await supabaseAdmin
                .from("books")
                .update({ available_copies: Math.max(0, book.available_copies - 1) })
                .eq("id", book_id);
        }

        return Response.json({ success: true, action: "approved" });
    }

    if (action === "reject") {
        const { error } = await supabaseAdmin
            .from("requests")
            .update({ status: "rejected" })
            .eq("id", request_id);

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ success: true, action: "rejected" });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
}
