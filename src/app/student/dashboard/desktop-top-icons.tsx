"use client";

import Link from "next/link";
import { Bell, ShoppingCart } from "lucide-react";
import { useCart } from "./cart-context";

/**
 * Desktop-only notification bell + cart icons pinned to the top-right.
 * Hidden on mobile (the sidebar mobile header handles those icons).
 */
export function DesktopTopIcons() {
    const { count } = useCart();

    return (
        <div className="hidden lg:flex items-center gap-1 absolute top-4 right-6 z-30">
            {/* Notification Bell */}
            <button
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-orange-50/70 hover:bg-white/10 hover:text-orange-50 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    3
                </span>
            </button>

            {/* Cart */}
            <Link
                href="/student/dashboard/cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-orange-50/70 hover:bg-white/10 hover:text-orange-50 transition-colors"
            >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </Link>
        </div>
    );
}
