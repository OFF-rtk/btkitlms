import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const { full_name, email, password, role } = await request.json();

        if (!full_name || !email || !password || !role) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        /* role is "student" or "librarian" — used directly by the DB trigger */

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { role, full_name },
            },
        });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        const accessToken = data.session?.access_token;

        /* Email confirmation is enabled — no session yet */
        if (!accessToken) {
            return Response.json({
                message: "Please check your email to confirm your account.",
                emailConfirmation: true,
                role,
            });
        }

        /* Email confirmation disabled — set cookie immediately */
        const cookieStore = await cookies();
        cookieStore.set("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return Response.json({
            message: "Registration successful",
            emailConfirmation: false,
            role,
            userId: data.user?.id,
        });
    } catch {
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
