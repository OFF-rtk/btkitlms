"use client";

import { useState, useEffect } from "react";
import { X, ScanLine, Search, Loader2, RotateCcw, BookOpen, User, AlertCircle } from "lucide-react";

interface Borrowing {
    id: string;
    book_id: string;
    status: string;
    issued_at: string;
    due_date: string;
    books: { title: string; author: string; isbn: string; cover_url: string | null };
    students: { full_name: string; roll_number: string };
}

interface ScanReturnSideSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function ScanReturnSideSheet({ isOpen, onClose }: ScanReturnSideSheetProps) {
    const [isbn, setIsbn] = useState("");
    const [searching, setSearching] = useState(false);
    const [borrowing, setBorrowing] = useState<Borrowing | null>(null);
    const [returning, setReturning] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    function reset() {
        setIsbn(""); setBorrowing(null); setError(""); setSearching(false); setReturning(false);
    }

    function handleClose() { reset(); onClose(); }

    async function handleSearch() {
        if (!isbn.trim()) return;
        setSearching(true); setBorrowing(null); setError("");
        try {
            const res = await fetch(`/api/admin/return-book?isbn=${encodeURIComponent(isbn.trim())}`);
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Not found"); return; }
            setBorrowing(data);
        } catch { setError("Search failed."); }
        finally { setSearching(false); }
    }

    async function handleReturn() {
        if (!borrowing) return;
        setReturning(true);
        try {
            const res = await fetch("/api/admin/return-book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ borrowing_id: borrowing.id, book_id: borrowing.book_id }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || "Return failed"); return; }
            handleClose();
        } catch { setError("Something went wrong."); }
        finally { setReturning(false); }
    }

    const isOverdue = borrowing?.status === "overdue";

    return (
        <>
            {/* ── Backdrop: Identical to BookSideSheet ── */}
            <div
                className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-md transition-opacity duration-500 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
                onClick={handleClose}
            />

            {/* ── Panel: Identical Transition and Positioning ── */}
            <div
                className={`fixed z-[70] flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out
                    bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t
                    md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l
                    ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                    <div>
                        <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">Process Return</h2>
                        <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">Scan or enter ISBN</p>
                    </div>
                    <button onClick={handleClose} className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 border border-stone-800 text-stone-600 transition-all hover:border-amber-900/50 hover:text-amber-600">
                        <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-8">

                    {/* Scanner Placeholder */}
                    <div className="relative aspect-video flex flex-col items-center justify-center border-2 border-dashed border-stone-800 bg-stone-950/40 overflow-hidden rounded-xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_#0a0a0a_100%)] opacity-40" />
                        <ScanLine size={32} className="text-stone-800 mb-4 animate-pulse" />
                        <button onClick={() => { setIsbn("SIM-" + Date.now()); handleSearch(); }} disabled={searching} className="relative px-6 py-2 border border-amber-900/30 text-[9px] font-sans font-black uppercase tracking-[0.2em] text-amber-700 hover:bg-amber-900 hover:text-amber-50 transition-all">
                            {searching ? "Searching..." : "Simulate Scan"}
                        </button>
                    </div>

                    {/* Manual Input */}
                    <div className="font-sans">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-stone-700 font-black mb-2 block">Book ISBN</label>
                        <div className="flex gap-2">
                            <input
                                type="text" value={isbn}
                                onChange={(e) => setIsbn(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="e.g. 978-01..."
                                className="flex-1 bg-stone-950 border border-stone-900 px-4 py-3 text-sm text-stone-300 outline-none focus:border-amber-900 transition-colors"
                            />
                            <button onClick={handleSearch} disabled={searching || !isbn.trim()} className="bg-stone-900 px-4 text-stone-600 border border-stone-800 transition-colors hover:text-amber-600 rounded-sm">
                                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 rounded-sm bg-red-950/10 border border-red-900/20 p-4 text-xs text-red-500 font-sans">
                            <AlertCircle size={14} className="shrink-0" /> {error}
                        </div>
                    )}

                    {/* Borrowing Result */}
                    {borrowing && (
                        <div className="border border-stone-900 bg-stone-950/30 p-6 shadow-inner space-y-6 rounded-sm">
                            <div className="flex gap-4">
                                <div className="h-28 w-20 shrink-0 overflow-hidden border border-stone-800 shadow-xl">
                                    <img src={borrowing.books.cover_url || PLACEHOLDER} alt="" className="h-full w-full object-cover grayscale-[20%]" />
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className="text-lg italic text-[#e8e4db] tracking-tight leading-tight line-clamp-2 font-serif">{borrowing.books.title}</h3>
                                    <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.15em] mt-1">{borrowing.books.author}</p>
                                    <p className="text-[9px] text-stone-600 font-mono tracking-widest mt-1 uppercase">Index: {borrowing.books.isbn}</p>
                                </div>
                            </div>

                            {/* Borrower Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-sm bg-[#0d0d0d] p-4 border border-stone-900 shadow-inner">
                                    <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-2">
                                        <User size={10} className="text-amber-900" /> Borrower
                                    </span>
                                    <p className="text-stone-300 text-sm font-serif">{borrowing.students.full_name}</p>
                                    <p className="text-[9px] text-stone-600 font-mono mt-0.5">{borrowing.students.roll_number}</p>
                                </div>
                                <div className="rounded-sm bg-[#0d0d0d] p-4 border border-stone-900 shadow-inner">
                                    <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-2">
                                        <BookOpen size={10} className="text-amber-900" /> Due Date
                                    </span>
                                    <p className={`text-sm font-serif ${isOverdue ? "text-red-500" : "text-stone-300"}`}>
                                        {new Date(borrowing.due_date).toLocaleDateString()}
                                    </p>
                                    {isOverdue && <p className="text-[9px] text-red-600 font-black font-sans uppercase tracking-widest mt-1">Overdue</p>}
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleReturn}
                                disabled={returning}
                                className="flex w-full items-center justify-center gap-4 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border border-emerald-700/20 px-10 py-5 font-black text-emerald-50 uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                            >
                                {returning ? <Loader2 className="h-5 w-5 animate-spin" /> : <RotateCcw className="h-5 w-5" />}
                                {returning ? "Processing..." : "Confirm Return"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}