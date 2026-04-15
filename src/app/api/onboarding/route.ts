import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        /* ── Verify JWT ── */
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let payload;
        try {
            payload = await verifyJwt(token);
        } catch {
            return Response.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const userId = payload.sub;
        if (!userId) {
            return Response.json({ error: "Invalid token payload" }, { status: 401 });
        }

        const body = await request.json();
        const { role } = body;

        if (!role || !["student", "librarian"].includes(role)) {
            return Response.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        /* ── Student onboarding ── */
        if (role === "student") {
            const { roll_number, course, branch, year } = body;
            if (!roll_number) {
                return Response.json(
                    { error: "Roll number is required" },
                    { status: 400 }
                );
            }

            const { error } = await supabaseAdmin
                .from("students")
                .update({ roll_number, course, branch, year: year ? Number(year) : null })
                .eq("id", userId);

            if (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }

        /* ── Librarian onboarding ── */
        if (role === "librarian") {
            const { employee_id } = body;
            if (!employee_id) {
                return Response.json(
                    { error: "Employee ID is required" },
                    { status: 400 }
                );
            }

            const { error } = await supabaseAdmin
                .from("librarians")
                .update({ employee_id })
                .eq("id", userId);

            if (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }

        return Response.json({ message: "Onboarding complete" });
    } catch {
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
