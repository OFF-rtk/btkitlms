"use client";

import { useState, useEffect } from "react";
import {
    X,
    ShoppingCart,
    Minus,
    Plus,
    Loader2,
    Book as BookIcon,
    MapPin,
    Calendar,
    Hash,
    AlertCircle
} from "lucide-react";
import { useCart } from "../cart-context";

/* ── Types ── */
export interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    cover_url: string | null;
    category: string | null;
    collections: string[] | null;
    total_copies: number;
    available_copies: number;
    location_alley: string | null;
    location_column: string | null;
    location_shelf: string | null;
}

interface BookSideSheetProps {
    book: Book | null;
    onClose: () => void;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function BookSideSheet({ book, onClose }: BookSideSheetProps) {
    const { refreshCart } = useCart();
    const [months, setMonths] = useState(0);
    const [days, setDays] = useState(7);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartError, setCartError] = useState("");

    const totalDays = months * 30 + days;

    /* ── Lock background scroll when sheet is open ── */
    useEffect(() => {
        document.body.style.overflow = book ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [book]);

    /* ── Add to Cart via API route ── */
    async function handleAddToCart() {
        if (!book) return;
        setAddingToCart(true);
        setCartError("");

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    book_id: book.id,
                    requested_days: totalDays,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setCartError(data.error || "Registry error: Failed to record loan.");
                setAddingToCart(false);
                return;
            }

            refreshCart();
            setMonths(0);
            setDays(7);
            setCartError("");
            onClose();
        } catch {
            setCartError("Connection lost to the archives.");
        } finally {
            setAddingToCart(false);
        }
    }

    return (
        <>
            {/* ── UPDATED BACKDROP: Covers whole screen including sidebar ── */}
            <div
                className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-md transition-opacity duration-500 ${
                    book ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
                onClick={onClose}
            />

            {/* ── PANEL: Higher Z-index to stay above backdrop ── */}
            <div
                className={`fixed z-[70] flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out
                    bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t
                    md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l
                    ${book ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
                `}
            >
                {book && (
                    <>
                        {/* Header: Registry Label Style */}
                        <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                            <div>
                                <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">
                                    Registry Record
                                </h2>
                                <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">
                                    Accession No: {book.isbn}
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
                                        src={book.cover_url || PLACEHOLDER}
                                        alt={book.title}
                                        className="h-full w-full object-cover grayscale-[20%] sepia-[15%] transition-all duration-700 hover:grayscale-0 hover:sepia-0"
                                    />
                                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
                                </div>
                                <h3 className="mb-4 text-center font-serif text-3xl font-normal text-[#e8e4db] leading-tight italic underline decoration-stone-800 underline-offset-8">
                                    {book.title}
                                </h3>
                                <p className="mb-8 font-serif text-amber-800 tracking-[0.2em] uppercase text-xs font-bold text-center">
                                    By {book.author}
                                </p>
                                
                                {/* ── PROMINENT AVAILABILITY BOX ── */}
                                <div className={`w-full max-w-[340px] rounded-sm p-6 border-2 transition-all flex flex-col items-center justify-center gap-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ${
                                    book.available_copies > 0 
                                    ? "border-emerald-900/50 bg-emerald-950/20 shadow-emerald-900/20" 
                                    : "border-red-900/50 bg-red-950/20 shadow-red-900/20"
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${book.available_copies > 0 ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-red-500"}`} />
                                        <span className={`text-2xl md:text-3xl font-serif italic font-bold tracking-tight ${book.available_copies > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                            {book.available_copies} of {book.total_copies}
                                        </span>
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${book.available_copies > 0 ? "text-emerald-700" : "text-red-700"}`}>
                                        Available 
                                    </span>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-sm bg-[#0d0d0d] p-5 border border-stone-900 shadow-inner">
                                    <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-3">
                                        <MapPin size={10} className="text-amber-900" /> Location
                                    </span>
                                    <p className="text-stone-300 text-sm font-serif">
                                        {book.location_alley} <span className="text-stone-600 mx-1">•</span> {book.location_column}
                                    </p>
                                </div>
                                <div className="rounded-sm bg-[#0d0d0d] p-5 border border-stone-900 shadow-inner">
                                    <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black mb-3">
                                        <Hash size={10} className="text-amber-900" /> Category
                                    </span>
                                    <p className="text-stone-300 text-sm font-serif italic truncate">
                                        {book.category || "General Studies"}
                                    </p>
                                </div>
                            </div>

                            {/* Loan Duration Selector */}
                            <div className="bg-[#050505] p-8 rounded-3xl border border-stone-900/60 shadow-inner">
                                <label className="mb-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-stone-600">
                                    <Calendar size={14} className="text-amber-900" />
                                    Borrowing Terms
                                </label>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-stone-500 font-black uppercase tracking-widest font-sans">Months</span>
                                        <div className="flex items-center gap-5 bg-[#0d0d0d] px-3 py-2 rounded-xl border border-stone-800">
                                            <button onClick={() => setMonths((m) => Math.max(0, m - 1))} className="text-stone-600 hover:text-amber-600 transition-colors"><Minus size={16} /></button>
                                            <span className="w-6 text-center text-base font-black text-amber-700 font-sans">{months}</span>
                                            <button onClick={() => setMonths((m) => Math.min(12, m + 1))} className="text-stone-600 hover:text-amber-600 transition-colors"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-stone-500 font-black uppercase tracking-widest font-sans">Days</span>
                                        <div className="flex items-center gap-5 bg-[#0d0d0d] px-3 py-2 rounded-xl border border-stone-800">
                                            <button onClick={() => setDays((d) => Math.max(0, d - 1))} className="text-stone-600 hover:text-amber-600 transition-colors"><Minus size={16} /></button>
                                            <span className="w-6 text-center text-base font-black text-amber-700 font-sans">{days}</span>
                                            <button onClick={() => setDays((d) => Math.min(29, d + 1))} className="text-stone-600 hover:text-amber-600 transition-colors"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-5 border-t border-stone-900/50 flex justify-between items-center text-[10px] text-stone-600 font-black uppercase tracking-[0.2em]">
                                    <span>Total Period:</span>
                                    <span className="text-amber-600 font-serif italic text-sm">{totalDays} Days</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            {cartError && (
                                <div className="flex items-center gap-3 rounded-2xl bg-red-950/10 border border-red-900/20 px-6 py-4 text-xs text-red-500 font-sans tracking-tight">
                                    <AlertCircle size={14} className="shrink-0" />
                                    {cartError}
                                </div>
                            )}
                            <button
                                disabled={book.available_copies < 1 || totalDays < 1 || addingToCart}
                                onClick={handleAddToCart}
                                className="flex w-full items-center justify-center gap-4 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/20 px-10 py-5 font-black text-amber-50 uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                            >
                                {addingToCart ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <ShoppingCart className="h-5 w-5" />
                                )}
                                {addingToCart
                                    ? "Adding..."
                                    : book.available_copies < 1
                                        ? "Out of Circulation"
                                        : "Add to Cart"}
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