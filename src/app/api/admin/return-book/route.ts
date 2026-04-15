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

/* ── GET /api/admin/return-book?isbn=<isbn> — find active borrowing by book ISBN ── */
export async function GET(request: NextRequest) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const isbn = request.nextUrl.searchParams.get("isbn");
    if (!isbn) return Response.json({ error: "isbn query param is required" }, { status: 400 });

    // Find the book by ISBN first
    const { data: book } = await supabaseAdmin
        .from("books")
        .select("id")
        .eq("isbn", isbn.trim())
        .maybeSingle();

    if (!book) return Response.json({ error: "No book found with that ISBN" }, { status: 404 });

    // Find active borrowing for this book
    const { data: borrowing, error } = await supabaseAdmin
        .from("borrowings")
        .select("*, books(*), students(full_name, roll_number)")
        .eq("book_id", book.id)
        .in("status", ["active", "overdue"])
        .limit(1)
        .maybeSingle();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!borrowing) return Response.json({ error: "No active borrowing found for this book" }, { status: 404 });

    return Response.json(borrowing);
}

/* ── POST /api/admin/return-book — process the return ── */
export async function POST(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { borrowing_id, book_id } = await request.json();
    if (!borrowing_id || !book_id) {
        return Response.json({ error: "borrowing_id and book_id are required" }, { status: 400 });
    }

    // 1. Update borrowing status
    const { error: borrowError } = await supabaseAdmin
        .from("borrowings")
        .update({ status: "returned", returned_at: new Date().toISOString() })
        .eq("id", borrowing_id);

    if (borrowError) return Response.json({ error: borrowError.message }, { status: 500 });

    // 2. Increment available_copies
    const { data: book } = await supabaseAdmin
        .from("books")
        .select("available_copies")
        .eq("id", book_id)
        .single();

    if (book) {
        await supabaseAdmin
            .from("books")
            .update({ available_copies: book.available_copies + 1 })
            .eq("id", book_id);
    }

    return Response.json({ success: true });
}
