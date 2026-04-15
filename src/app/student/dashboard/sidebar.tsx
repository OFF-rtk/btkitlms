"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Home,
    Search,
    Heart,
    Map,
    LogOut,
    Menu,
    X,
    ShoppingCart,
    BookOpen,
    User,
    Bell,
} from "lucide-react";
import { useCart } from "./cart-context";

const navItems = [
    { label: "Home", href: "/student/dashboard", icon: Home },
    { label: "Search", href: "/student/dashboard/search", icon: Search },
    { label: "Wishlist", href: "/student/dashboard/wishlist", icon: Heart },
    { label: "Library Map", href: "/student/dashboard/map", icon: Map },
];

export function StudentSidebar({ studentName }: { studentName: string }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { count } = useCart();

    return (
        <>
            {/* ── Mobile top bar ── */}
            <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 backdrop-blur lg:hidden">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-orange-50/70 hover:bg-white/10 hover:text-orange-50"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-amber-400" />
                    <span className="text-lg font-bold text-orange-50">
                        LibraryMS
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-orange-50/70 hover:bg-white/10 hover:text-orange-50"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            3
                        </span>
                    </button>
                    <Link
                        href="/student/dashboard/cart"
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-orange-50/70 hover:bg-white/10 hover:text-orange-50"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {count > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                                {count > 9 ? "9+" : count}
                            </span>
                        )}
                    </Link>
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
          fixed top-0 left-0 z-50 flex h-screen w-64 flex-col bg-slate-950 border-r border-white/10 p-5
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Close button (mobile only) */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-orange-50/50 hover:bg-white/10 hover:text-orange-50 lg:hidden"
                    aria-label="Close menu"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Brand */}
                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800">
                        <BookOpen className="h-5 w-5 text-orange-50" />
                    </div>
                    <span className="text-xl font-bold text-orange-50">
                        LibraryMS
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-orange-50/60 transition-colors hover:bg-white/5 hover:text-orange-50"
                        >
                            <item.icon className="h-[18px] w-[18px]" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Bottom: profile & logout */}
                <div className="mt-auto border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-orange-50/60">
                        <User className="h-[18px] w-[18px]" />
                        <span className="truncate">{studentName}</span>
                    </div>
                    <button
                        onClick={() => {
                            document.cookie = "access_token=; path=/; max-age=0";
                            window.location.href = "/auth/student/login";
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                        <LogOut className="h-[18px] w-[18px]" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
