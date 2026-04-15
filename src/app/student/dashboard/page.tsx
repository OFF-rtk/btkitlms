"use client";

import { useEffect, useState } from "react";
import { useToast } from "./toast-context";
import {
    Loader2,
    Flame,
    Star,
    Sparkles,
    Heart,
} from "lucide-react";
import BookSideSheet, { type Book } from "./components/BookSideSheet";

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

/* ── The exactly three curated collections ── */
const CURATED_COLLECTIONS = [
    { key: "Trending", label: "Trending Now", icon: Flame, color: "text-rose-500" },
    { key: "Teacher's Pick", label: "Teacher's Picks", icon: Star, color: "text-amber-500" },
    { key: "New Arrival", label: "New Arrivals", icon: Sparkles, color: "text-sky-400" },
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
                    const collectionBooks = books.filter((b) =>
                        b.collections?.some((c) => c.toLowerCase() === key.toLowerCase())
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

                            <div className="relative w-full">
                                <div
                                    className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide [&::-webkit-scrollbar]:hidden"
                                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                >
                                    {collectionBooks.map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => setSelectedBook(book)}
                                            className="group flex w-44 shrink-0 snap-start flex-col text-left transition-transform hover:-translate-y-1"
                                        >
                                            <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-lg transition-all group-hover:border-amber-500/50 group-hover:shadow-amber-900/40">
                                                <img
                                                    src={book.cover_url || PLACEHOLDER}
                                                    alt={book.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                                    }}
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
                                                    aria-label={
                                                        wishlistedIds.has(book.id)
                                                            ? "Remove from wishlist"
                                                            : "Add to wishlist"
                                                    }
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

            {/* ── Book Side Sheet ── */}
            <BookSideSheet
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
}