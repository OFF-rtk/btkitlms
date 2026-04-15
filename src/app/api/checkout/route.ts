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

/* ── POST /api/checkout — convert cart items into issue requests & clear cart ── */
export async function POST() {
    const userId = await getAuthUserId();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: cartItems, error: cartError } = await supabaseAdmin
        .from("cart")
        .select("id, book_id, requested_days")
        .eq("student_id", userId);

    if (cartError) return Response.json({ error: cartError.message }, { status: 500 });
    if (!cartItems || cartItems.length === 0) {
        return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const requestRows = cartItems.map((item) => ({
        student_id: userId,
        book_id: item.book_id,
        type: "issue" as const,
        requested_days: item.requested_days,
        status: "pending" as const,
    }));

    const { error: insertError } = await supabaseAdmin
        .from("requests")
        .insert(requestRows);

    if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

    const { error: deleteError } = await supabaseAdmin
        .from("cart")
        .delete()
        .eq("student_id", userId);

    if (deleteError) console.error("Failed to clear cart after checkout:", deleteError);

    return Response.json({ success: true, requests_created: cartItems.length });
}
