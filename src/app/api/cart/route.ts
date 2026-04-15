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

/* ── GET /api/cart — fetch the student's cart with joined book data ── */
export async function GET() {
    const userId = await getAuthUserId();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("cart")
        .select("id, requested_days, books(*)")
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

/* ── POST /api/cart — add a book to the cart ── */
export async function POST(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { book_id, requested_days } = await request.json();

        if (!book_id || !requested_days) {
            return Response.json(
                { error: "book_id and requested_days are required" },
                { status: 400 }
            );
        }

        // Prevent duplicates
        const { data: existing } = await supabaseAdmin
            .from("cart")
            .select("id")
            .eq("student_id", userId)
            .eq("book_id", book_id)
            .maybeSingle();

        if (existing) {
            return Response.json(
                { error: "Book is already in your cart" },
                { status: 409 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("cart")
            .insert({ student_id: userId, book_id, requested_days })
            .select("id, requested_days, books(*)")
            .single();

        if (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json(data, { status: 201 });
    } catch {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
}

/* ── DELETE /api/cart?id=<cart_row_id> — remove item from cart ── */
export async function DELETE(request: Request) {
    const userId = await getAuthUserId();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
        return Response.json({ error: "Cart item id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("cart")
        .delete()
        .eq("id", cartItemId)
        .eq("student_id", userId); // ensure ownership

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
}
