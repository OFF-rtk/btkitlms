import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/supabase";
import { StudentSidebar } from "./sidebar";
import { DesktopTopIcons } from "./desktop-top-icons";
import { CartProvider } from "./cart-context";
import { ToastProvider } from "./toast-context";

export default async function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    /* ── Auth guard ── */
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

    /* ── Onboarding guard ── */
    const { data } = await supabaseAdmin
        .from("students")
        .select("roll_number, full_name")
        .eq("id", userId)
        .single();

    if (!data?.roll_number) {
        redirect("/onboarding/student");
    }

    const studentName = data.full_name ?? "Student";

    return (
        <CartProvider>
            <ToastProvider>
                <div className="min-h-screen bg-slate-950 text-orange-50 font-sans selection:bg-amber-600/30">

                    <StudentSidebar studentName={studentName} />

                    <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen relative">
                        <DesktopTopIcons />
                        {children}
                    </main>

                </div>
            </ToastProvider>
        </CartProvider>
    );
}