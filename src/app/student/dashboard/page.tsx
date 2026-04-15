"use client";

import { useEffect, useState } from "react";
import { useCart } from "./cart-context";
import { useToast } from "./toast-context";
import {
    X,
    ShoppingCart,
    Minus,
    Plus,
    Loader2,
    Flame,
    Star,
    Sparkles,
    Heart,
    Book as BookIcon,
    MapPin,
    Calendar,
    AlertCircle,
    Feather
} from "lucide-react";

/* ── Types (Unchanged) ── */
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

const CURATED_COLLECTIONS = [
    { key: "Trending", label: "Trending", icon: Flame, color: "text-amber-500" },
    { key: "Teacher's Pick", label: "Scholar's Choice", icon: Star, color: "text-amber-600" },
    { key: "New Arrival", label: "Fresh Archives", icon: Sparkles, color: "text-amber-400" },
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

    // ── Logic remains untouched ──
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
                if (res.ok) showToast(`Removed from archives`, "info");
            } catch {
                setWishlistedIds((prev) => new Set(prev).add(book.id));
            }
        } else {
            setWishlistedIds((prev) => new Set(prev).add(book.id));
            try {
                const res = await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_id: book.id }),
                });
                if (res.ok) showToast(`Saved to personal collection`);
            } catch {
                setWishlistedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(book.id);
                    return next;
                });
            }
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#1a1a1a]">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#1a1a1a] relative overflow-x-hidden font-serif selection:bg-amber-900 selection:text-amber-100">
            
            {/* Background Layer (Responsive Blur) */}
            <div className="fixed inset-0 z-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 lg:opacity-20 blur-[2px] lg:blur-sm"
                    style={{ backgroundImage: "url('/images/historic-library.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/60 to-[#1a1a1a]" />
            </div>

            <div className="relative z-10 px-5 py-8 md:px-12 md:py-12 pb-32">
                
                {/* Responsive Header */}
                <div className="mb-10 md:mb-16 max-w-3xl">
                    <div className="mb-3 flex items-center gap-2 text-amber-600 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold">
                        <BookIcon size={12} className="md:w-3.5 md:h-3.5" />
                        The University Archives
                    </div>
                    <h1 className="text-3xl font-normal text-[#e8e4db] md:text-6xl mb-3 leading-tight">
                        Library <span className="italic font-serif text-stone-500">Catalogue</span>
                    </h1>
                    <p className="text-[#8c8273] text-sm md:text-lg max-w-xl font-sans font-light leading-relaxed">
                        Search the vault, check availability, and reserve Books 
                    </p>
                </div>

                {/* Carousels */}
                <div className="space-y-10 md:space-y-16">
                    {CURATED_COLLECTIONS.map(({ key, label, icon: Icon, color }) => {
                        const collectionBooks = books.filter(b =>
                            b.collections?.some(c => c.toLowerCase() === key.toLowerCase())
                        );

                        if (collectionBooks.length === 0) return null;

                        return (
                            <section key={key} className="w-full">
                                <div className="mb-4 md:mb-6 flex items-center justify-between border-b border-stone-800/60 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`h-4 w-4 md:h-5 md:w-5 ${color}`} />
                                        <h2 className="text-sm md:text-xl font-medium tracking-widest text-[#e8e4db] uppercase">
                                            {label}
                                        </h2>
                                    </div>
                                    <button className="text-[10px] uppercase tracking-tighter text-stone-500 hover:text-amber-500 transition-colors md:hidden">View All</button>
                                </div>

                                <div className="relative w-full -mx-5 px-5 md:mx-0 md:px-0">
                                    <div
                                        className="flex w-full snap-x snap-mandatory gap-5 md:gap-8 overflow-x-auto pb-4 pt-2 scrollbar-hide touch-pan-x"
                                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                    >
                                        {collectionBooks.map((book) => (
                                            <button
                                                key={book.id}
                                                onClick={() => {
                                                    setSelectedBook(book);
                                                    setDays(7);
                                                }}
                                                className="group flex w-[140px] sm:w-48 shrink-0 snap-start flex-col text-left transition-all outline-none"
                                            >
                                                <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-sm bg-stone-900 shadow-xl border border-stone-800/80 group-active:scale-95 transition-transform duration-200">
                                                    <img
                                                        src={book.cover_url || PLACEHOLDER}
                                                        alt={book.title}
                                                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                                        loading="lazy"
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                                                    />
                                                    
                                                    {/* Wishlist Icon */}
                                                    <div
                                                        role="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleWishlist(book);
                                                        }}
                                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a]/90 backdrop-blur-md border border-stone-700 active:scale-90 z-10"
                                                    >
                                                        <Heart
                                                            className={`h-3.5 w-3.5 ${wishlistedIds.has(book.id) ? "fill-amber-600 text-amber-600" : "text-stone-500"}`}
                                                        />
                                                    </div>
                                                </div>
                                                <h3 className="line-clamp-1 text-xs md:text-sm font-bold tracking-wide text-[#e8e4db]">
                                                    {book.title}
                                                </h3>
                                                <p className="mt-0.5 truncate font-sans text-[10px] text-stone-500 uppercase">
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
            </div>

            {/* ── Mobile-Responsive Side Panel / Bottom Sheet ── */}
            <div
                className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-500 ${selectedBook ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                onClick={() => setSelectedBook(null)}
            />

            <div
                className={`fixed z-50 flex flex-col bg-[#1a1a1a] border-[#3e352c] shadow-2xl transition-transform duration-500 ease-out
                    /* Mobile: Bottom Sheet */
                    bottom-0 left-0 right-0 max-h-[92vh] rounded-t-[2.5rem] border-t
                    /* Desktop: Right Panel */
                    md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[450px] md:max-h-none md:rounded-none md:border-l
                    ${selectedBook ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
                `}
            >
                {selectedBook && (
                    <>
                        {/* Drag Handle for Mobile */}
                        <div className="w-12 h-1 bg-stone-800 rounded-full mx-auto mt-4 mb-2 md:hidden" />

                        <div className="flex items-center justify-between border-b border-stone-800/60 p-6 md:p-8">
                            <div className="pr-4">
                                <h2 className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-bold mb-0.5">Archive Details</h2>
                                <p className="text-[#8c8273] text-[10px] font-sans truncate max-w-[200px]">Index: {selectedBook.isbn}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBook(null)}
                                className="rounded-full bg-stone-900 p-2.5 text-stone-500 hover:text-amber-500 border border-stone-800 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                            <div className="mb-8 flex flex-col items-center text-center">
                                <div className="mb-5 h-52 w-36 md:h-64 md:w-44 overflow-hidden rounded-sm shadow-2xl border border-stone-800/50">
                                    <img
                                        src={selectedBook.cover_url || PLACEHOLDER}
                                        alt={selectedBook.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <h3 className="mb-2 text-2xl md:text-3xl font-normal text-[#e8e4db] leading-tight px-4 italic">
                                    {selectedBook.title}
                                </h3>
                                <p className="mb-4 text-amber-700 font-medium tracking-widest uppercase text-[10px] md:text-xs">
                                    By {selectedBook.author}
                                </p>
                                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${selectedBook.available_copies > 0 ? "border-emerald-900/30 bg-emerald-950/20 text-emerald-500" : "border-red-900/30 bg-red-950/20 text-red-500"}`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${selectedBook.available_copies > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                                    {selectedBook.available_copies} of {selectedBook.total_copies} In Vault
                                </div>
                            </div>

                            {/* Info Grid (Responsive) */}
                            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
                                <div className="rounded-sm bg-stone-900/40 p-3.5 border border-stone-800/50">
                                    <span className="block text-[10px] uppercase text-stone-600 mb-1 font-bold">Location</span>
                                    <div className="flex items-center gap-2 text-stone-300 text-xs md:text-sm">
                                        <MapPin size={12} className="text-amber-800" />
                                        {selectedBook.location_alley} • {selectedBook.location_column}
                                    </div>
                                </div>
                                <div className="rounded-sm bg-stone-900/40 p-3.5 border border-stone-800/50">
                                    <span className="block text-[10px] uppercase text-stone-600 mb-1 font-bold">Category</span>
                                    <div className="text-stone-300 text-xs md:text-sm italic truncate">
                                        {selectedBook.category || "General Studies"}
                                    </div>
                                </div>
                            </div>

                            {/* Loan Duration Selection */}
                            <div className="bg-stone-900/20 p-5 rounded-2xl border border-stone-800/40 mb-4">
                                <label className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                                    <Calendar size={12} className="text-amber-800" />
                                    Borrowing Duration
                                </label>

                                <div className="space-y-5">
                                    {/* Months Selector */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-stone-400 font-sans">Months</span>
                                        <div className="flex items-center gap-3 bg-stone-950 p-1 rounded-lg border border-stone-800">
                                            <button onClick={() => setMonths((m) => Math.max(0, m - 1))} className="p-2 text-stone-500 hover:text-amber-500"><Minus size={14}/></button>
                                            <span className="w-6 text-center text-sm font-bold text-amber-600">{months}</span>
                                            <button onClick={() => setMonths((m) => Math.min(12, m + 1))} className="p-2 text-stone-500 hover:text-amber-500"><Plus size={14}/></button>
                                        </div>
                                    </div>
                                    {/* Days Selector */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-stone-400 font-sans">Days</span>
                                        <div className="flex items-center gap-3 bg-stone-950 p-1 rounded-lg border border-stone-800">
                                            <button onClick={() => setDays((d) => Math.max(0, d - 1))} className="p-2 text-stone-500 hover:text-amber-500"><Minus size={14}/></button>
                                            <span className="w-6 text-center text-sm font-bold text-amber-600">{days}</span>
                                            <button onClick={() => setDays((d) => Math.min(29, d + 1))} className="p-2 text-stone-500 hover:text-amber-500"><Plus size={14}/></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-stone-800/50 flex justify-between items-center uppercase tracking-widest text-[9px]">
                                    <span className="text-stone-600 font-bold">Total Duration</span>
                                    <span className="text-amber-600 font-bold">{totalDays} Days</span>
                                </div>
                            </div>
                        </div>

                        {/* Responsive Fixed Action Footer */}
                        <div className="border-t border-stone-800 bg-[#1a1a1a] p-6 md:p-8">
                            {cartError && (
                                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/40 px-4 py-3 text-[10px] text-red-400 font-sans">
                                    <AlertCircle size={12} className="shrink-0" />
                                    {cartError}
                                </div>
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
                                            setCartError(data.error || "Request failed.");
                                        } else {
                                            refreshCart();
                                            setSelectedBook(null);
                                            setMonths(0);
                                            setDays(7);
                                            showToast("Book is added to your cart");
                                        }
                                    } catch {
                                        setCartError("Connection error.");
                                    } finally {
                                        setAddingToCart(false);
                                    }
                                }}
                                className="flex w-full items-center justify-center gap-3 bg-amber-800 hover:bg-amber-700 disabled:bg-stone-900 disabled:text-stone-700 active:scale-[0.97] transition-all px-6 py-4 font-bold text-amber-50 uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl border border-amber-600/20 rounded-xl md:rounded-sm"
                            >
                                {addingToCart ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ShoppingCart className="h-4 w-4" />
                                )}
                                {addingToCart
                                    ? "Inscribing..."
                                    : selectedBook.available_copies < 1
                                        ? "Out of Circulation"
                                        : "Add to Cart"}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Global Smooth Scroll Fixes */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}