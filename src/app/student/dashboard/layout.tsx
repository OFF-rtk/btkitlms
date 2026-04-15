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
    /* ── Auth guard (Logic Unchanged) ── */
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

    /* ── Onboarding guard (Logic Unchanged) ── */
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
                {/* 1. Added lg:gap-0 to ensure no flex-gap is creating a line */}
                <div className="flex min-h-screen bg-[#0a0a0a] text-[#e8e4db] selection:bg-amber-900/30 lg:gap-0">

                    <StudentSidebar studentName={studentName} />

                    {/* 2. Added lg:border-none and removed any potential outline */}
                    <main className="flex-1 min-w-0 lg:ml-96 pt-16 lg:pt-0 min-h-screen relative border-none outline-none">
                        {/* 3. Potential Culprit: DesktopTopIcons often has a bottom border. 
                           If the line is horizontal, it's this. If vertical, it's the Sidebar. */}
                        <DesktopTopIcons />
                        {children}
                    </main>

                </div>
            </ToastProvider>
        </CartProvider>
    );
}