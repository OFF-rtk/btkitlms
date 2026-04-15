import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabase";
import { AdminSidebar } from "./sidebar";

export default async function LibrarianDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    /* ── Auth guard ── */
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

    /* ── Onboarding guard ── */
    const { data } = await supabaseAdmin
        .from("librarians")
        .select("employee_id, full_name")
        .eq("id", userId)
        .single();

    if (!data?.employee_id) {
        redirect("/onboarding/librarian");
    }

    const adminName = data.full_name ?? "Librarian";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4db] selection:bg-amber-900/30">
            <AdminSidebar adminName={adminName} />
            <main className="min-h-screen pt-16 lg:pt-0 lg:pl-64 relative border-none outline-none">
                {children}
            </main>
        </div>
    );
}
