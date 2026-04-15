import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("books")
        .select("*")
        .order("category", { ascending: true });

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
