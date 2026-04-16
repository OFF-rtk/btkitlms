"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PackageCheck, XCircle, AlertCircle, BookOpen, MessageSquareQuote } from "lucide-react";

export interface BookRequest {
    id: string;
    student_id: string;
    isbn: string;
    title: string;
    author: string;
    cover_url: string | null;
    reason: string | null;
    status: string;
    created_at: string;
}

interface ProcurementSideSheetProps {
    request: BookRequest | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function ProcurementSideSheet({ request, isOpen, onClose, onUpdated }: ProcurementSideSheetProps) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    async function handleAction(status: "ordered" | "rejected") {
        if (!request) return;
        setProcessing(true); setError("");
        try {
            const res = await fetch("/api/admin/procurement", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: request.id, status }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || "Action failed"); return; }
            onUpdated?.();
            onClose();
        } catch { setError("Something went wrong."); }
        finally { setProcessing(false); }
    }

    if (!isOpen || !request) return null;

    return (
        <>
            <div className={`fixed inset-0 z-[60] bg-black/85 backdrop-blur-md transition-opacity duration-500 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`} onClick={onClose} />
            <div className={`fixed z-[70] flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}`}>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                    <div>
                        <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">Procurement Review</h2>
                        <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">ISBN: {request.isbn}</p>
                    </div>
                    <button onClick={onClose} className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 border border-stone-800 text-stone-600 transition-all hover:border-amber-900/50 hover:text-amber-600">
                        <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-10">
                    {/* Book Visual */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-10 h-72 w-48 overflow-hidden rounded-[2px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/5 ring-1 ring-stone-900">
                            <img
                                src={request.cover_url || PLACEHOLDER}
                                alt={request.title}
                                className="h-full w-full object-cover grayscale-[20%] sepia-[15%] transition-all duration-700 hover:grayscale-0 hover:sepia-0"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                            />
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
                        </div>
                        <h3 className="mb-4 text-center font-serif text-3xl font-normal text-[#e8e4db] leading-tight italic underline decoration-stone-800 underline-offset-8">
                            {request.title}
                        </h3>
                        <p className="mb-4 font-serif text-amber-800 tracking-[0.2em] uppercase text-xs font-bold">
                            By {request.author}
                        </p>
                        <p className="text-[9px] text-stone-600 font-mono tracking-widest">ISBN: {request.isbn}</p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-sm bg-[#0d0d0d] p-5 border border-stone-900 shadow-inner">
                            <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-3">
                                <BookOpen size={10} className="text-amber-900" /> Requested On
                            </span>
                            <p className="text-stone-300 text-sm font-serif">{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="rounded-sm bg-[#0d0d0d] p-5 border border-stone-900 shadow-inner">
                            <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-3">
                                <BookOpen size={10} className="text-amber-900" /> Status
                            </span>
                            <p className="text-amber-500 text-sm font-serif font-bold uppercase">{request.status}</p>
                        </div>
                    </div>

                    {/* Student Reason */}
                    <div className="bg-[#050505] p-8 rounded-3xl border border-stone-900/60 shadow-inner">
                        <label className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-stone-600">
                            <MessageSquareQuote size={14} className="text-amber-900" />
                            Student&apos;s Reason
                        </label>
                        {request.reason ? (
                            <blockquote className="border-l-2 border-amber-900/40 pl-5 py-2">
                                <p className="text-stone-300 text-sm font-serif italic leading-relaxed">&ldquo;{request.reason}&rdquo;</p>
                            </blockquote>
                        ) : (
                            <p className="text-stone-700 text-sm font-serif italic">No reason provided.</p>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 rounded-sm bg-red-950/10 border border-red-900/20 p-4 text-xs text-red-500 font-sans">
                            <AlertCircle size={14} className="shrink-0" /> {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleAction("ordered")} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border border-emerald-700/20 py-5 font-black text-emerald-50 uppercase tracking-[0.3em] text-[9px] shadow-[0_15px_30px_rgba(0,0,0,0.4)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                        >
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                            Mark as Ordered
                        </button>
                        <button
                            onClick={() => handleAction("rejected")} disabled={processing}
                            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-br from-red-950 via-red-900 to-red-950 border border-red-800/20 py-5 font-black text-red-200 uppercase tracking-[0.3em] text-[9px] shadow-[0_15px_30px_rgba(0,0,0,0.4)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                        >
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                            Reject
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}
