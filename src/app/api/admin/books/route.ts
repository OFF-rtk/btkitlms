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

/* ── POST /api/admin/books — add a new book to the catalog ── */
export async function POST(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const {
            isbn, title, author, cover_url, category,
            total_copies, location_alley, location_column, location_shelf,
        } = body;

        if (!isbn || !title || !author) {
            return Response.json({ error: "isbn, title, and author are required" }, { status: 400 });
        }

        const copies = Math.max(1, total_copies || 1);

        const { data, error } = await supabaseAdmin
            .from("books")
            .insert({
                isbn: isbn.trim(),
                title: title.trim(),
                author: author.trim(),
                cover_url: cover_url || null,
                category: category || null,
                total_copies: copies,
                available_copies: copies,
                location_alley: location_alley || null,
                location_column: location_column || null,
                location_shelf: location_shelf || null,
            })
            .select("id")
            .single();

        if (error) {
            if (error.code === "23505") {
                return Response.json({ error: "A book with this ISBN already exists" }, { status: 409 });
            }
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json(data, { status: 201 });
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
}

/* ── GET /api/admin/books — fetch all books ── */
export async function GET() {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}

/* ── PATCH /api/admin/books — edit a book ── */
export async function PATCH(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) return Response.json({ error: "id is required" }, { status: 400 });

        const { error } = await supabaseAdmin
            .from("books")
            .update(updates)
            .eq("id", id);

        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ success: true });
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
}
