"use client";

import { useState } from "react";
import {
    X,
    ShoppingCart,
    Minus,
    Plus,
    Loader2,
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

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function BookSideSheet({ book, onClose }: BookSideSheetProps) {
    const { refreshCart } = useCart();
    const [months, setMonths] = useState(0);
    const [days, setDays] = useState(7);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartError, setCartError] = useState("");

    const totalDays = months * 30 + days;

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
                setCartError(data.error || "Failed to add to cart.");
                setAddingToCart(false);
                return;
            }

            // Success — refresh cart badge and close sheet
            refreshCart();
            setMonths(0);
            setDays(7);
            setCartError("");
            onClose();
        } catch {
            setCartError("Something went wrong. Please try again.");
        } finally {
            setAddingToCart(false);
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${book
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed z-50 flex flex-col bg-slate-900 border-white/10 shadow-2xl transition-transform duration-300 ease-in-out
                    /* Mobile: Bottom Sheet */
                    bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl border-t
                    /* Desktop: Right Panel */
                    md:top-0 md:bottom-auto md:right-0 md:left-auto md:h-screen md:w-[420px] md:max-h-none md:rounded-none md:border-l md:border-t-0
                    ${book
                        ? "translate-y-0 md:translate-x-0"
                        : "translate-y-full md:translate-y-0 md:translate-x-full"
                    }
                `}
            >
                {book && (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 p-6">
                            <h2 className="font-serif text-xl font-bold text-orange-50">
                                Details
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-full bg-white/5 p-2 text-orange-50/50 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="mb-6 flex gap-5">
                                <div className="h-40 w-28 shrink-0 overflow-hidden rounded-lg shadow-xl shadow-black/50">
                                    <img
                                        src={book.cover_url || PLACEHOLDER}
                                        alt={book.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h3 className="mb-1 font-serif text-2xl font-bold leading-tight text-orange-50">
                                        {book.title}
                                    </h3>
                                    <p className="mb-3 text-sm text-amber-600 font-medium">
                                        {book.author}
                                    </p>
                                    <span
                                        className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${book.available_copies > 0
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-red-500/10 text-red-400"
                                            }`}
                                    >
                                        {book.available_copies} / {book.total_copies} Available
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="mb-8 space-y-2 rounded-xl bg-slate-950/50 p-4 border border-white/5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-50/50">ISBN</span>
                                    <span className="font-medium text-orange-50">
                                        {book.isbn}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-50/50">Category</span>
                                    <span className="font-medium text-orange-50">
                                        {book.category || "General"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-white/5 mt-2">
                                    <span className="text-orange-50/50">Location Map</span>
                                    <span className="font-medium text-orange-50">
                                        {book.location_alley} • {book.location_column}
                                    </span>
                                </div>
                            </div>

                            {/* Duration Form — Months + Days */}
                            <div className="mb-4">
                                <label className="mb-3 block text-sm font-medium text-orange-50/70">
                                    Requested Issue Duration
                                </label>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Months */}
                                    <div>
                                        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-orange-50/40">
                                            Months
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setMonths((m) => Math.max(0, m - 1))}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-orange-50 hover:bg-slate-700 active:scale-95 transition-all"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min={0}
                                                max={12}
                                                value={months}
                                                onChange={(e) =>
                                                    setMonths(Math.max(0, Math.min(12, Number(e.target.value))))
                                                }
                                                className="h-10 w-14 rounded-lg bg-slate-950 border border-amber-900/30 text-center text-lg font-bold text-orange-50 outline-none focus:border-amber-600"
                                            />
                                            <button
                                                onClick={() => setMonths((m) => Math.min(12, m + 1))}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-orange-50 hover:bg-slate-700 active:scale-95 transition-all"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Days */}
                                    <div>
                                        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-orange-50/40">
                                            Days
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setDays((d) => Math.max(0, d - 1))}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-orange-50 hover:bg-slate-700 active:scale-95 transition-all"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                min={0}
                                                max={29}
                                                value={days}
                                                onChange={(e) =>
                                                    setDays(Math.max(0, Math.min(29, Number(e.target.value))))
                                                }
                                                className="h-10 w-14 rounded-lg bg-slate-950 border border-amber-900/30 text-center text-lg font-bold text-orange-50 outline-none focus:border-amber-600"
                                            />
                                            <button
                                                onClick={() => setDays((d) => Math.min(29, d + 1))}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-orange-50 hover:bg-slate-700 active:scale-95 transition-all"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Total days summary */}
                                <p className="mt-3 text-xs text-orange-50/40">
                                    Total:{" "}
                                    <span className="font-bold text-amber-500">{totalDays}</span>{" "}
                                    day{totalDays !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>

                        {/* CTA Footer */}
                        <div className="border-t border-white/10 bg-slate-900 p-6">
                            {cartError && (
                                <p className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                                    {cartError}
                                </p>
                            )}
                            <button
                                disabled={
                                    book.available_copies < 1 || totalDays < 1 || addingToCart
                                }
                                onClick={handleAddToCart}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none active:scale-[0.98]"
                            >
                                {addingToCart ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <ShoppingCart className="h-5 w-5" />
                                )}
                                {addingToCart
                                    ? "Adding…"
                                    : book.available_copies < 1
                                        ? "Currently Unavailable"
                                        : "Add to Cart"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
