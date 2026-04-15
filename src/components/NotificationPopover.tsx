"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Check, CheckCheck, Loader2 } from "lucide-react";

interface Notification {
    id: string;
    title: string;
    message: string;
    visibility: "student" | "librarian" | "all";
    is_read: boolean;
    created_at: string;
}

interface NotificationPopoverProps {
    role: "student" | "librarian";
}

export default function NotificationPopover({ role }: NotificationPopoverProps) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications?role=${role}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) { console.error("Failed to fetch notifications:", err); }
        finally { setLoading(false); }
    }, [role]);

    // Fetch on mount and poll every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    async function markAsRead(id: string) {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount((c) => Math.max(0, c - 1));
    }

    async function markAllRead() {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAll: true, role }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    return (
        <div ref={popoverRef} className="relative h-full">
            {/* Bell trigger */}
            <button
                onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
                className="col-span-1 flex items-center justify-center border border-stone-800 bg-[#0a0a0a] text-stone-500 hover:text-amber-600 transition-all h-full w-full"
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[8px] font-black text-black">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Popover dropdown */}
            {open && (
                <div className="absolute bottom-full left-0 mb-2 w-80 max-h-[400px] flex flex-col bg-[#0d0d0d] border border-stone-800 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-stone-900">
                        <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-amber-700">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    title="Mark all read"
                                    className="flex items-center gap-1 text-[8px] font-sans font-black uppercase tracking-widest text-stone-600 hover:text-emerald-500 transition-colors"
                                >
                                    <CheckCheck size={12} /> All read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-stone-600 hover:text-amber-600 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {loading && notifications.length === 0 && (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 size={18} className="animate-spin text-stone-600" />
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="py-10 text-center">
                                <Bell size={24} className="mx-auto text-stone-800 mb-3" />
                                <p className="text-[10px] text-stone-600 font-sans tracking-wide">No notifications yet</p>
                            </div>
                        )}

                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`group flex gap-3 p-4 border-b border-stone-900/50 transition-colors hover:bg-stone-950/50 ${!n.is_read ? "bg-amber-950/5" : ""}`}
                            >
                                <div className="mt-1 shrink-0">
                                    <div className={`h-2 w-2 rounded-full ${!n.is_read ? "bg-amber-600 shadow-[0_0_6px_rgba(217,119,6,0.5)]" : "bg-stone-800"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[#e8e4db] font-serif leading-tight mb-1">{n.title}</p>
                                    <p className="text-[10px] text-stone-500 font-sans leading-relaxed line-clamp-2">{n.message}</p>
                                    <p className="text-[9px] text-stone-700 font-mono tracking-wider mt-1.5">{timeAgo(n.created_at)}</p>
                                </div>
                                {!n.is_read && (
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        title="Mark as read"
                                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-stone-600 hover:text-emerald-500"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
