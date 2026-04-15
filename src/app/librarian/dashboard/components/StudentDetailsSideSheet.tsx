"use client";

import { useState, useEffect } from "react";
import { X, Loader2, RotateCcw, BookOpen, GraduationCap, Hash, AlertCircle } from "lucide-react";

interface BorrowingBook {
    title: string;
    author: string;
    isbn: string;
    cover_url: string | null;
}

export interface Borrowing {
    id: string;
    book_id: string;
    status: string;
    issued_at: string;
    due_date: string;
    returned_at: string | null;
    books: BorrowingBook;
}

export interface Student {
    id: string;
    email: string;
    full_name: string;
    roll_number: string;
    course: string | null;
    branch: string | null;
    year: number | null;
    borrowings: Borrowing[];
}

interface StudentDetailsSideSheetProps {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

export default function StudentDetailsSideSheet({ student, isOpen, onClose, onUpdated }: StudentDetailsSideSheetProps) {
    const [returning, setReturning] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const activeLoans = (student?.borrowings ?? []).filter(
        (b) => b.status === "active" || b.status === "overdue"
    );

    async function handleManualReturn(borrowing: Borrowing) {
        setReturning(borrowing.id); setError("");
        try {
            const res = await fetch("/api/admin/return-book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ borrowing_id: borrowing.id, book_id: borrowing.book_id }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error || "Return failed"); return; }
            onUpdated?.();
        } catch { setError("Something went wrong."); }
        finally { setReturning(null); }
    }

    if (!isOpen || !student) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md transition-opacity duration-500 opacity-100" onClick={onClose} />
            <div className="fixed z-50 flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l translate-y-0 md:translate-x-0">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                    <div>
                        <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">Student Profile</h2>
                        <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">{student.roll_number}</p>
                    </div>
                    <button onClick={onClose} className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 border border-stone-800 text-stone-600 transition-all hover:border-amber-900/50 hover:text-amber-600">
                        <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-8">
                    {/* Student Info */}
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-stone-800 bg-stone-950 shadow-inner">
                            <GraduationCap size={32} strokeWidth={1.5} className="text-amber-800" />
                        </div>
                        <h3 className="text-2xl italic text-[#e8e4db] tracking-tight leading-tight">{student.full_name}</h3>
                        <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.2em] mt-2">{student.email}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-sm bg-[#0d0d0d] p-4 border border-stone-900 shadow-inner text-center">
                            <span className="flex items-center justify-center gap-1.5 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-2">
                                <Hash size={9} className="text-amber-900" /> Roll
                            </span>
                            <p className="text-stone-300 text-xs font-mono">{student.roll_number}</p>
                        </div>
                        <div className="rounded-sm bg-[#0d0d0d] p-4 border border-stone-900 shadow-inner text-center">
                            <span className="flex items-center justify-center gap-1.5 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-2">
                                <BookOpen size={9} className="text-amber-900" /> Course
                            </span>
                            <p className="text-stone-300 text-xs font-serif">{student.course || "—"}</p>
                        </div>
                        <div className="rounded-sm bg-[#0d0d0d] p-4 border border-stone-900 shadow-inner text-center">
                            <span className="flex items-center justify-center gap-1.5 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-2">
                                <GraduationCap size={9} className="text-amber-900" /> Branch
                            </span>
                            <p className="text-stone-300 text-xs font-serif">{student.branch || "—"}{student.year ? `, Yr ${student.year}` : ""}</p>
                        </div>
                    </div>

                    {/* Active Loans */}
                    <div>
                        <p className="px-1 mb-4 text-[9px] uppercase tracking-[0.3em] text-stone-700 font-black font-sans">
                            Active Loans ({activeLoans.length})
                        </p>

                        {activeLoans.length === 0 && (
                            <div className="rounded-sm bg-[#0d0d0d] border border-stone-900 p-6 text-center shadow-inner">
                                <p className="text-sm text-stone-600 font-serif italic">No active loans.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {activeLoans.map((b) => {
                                const isOverdue = b.status === "overdue";
                                const isReturning = returning === b.id;
                                return (
                                    <div key={b.id} className="bg-[#0d0d0d] border border-stone-900 p-5 shadow-inner">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm italic text-[#e8e4db] tracking-tight leading-tight line-clamp-1 font-serif">{b.books.title}</h4>
                                                <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.12em] mt-0.5">{b.books.author}</p>
                                            </div>
                                            <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 border ${isOverdue ? "text-red-500 border-red-900/30 bg-red-950/10" : "text-emerald-500 border-emerald-900/30 bg-emerald-950/10"}`}>
                                                {b.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className={`text-[10px] font-sans tracking-wide ${isOverdue ? "text-red-600" : "text-stone-600"}`}>
                                                Due: {new Date(b.due_date).toLocaleDateString()}
                                            </p>
                                            <button
                                                onClick={() => handleManualReturn(b)}
                                                disabled={isReturning}
                                                className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-900/30 text-[8px] font-black uppercase tracking-[0.15em] text-emerald-600 hover:bg-emerald-900/20 transition-all disabled:opacity-40"
                                            >
                                                {isReturning ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                                                Manual Return
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 rounded-sm bg-red-950/10 border border-red-900/20 p-4 text-xs text-red-500 font-sans">
                            <AlertCircle size={14} className="shrink-0" /> {error}
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
