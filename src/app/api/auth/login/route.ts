import { cookies } from "next/headers";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

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
            return Response.json({ error: error.message }, { status: 401 });
        }

        const accessToken = data.session?.access_token;
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

        /* Extract role from user metadata */
        const role = data.user?.user_metadata?.role ?? "student";

        /* Check onboarding completion */
        let onboardingComplete = false;
        if (role === "librarian") {
            const { data: row } = await supabaseAdmin
                .from("librarians")
                .select("employee_id")
                .eq("id", data.user!.id)
                .single();
            onboardingComplete = !!row?.employee_id;
        } else {
            const { data: row } = await supabaseAdmin
                .from("students")
                .select("roll_number")
                .eq("id", data.user!.id)
                .single();
            onboardingComplete = !!row?.roll_number;
        }

        return Response.json({
            message: "Login successful",
            role,
            onboardingComplete,
        });
    } catch {
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
