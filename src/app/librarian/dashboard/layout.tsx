import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabase";

export default async function LibrarianDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        redirect("/auth/librarian/login");
    }

    let payload;
    try {
        payload = await verifyJwt(token);
    } catch {
        redirect("/auth/librarian/login");
    }

    const userId = payload.sub as string;

    const { data } = await supabaseAdmin
        .from("librarians")
        .select("employee_id")
        .eq("id", userId)
        .single();

    if (!data?.employee_id) {
        redirect("/onboarding/librarian");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {children}
        </div>
    );
}
