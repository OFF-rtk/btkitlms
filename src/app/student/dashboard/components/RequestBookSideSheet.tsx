"use client";

import { useState, useEffect } from "react";
import {
    X,
    Send,
    Loader2,
    BookOpen,
    AlertCircle,
} from "lucide-react";
import { useToast } from "../toast-context";

/* ── Props ── */
export interface GoogleBookData {
    title: string;
    author: string;
    isbn: string;
    cover_url: string | null;
}

interface RequestBookSideSheetProps {
    bookData: GoogleBookData | null;
    onClose: () => void;
}

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function RequestBookSideSheet({
    bookData,
    onClose,
}: RequestBookSideSheetProps) {
    const { showToast } = useToast();
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    /* ── Lock background scroll when sheet is open ── */
    useEffect(() => {
        document.body.style.overflow = bookData ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [bookData]);

    async function handleSubmit() {
        if (!bookData) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/book-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isbn: bookData.isbn,
                    title: bookData.title,
                    author: bookData.author,
                    cover_url: bookData.cover_url,
                    reason: reason.trim() || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || "Failed to send request", "error");
                setSubmitting(false);
                return;
            }

            showToast("Request sent to Admin!", "success");
            setReason("");
            onClose();
        } catch {
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            {/* Backdrop with Academic Atmosphere */}
            <div
                className={`fixed inset-0 z-[60] bg-black/85 backdrop-blur-md transition-opacity duration-500 ${bookData
                    ? "opacity-100 visible"
                    : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Side Panel / Bottom Sheet */}
            <div
                className={`fixed z-[70] flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out
                    bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t
                    md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l
                    ${bookData
                        ? "translate-y-0 md:translate-x-0"
                        : "translate-y-full md:translate-x-full"
                    }
                `}
            >
                {bookData && (
                    <>
                        {/* Header: Registry Label Style */}
                        <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                            <div>
                                <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">
                                    Procurement Request
                                </h2>
                                <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">
                                    ISBN: {bookData.isbn}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 border border-stone-800 text-stone-600 transition-all hover:border-amber-900/50 hover:text-amber-600"
                            >
                                <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-10">
                            {/* Visual Display */}
                            <div className="flex flex-col items-center">
                                <div className="relative mb-10 h-72 w-48 overflow-hidden rounded-[2px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/5 ring-1 ring-stone-900">
                                    <img
                                        src={bookData.cover_url || PLACEHOLDER}
                                        alt={bookData.title}
                                        className="h-full w-full object-cover grayscale-[20%] sepia-[15%] transition-all duration-700 hover:grayscale-0 hover:sepia-0"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                        }}
                                    />
                                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
                                </div>
                                <h3 className="mb-4 text-center font-serif text-3xl font-normal text-[#e8e4db] leading-tight italic underline decoration-stone-800 underline-offset-8">
                                    {bookData.title}
                                </h3>
                                <p className="mb-8 font-serif text-amber-800 tracking-[0.2em] uppercase text-xs font-bold">
                                    By {bookData.author}
                                </p>

                                <div className="inline-flex items-center gap-3 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-sky-900/30 bg-sky-950/10 text-sky-600">
                                    <BookOpen size={12} />
                                    Found via Google Books
                                </div>
                            </div>

                            {/* Info Note */}
                            <div className="rounded-sm bg-[#0d0d0d] p-5 border border-stone-900 shadow-inner">
                                <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-3">
                                    <AlertCircle size={10} className="text-amber-900" /> Notice
                                </span>
                                <p className="text-stone-400 text-sm font-serif italic leading-relaxed">
                                    This volume is not yet in our library archives. Submit a
                                    procurement request and the librarian will review it for
                                    acquisition.
                                </p>
                            </div>

                            {/* Reason Textarea */}
                            <div className="bg-[#050505] p-8 rounded-3xl border border-stone-900/60 shadow-inner">
                                <label className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-stone-600">
                                    <Send size={14} className="text-amber-900" />
                                    Reason for Request
                                    <span className="text-stone-800 normal-case tracking-normal font-normal italic font-serif text-xs">
                                        (Optional)
                                    </span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                    placeholder="e.g. Required for my coursework in Advanced Literature…"
                                    className="w-full bg-[#0d0d0d] border border-stone-800 rounded-xl px-5 py-4 text-sm text-stone-300 font-serif outline-none placeholder:text-stone-800 focus:border-amber-900/50 transition-colors resize-none"
                                />
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex w-full items-center justify-center gap-4 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/20 px-10 py-5 font-black text-amber-50 uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                            >
                                {submitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                                {submitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Custom Scrollbar CSS */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}
