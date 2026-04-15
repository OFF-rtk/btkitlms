import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyJwt } from "@/lib/jwt";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ role: string }>;
}) {
    const { role } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        redirect("/auth/student/login");
    }

    let payload;
    try {
        payload = await verifyJwt(token);
    } catch {
        redirect("/auth/student/login");
    }

    const userId = payload.sub as string;

    /* ── Onboarding check ── */
    if (role === "librarian") {
        const { data } = await supabaseAdmin
            .from("librarians")
            .select("employee_id")
            .eq("id", userId)
            .single();

        if (!data?.employee_id) {
            redirect("/onboarding/librarian");
        }
    } else {
        const { data } = await supabaseAdmin
            .from("students")
            .select("roll_number")
            .eq("id", userId)
            .single();

        if (!data?.roll_number) {
            redirect("/onboarding/student");
        }
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            {children}
        </div>
    );
}
