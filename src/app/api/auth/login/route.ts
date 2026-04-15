import { cookies } from "next/headers";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        console.log("[LOGIN] Step 1 — received:", { email });

        if (!email || !password) {
            return Response.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.log("[LOGIN] Step 2 — auth FAILED:", error.message);
            return Response.json({ error: error.message }, { status: 401 });
        }
        console.log("[LOGIN] Step 2 — auth OK, userId:", data.user?.id);

        const accessToken = data.session?.access_token;
        console.log("[LOGIN] Step 3 — token exists:", !!accessToken);
        if (!accessToken) {
            return Response.json(
                { error: "Login succeeded but no session returned" },
                { status: 500 }
            );
        }

        /* Set HttpOnly cookie */
        const cookieStore = await cookies();
        cookieStore.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
        console.log("[LOGIN] Step 4 — cookie set");

        /* Extract role from user metadata */
        const userMeta = data.user?.user_metadata;
        console.log("[LOGIN] Step 5 — raw user_metadata:", JSON.stringify(userMeta));
        const role = userMeta?.role ?? "student";
        console.log("[LOGIN] Step 5 — resolved role:", role);

        /* Check onboarding completion */
        let onboardingComplete = false;
        if (role === "librarian") {
            const { data: row, error: dbErr } = await supabaseAdmin
                .from("librarians")
                .select("employee_id")
                .eq("id", data.user!.id)
                .single();
            console.log("[LOGIN] Step 6 — librarians query:", { row, dbErr: dbErr?.message });
            onboardingComplete = !!row?.employee_id;
        } else {
            const { data: row, error: dbErr } = await supabaseAdmin
                .from("students")
                .select("roll_number")
                .eq("id", data.user!.id)
                .single();
            console.log("[LOGIN] Step 6 — students query:", { row, dbErr: dbErr?.message });
            onboardingComplete = !!row?.roll_number;
        }

        const responseBody = {
            message: "Login successful",
            role,
            onboardingComplete,
        };
        console.log("[LOGIN] Step 7 — FINAL response:", JSON.stringify(responseBody));
        return Response.json(responseBody);
    } catch (err) {
        console.error("[LOGIN] CAUGHT ERROR:", err);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
