"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Heart } from "lucide-react";
import BookSideSheet, { type Book } from "../components/BookSideSheet";

interface WishlistRow {
    id: string;
    book_id: string;
    books: Book;
}

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function WishlistPage() {
    const [rows, setRows] = useState<WishlistRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        async function fetchWishlist() {
            try {
                const res = await fetch("/api/wishlist");
                if (res.ok) {
                    const data = await res.json();
                    setRows(data);
                }
            } catch (err) {
                console.error("Failed to fetch wishlist:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchWishlist();
    }, []);

    /* ── Remove from wishlist ── */
    async function handleRemove(wishlistId: string) {
        setRemoving(wishlistId);
        try {
            const res = await fetch(`/api/wishlist?id=${wishlistId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setRows((prev) => prev.filter((r) => r.id !== wishlistId));
            }
        } catch (err) {
            console.error("Failed to remove:", err);
        } finally {
            setRemoving(null);
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
            <div className="mb-10 max-w-3xl">
                <h1 className="font-serif text-4xl font-bold text-orange-50 md:text-5xl mb-3">
                    Your Wishlist
                </h1>
                <p className="text-orange-50/60 text-lg">
                    {rows.length} book{rows.length !== 1 ? "s" : ""} saved for later.
                </p>
            </div>

            {/* Empty state */}
            {rows.length === 0 && (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10">
                        <Heart className="h-10 w-10 text-red-500/40" />
                    </div>
                    <h2 className="mb-2 font-serif text-2xl font-bold text-orange-50">
                        Nothing here yet
                    </h2>
                    <p className="max-w-sm text-sm text-orange-50/50">
                        Tap the heart icon on any book to save it to your wishlist.
                    </p>
                </div>
            )}

            {/* Wishlist Grid */}
            {rows.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {rows.map((row) => (
                        <div key={row.id} className="group relative">
                            {/* Card (click → side sheet) */}
                            <button
                                onClick={() => setSelectedBook(row.books)}
                                className="flex w-full flex-col text-left transition-transform hover:-translate-y-1"
                            >
                                <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-lg transition-all group-hover:border-amber-500/50 group-hover:shadow-amber-900/40">
                                    <img
                                        src={row.books.cover_url || PLACEHOLDER}
                                        alt={row.books.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                        }}
                                    />
                                </div>
                                <h3 className="line-clamp-2 text-sm font-bold leading-tight text-orange-50">
                                    {row.books.title}
                                </h3>
                                <p className="mt-1 truncate text-xs text-orange-50/50">
                                    {row.books.author}
                                </p>
                            </button>

                            {/* Trash overlay */}
                            <button
                                onClick={() => handleRemove(row.id)}
                                disabled={removing === row.id}
                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600 hover:text-white hover:scale-110 disabled:opacity-50"
                                aria-label="Remove from wishlist"
                            >
                                {removing === row.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Book Side Sheet */}
            <BookSideSheet
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
}
