"use client";

import { useEffect, useState } from "react";

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
import BookSideSheet, { type Book } from "./components/BookSideSheet";

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

const CURATED_COLLECTIONS = [
    { key: "Trending", label: "Trending", icon: Flame, color: "text-amber-500" },
    { key: "Teacher's Pick", label: "Scholar's Choice", icon: Star, color: "text-amber-600" },
    { key: "New Arrival", label: "Fresh Archives", icon: Sparkles, color: "text-amber-400" },
];

export default function StudentDashboardPage() {
    const { showToast } = useToast();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

    

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

            {/* ── Book Side Sheet ── */}
            <BookSideSheet
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
}