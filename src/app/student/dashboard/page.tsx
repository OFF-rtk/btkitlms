"use client";

import { useEffect, useState } from "react";
import { useCart } from "./cart-context";
import { useToast } from "./toast-context";
import {
    X,
    ShoppingCart,
    ChevronRight,
    Minus,
    Plus,
    Loader2,
    Flame,
    Star,
    Sparkles,
    Heart,
} from "lucide-react";

/* ── Types ── */
interface Book {
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

const PLACEHOLDER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

/* ── The exactly three curated collections ── */
const CURATED_COLLECTIONS = [
    { key: "Trending", label: "Trending Now", icon: Flame, color: "text-rose-500" },
    { key: "Teacher's Pick", label: "Teacher's Picks", icon: Star, color: "text-amber-500" },
    { key: "New Arrival", label: "New Arrivals", icon: Sparkles, color: "text-sky-400" },
];

export default function StudentDashboardPage() {
    const { refreshCart } = useCart();
    const { showToast } = useToast();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [months, setMonths] = useState(0);
    const [days, setDays] = useState(7);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartError, setCartError] = useState("");
    const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

    /* Total days = months * 30 + days (sent to the database) */
    const totalDays = months * 30 + days;

    useEffect(() => {
        async function fetchBooks() {
            try {
                const res = await fetch("/api/books");
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                }
            } catch (err) {
                console.error("Failed to fetch books:", err);
            } finally {
                setLoading(false);
            }
        }

        async function fetchWishlist() {
            try {
                const res = await fetch("/api/wishlist");
                if (res.ok) {
                    const data: { id: string; book_id: string }[] = await res.json();
                    setWishlistedIds(new Set(data.map((w) => w.book_id)));
                }
            } catch (err) {
                console.error("Failed to fetch wishlist:", err);
            }
        }

        fetchBooks();
        fetchWishlist();
    }, []);

    /* ── Toggle wishlist ── */
    async function toggleWishlist(book: Book) {
        const isWishlisted = wishlistedIds.has(book.id);

        if (isWishlisted) {
            setWishlistedIds((prev) => {
                const next = new Set(prev);
                next.delete(book.id);
                return next;
            });
            try {
                const res = await fetch(`/api/wishlist?book_id=${book.id}`, { method: "DELETE" });
                if (res.ok) {
                    showToast(`Removed "${book.title}" from wishlist`, "info");
                } else {
                    setWishlistedIds((prev) => new Set(prev).add(book.id));
                    showToast("Failed to remove from wishlist", "error");
                }
            } catch {
                setWishlistedIds((prev) => new Set(prev).add(book.id));
                showToast("Something went wrong", "error");
            }
        } else {
            setWishlistedIds((prev) => new Set(prev).add(book.id));
            try {
                const res = await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_id: book.id }),
                });
                if (res.ok) {
                    showToast(`Added "${book.title}" to wishlist`);
                } else {
                    setWishlistedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(book.id);
                        return next;
                    });
                    const data = await res.json();
                    showToast(data.error || "Failed to add to wishlist", "error");
                }
            } catch {
                setWishlistedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(book.id);
                    return next;
                });
                showToast("Something went wrong", "error");
            }
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        // The overflow-x-hidden here is the ultimate safeguard against horizontal scrolling on the main page.
        <div className="w-full overflow-x-hidden px-4 py-8 md:px-8 pb-32">

            {/* Header */}
            <div className="mb-12 max-w-3xl">
                <h1 className="font-serif text-4xl font-bold text-orange-50 md:text-5xl mb-3">
                    Library Catalog
                </h1>
                <p className="text-orange-50/60 text-lg">
                    Discover your next read from our curated collections.
                </p>
            </div>

            {/* Carousels */}
            <div className="space-y-12">
                {CURATED_COLLECTIONS.map(({ key, label, icon: Icon, color }) => {
                    // Filter books where the collections array contains this key
                    const collectionBooks = books.filter(b =>
                        b.collections?.some(c => c.toLowerCase() === key.toLowerCase())
                    );

                    if (collectionBooks.length === 0) return null;

                    return (
                        <section key={key} className="w-full">
                            <div className="mb-5 flex items-center gap-3">
                                <Icon className={`h-6 w-6 ${color}`} />
                                <h2 className="font-serif text-2xl font-bold text-orange-50">
                                    {label}
                                </h2>
                            </div>

                            {/* The Scrolling Container */}
                            <div className="relative w-full">
                                <div
                                    className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide [&::-webkit-scrollbar]:hidden"
                                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                >
                                    {collectionBooks.map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => {
                                                setSelectedBook(book);
                                                setDays(7); // Reset days when opening a new book
                                            }}
                                            // shrink-0 prevents the card from crushing, w-44 locks the width
                                            className="group flex w-44 shrink-0 snap-start flex-col text-left transition-transform hover:-translate-y-1"
                                        >
                                            <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-lg transition-all group-hover:border-amber-500/50 group-hover:shadow-amber-900/40">
                                                <img
                                                    src={book.cover_url || PLACEHOLDER}
                                                    alt={book.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                                                />
                                                {/* Wishlist heart */}
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(book);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.stopPropagation();
                                                            toggleWishlist(book);
                                                        }
                                                    }}
                                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 cursor-pointer z-10"
                                                    aria-label={wishlistedIds.has(book.id) ? "Remove from wishlist" : "Add to wishlist"}
                                                >
                                                    <Heart
                                                        className={`h-4 w-4 transition-colors ${wishlistedIds.has(book.id)
                                                                ? "fill-red-500 text-red-500"
                                                                : "text-white/70"
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-orange-50">
                                                {book.title}
                                            </h3>
                                            <p className="mt-1 truncate text-xs text-orange-50/50">
                                                {book.author}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* ── Slide-Over Side / Bottom Sheet ── */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${selectedBook ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                onClick={() => setSelectedBook(null)}
            />

            {/* Panel */}
            <div
                className={`fixed z-50 flex flex-col bg-slate-900 border-white/10 shadow-2xl transition-transform duration-300 ease-in-out
                    /* Mobile: Bottom Sheet */
                    bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl border-t
                    /* Desktop: Right Panel */
                    md:top-0 md:bottom-auto md:right-0 md:left-auto md:h-screen md:w-[420px] md:max-h-none md:rounded-none md:border-l md:border-t-0
                    ${selectedBook ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"}
                `}
            >
                {selectedBook && (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 p-6">
                            <h2 className="font-serif text-xl font-bold text-orange-50">Details</h2>
                            <button
                                onClick={() => setSelectedBook(null)}
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
                                        src={selectedBook.cover_url || PLACEHOLDER}
                                        alt={selectedBook.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h3 className="mb-1 font-serif text-2xl font-bold leading-tight text-orange-50">
                                        {selectedBook.title}
                                    </h3>
                                    <p className="mb-3 text-sm text-amber-600 font-medium">
                                        {selectedBook.author}
                                    </p>
                                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${selectedBook.available_copies > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                        {selectedBook.available_copies} / {selectedBook.total_copies} Available
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="mb-8 space-y-2 rounded-xl bg-slate-950/50 p-4 border border-white/5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-50/50">ISBN</span>
                                    <span className="font-medium text-orange-50">{selectedBook.isbn}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-orange-50/50">Category</span>
                                    <span className="font-medium text-orange-50">{selectedBook.category || "General"}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-white/5 mt-2">
                                    <span className="text-orange-50/50">Location Map</span>
                                    <span className="font-medium text-orange-50">
                                        {selectedBook.location_alley} • {selectedBook.location_column}
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
                                        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-orange-50/40">Months</span>
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
                                                onChange={(e) => setMonths(Math.max(0, Math.min(12, Number(e.target.value))))}
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
                                        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-orange-50/40">Days</span>
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
                                                onChange={(e) => setDays(Math.max(0, Math.min(29, Number(e.target.value))))}
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
                                    Total: <span className="font-bold text-amber-500">{totalDays}</span> day{totalDays !== 1 ? "s" : ""}
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
                                disabled={selectedBook.available_copies < 1 || totalDays < 1 || addingToCart}
                                onClick={async () => {
                                    setAddingToCart(true);
                                    setCartError("");
                                    try {
                                        const res = await fetch("/api/cart", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                book_id: selectedBook.id,
                                                requested_days: totalDays,
                                            }),
                                        });
                                        const data = await res.json();
                                        if (!res.ok) {
                                            setCartError(data.error || "Failed to add to cart.");
                                        } else {
                                            refreshCart();
                                            setSelectedBook(null);
                                            setMonths(0);
                                            setDays(7);
                                            setCartError("");
                                        }
                                    } catch {
                                        setCartError("Something went wrong. Please try again.");
                                    } finally {
                                        setAddingToCart(false);
                                    }
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none active:scale-[0.98]"
                            >
                                {addingToCart ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <ShoppingCart className="h-5 w-5" />
                                )}
                                {addingToCart
                                    ? "Adding…"
                                    : selectedBook.available_copies < 1
                                        ? "Currently Unavailable"
                                        : "Add to Cart"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}