"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Check, XIcon, BookOpen, User, Clock, AlertCircle } from "lucide-react";

interface PendingRequest {
    id: string;
    student_id: string;
    book_id: string;
    requested_days: number;
    created_at: string;
    students: { full_name: string; roll_number: string };
    books: { title: string; author: string; isbn: string; available_copies: number };
}

interface ProcessQueueSideSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProcessQueueSideSheet({ isOpen, onClose }: ProcessQueueSideSheetProps) {
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/requests");
            if (res.ok) setRequests(await res.json());
        } catch { setError("Failed to load queue."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (isOpen) fetchRequests(); }, [isOpen, fetchRequests]);

    async function handleAction(req: PendingRequest, action: "approve" | "reject") {
        setProcessing(req.id); setError("");
        try {
            const res = await fetch("/api/admin/requests", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    request_id: req.id,
                    action,
                    student_id: req.student_id,
                    book_id: req.book_id,
                    requested_days: req.requested_days,
                }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || "Action failed"); return; }
            setRequests((prev) => prev.filter((r) => r.id !== req.id));
        } catch { setError("Something went wrong."); }
        finally { setProcessing(null); }
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md transition-opacity duration-500 opacity-100" onClick={onClose} />
            <div className="fixed z-50 flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l translate-y-0 md:translate-x-0">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                    <div>
                        <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">Request Queue</h2>
                        <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">
                            {requests.length} pending
                        </p>
                    </div>
                    <button onClick={onClose} className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 border border-stone-800 text-stone-600 transition-all hover:border-amber-900/50 hover:text-amber-600">
                        <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide space-y-3">
                    {error && (
                        <div className="flex items-center gap-3 rounded-sm bg-red-950/10 border border-red-900/20 p-4 text-xs text-red-500 font-sans">
                            <AlertCircle size={14} className="shrink-0" /> {error}
                        </div>
                    )}

                    {loading && (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
                        </div>
                    )}

                    {!loading && requests.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-stone-900/50 bg-stone-950/40 shadow-inner">
                                <Check className="h-7 w-7 text-emerald-800" />
                            </div>
                            <h3 className="text-lg italic text-[#e8e4db] tracking-tight mb-2">All caught up</h3>
                            <p className="text-[10px] text-stone-600 font-sans tracking-wide">No pending requests in the queue.</p>
                        </div>
                    )}

                    {requests.map((req) => {
                        const isProcessing = processing === req.id;
                        const noStock = req.books.available_copies < 1;
                        return (
                            <div key={req.id} className="border border-stone-900 bg-[#0d0d0d] p-5 shadow-inner hover:border-stone-800 transition-all">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm italic text-[#e8e4db] tracking-tight leading-tight line-clamp-1 font-serif">{req.books.title}</h4>
                                        <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.12em] mt-0.5">{req.books.author}</p>
                                    </div>
                                    {noStock && (
                                        <span className="shrink-0 text-[8px] font-black text-red-900 uppercase tracking-widest border border-red-900/20 px-2 py-0.5 bg-red-950/10">No stock</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-4 text-[9px] font-sans text-stone-600 tracking-wide">
                                    <span className="flex items-center gap-1.5"><User size={10} className="text-stone-700" />{req.students.full_name}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={10} className="text-stone-700" />{req.requested_days}d</span>
                                    <span className="flex items-center gap-1.5"><BookOpen size={10} className="text-stone-700" />{req.students.roll_number}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(req, "approve")}
                                        disabled={isProcessing || noStock}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-950/20 border border-emerald-900/20 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:bg-emerald-900/30 transition-all disabled:opacity-30 disabled:grayscale"
                                    >
                                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req, "reject")}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-950/10 border border-red-900/20 text-[9px] font-black uppercase tracking-[0.2em] text-red-600 hover:bg-red-900/20 transition-all disabled:opacity-30"
                                    >
                                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <XIcon size={12} />}
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}
