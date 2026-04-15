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

export async function POST(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { isbn, title, author, cover_url, reason } = await request.json();
        if (!isbn || !title || !author) {
            return Response.json({ error: "isbn, title and author are required" }, { status: 400 });
        }

        const { data: existing } = await supabaseAdmin
            .from("book_requests")
            .select("id")
            .eq("student_id", userId)
            .eq("isbn", isbn)
            .eq("status", "pending")
            .maybeSingle();

        if (existing) {
            return Response.json({ error: "You already have a pending request for this book" }, { status: 409 });
        }

        const { data, error } = await supabaseAdmin
            .from("book_requests")
            .insert({ student_id: userId, isbn, title, author, cover_url: cover_url || null, reason: reason || null })
            .select("id")
            .single();

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json(data, { status: 201 });
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
}
