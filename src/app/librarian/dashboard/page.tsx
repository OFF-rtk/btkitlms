import {
    Library,
    BookCheck,
    Users,
    AlertTriangle,
    ListTodo,
    ShieldCheck
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { QuickActions } from "./quick-actions";

/* ── Types ── */
interface DashboardStats {
    total_inventory: number;
    books_issued: number;
    active_students: number;
    total_overdue: number;
    queue_length: number;
}

const statCards = [
    { key: "total_inventory" as const, label: "Total Inventory", icon: Library, color: "text-[#e8e4db]" },
    { key: "books_issued" as const, label: "Books Issued", icon: BookCheck, color: "text-[#e8e4db]" },
    { key: "active_students" as const, label: "Active Students", icon: Users, color: "text-[#e8e4db]" },
    { key: "total_overdue" as const, label: "Total Overdue", icon: AlertTriangle, color: "text-red-500" },
    { key: "queue_length" as const, label: "Pending Queue", icon: ListTodo, color: "text-amber-500" },
];

export default async function LibrarianDashboardPage() {
    /* ── Fetch stats via RPC (Logic untouched) ── */
    let stats: DashboardStats = {
        total_inventory: 0,
        books_issued: 0,
        active_students: 0,
        total_overdue: 0,
        queue_length: 0,
    };

    try {
        const { data, error } = await supabaseAdmin.rpc("get_admin_dashboard_stats");
        if (!error && data) {
            stats = data as DashboardStats;
        }
    } catch (err) {
        console.error("Failed to fetch admin stats:", err);
    }

    return (
        /* BACKGROUND SET TO #1a1a1a (Matching Student Dashboard) */
        <div className="w-full min-h-screen bg-[#1a1a1a] px-6 py-8 md:px-12 md:py-12 pb-32 font-serif selection:bg-amber-900/40">
            
            {/* ── Header: Matching Home Page Style ── */}
            <div className="mb-12 border-b border-stone-800/60 pb-8">
                <div className="mb-4 flex items-center gap-3 text-amber-700 uppercase tracking-[0.4em] text-[10px] md:text-xs font-black">
                    <ShieldCheck size={14} className="opacity-70" />
                    University  Admin
                </div>
                <h1 className="text-4xl font-normal text-[#e8e4db] md:text-6xl mb-1 leading-tight tracking-tight">
                    Admin <span className="italic text-stone-500">Center</span>
                </h1>
                <p className="text-[#8c8273] text-sm md:text-lg max-w-xl font-sans font-light leading-relaxed">
                    Access the college core administrative functions and real-time library insights.
                </p>
            </div>

            {/* ── Stats Grid: Matching the "Catalogue" Item Aesthetic ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
                {statCards.map((card) => (
                    <div
                        key={card.key}
                        className="relative bg-[#0d0d0d] border border-stone-800/80 p-6 shadow-2xl group hover:border-amber-900/40 transition-all rounded-sm"
                    >
                        {/* Subtle Texture Overlay */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }} />
                        
                        <div className="relative">
                            <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans mb-4 transition-colors group-hover:text-amber-800">
                                <card.icon size={12} className="text-amber-900" />
                                {card.label}
                            </span>
                            <p className={`text-3xl font-normal italic leading-none ${card.color}`}>
                                {stats[card.key].toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Quick Actions Section: Client Component ── */}
            <div className="relative">
                <div className="mb-8">
                    <h2 className="text-sm font-black font-sans uppercase tracking-[0.4em] text-stone-700 mb-2">Admin Actions</h2>
                    <div className="h-px w-20 bg-amber-900/30" />
                </div>
                <QuickActions />
            </div>
        </div>
    );
}