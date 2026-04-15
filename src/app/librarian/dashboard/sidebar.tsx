"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    BookOpen,
    ArrowLeftRight,
    Inbox,
    Users,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    Bell,
    Feather,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/librarian/dashboard", icon: Home },
    { label: "Catalog", href: "/librarian/dashboard/catalog", icon: BookOpen },
    { label: "Circulation", href: "/librarian/dashboard/circulation", icon: ArrowLeftRight },
    { label: "Procurement", href: "/librarian/dashboard/procurement", icon: Inbox },
    { label: "Students", href: "/librarian/dashboard/students", icon: Users },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* ── Mobile top bar ── */}
            <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a]/80 px-6 backdrop-blur-xl lg:hidden">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:text-amber-600 transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-700" />
                    <span className="font-serif text-xl tracking-[0.2em] text-[#e8e4db] uppercase">Admin LMS</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-500">
                        <Bell className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 flex h-screen w-64 flex-col bg-[#0a0a0a]
                    transition-transform duration-500 ease-in-out lg:translate-x-0 lg:border-none
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Brand Section */}
                <div className="relative mb-4 flex h-32 flex-col items-center justify-center border-b border-[#1a1a1a] bg-[#0d0d0d]">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center border border-amber-900/30 bg-[#0a0a0a] text-amber-700">
                        <ShieldCheck size={20} strokeWidth={1.5} />
                    </div>
                    <span className="font-serif text-2xl tracking-[0.4em] text-[#e8e4db] uppercase">Admin LMS</span>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600 font-sans font-bold mt-1">Command Center</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0.5 px-6 py-2">
                    <p className="px-4 mb-3 text-[9px] uppercase tracking-[0.3em] text-stone-700 font-black">Administration</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`
                                    group flex items-center gap-4 rounded-sm px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all
                                    ${isActive
                                        ? "bg-amber-900/10 text-amber-600 border-l-2 border-amber-700 shadow-[inset_10px_0_15px_-10px_rgba(180,83,9,0.1)]"
                                        : "text-stone-500 hover:bg-stone-900 hover:text-[#e8e4db] border-l-2 border-transparent"}
                                `}
                            >
                                <item.icon className={`h-4 w-4 ${isActive ? "text-amber-600" : "group-hover:text-amber-700"}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Profile & Footer */}
                <div className="mt-auto p-6 border-t border-[#1a1a1a] bg-[#0d0d0d]">
                    <div className="mb-3 flex items-center gap-3 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a] p-3 shadow-inner">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900 border border-stone-800 text-amber-800">
                            <Feather size={16} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate font-serif text-xs text-[#e8e4db]">{adminName}</span>
                            <span className="text-[8px] uppercase tracking-widest text-stone-600 mt-0.5">Librarian</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                        <button
                            onClick={() => {
                                document.cookie = "access_token=; path=/; max-age=0";
                                window.location.href = "/auth/librarian/login";
                            }}
                            className="col-span-5 flex items-center justify-center gap-3 border border-stone-800 bg-[#0a0a0a] py-2.5 text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-red-500 transition-all"
                        >
                            <LogOut size={12} /> Logout
                        </button>
                        <button className="col-span-1 flex items-center justify-center border border-stone-800 bg-[#0a0a0a] text-stone-500 hover:text-amber-600">
                            <Bell size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
