import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabase";

/** Helper: extract userId from the HttpOnly JWT cookie */
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

/* ── GET /api/wishlist — fetch wishlisted books for the student ── */
export async function GET() {
    const userId = await getAuthUserId();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("wishlist")
        .select("id, book_id, books(*)")
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

/* ── POST /api/wishlist — add a book to wishlist ── */
export async function POST(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { book_id } = await request.json();

        if (!book_id) {
            return Response.json({ error: "book_id is required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("wishlist")
            .insert({ student_id: userId, book_id })
            .select("id, book_id")
            .single();

        if (error) {
            // Unique constraint violation = already wishlisted
            if (error.code === "23505") {
                return Response.json(
                    { error: "Book is already in your wishlist" },
                    { status: 409 }
                );
            }
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json(data, { status: 201 });
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
}

/* ── DELETE /api/wishlist?id=<row_id> OR ?book_id=<uuid> — remove from wishlist ── */
export async function DELETE(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rowId = searchParams.get("id");
    const bookId = searchParams.get("book_id");

    if (!rowId && !bookId) {
        return Response.json({ error: "id or book_id is required" }, { status: 400 });
    }

    let query = supabaseAdmin
        .from("wishlist")
        .delete()
        .eq("student_id", userId);

    if (rowId) {
        query = query.eq("id", rowId);
    } else {
        query = query.eq("book_id", bookId!);
    }

    const { error } = await query;

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
}
