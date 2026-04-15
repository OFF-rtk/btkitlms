"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Heart, BookOpen } from "lucide-react";
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
            <div className="flex h-screen w-full items-center justify-center bg-[#1a1a1a]">
                <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
            </div>
        );
    }

    return (
        /* Background updated to #1a1a1a for dashboard consistency */
        <div className="w-full min-h-screen bg-[#1a1a1a] overflow-x-hidden px-5 py-8 md:px-12 md:py-12 pb-32 font-serif selection:bg-amber-900/30">
            
            {/* Header matches Dashboard/Search Typography */}
            <div className="mb-10 md:mb-16 max-w-4xl">
                <div className="mb-4 flex items-center gap-3 text-amber-700 uppercase tracking-[0.4em] text-[10px] md:text-xs font-black">
                    <BookOpen size={14} className="opacity-70" />
                    Personal Collection
                </div>
                <h1 className="text-3xl font-normal text-[#e8e4db] md:text-6xl mb-3 leading-tight tracking-tight">
                    <span className="italic font-serif text-stone-500">Wishlist</span>
                </h1>
                <p className="text-[#8c8273] text-sm md:text-lg max-w-xl font-sans font-light leading-relaxed">
                    {rows.length} manuscript{rows.length !== 1 ? "s" : ""} currently preserved in your private archives.
                </p>
            </div>

            {/* Empty state - Themed */}
            {rows.length === 0 && (
                <div className="mt-20 flex flex-col items-center justify-center text-center">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-stone-800 bg-stone-950/40">
                        <Heart className="h-10 w-10 text-stone-800" />
                    </div>
                    <h2 className="mb-2 text-2xl font-normal text-[#e8e4db] italic">
                        The archives are empty
                    </h2>
                    <p className="max-w-sm text-sm text-stone-600 font-sans tracking-wide">
                        Explore the vault and tap the heart to save manuscripts for later study.
                    </p>
                </div>
            )}

            {/* Wishlist Grid - Card styling matches Dashboard/Search */}
            {rows.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                    {rows.map((row) => (
                        <div key={row.id} className="group relative">
                            {/* Card Wrapper */}
                            <button
                                onClick={() => setSelectedBook(row.books)}
                                className="flex w-full flex-col text-left transition-all outline-none"
                            >
                                <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-sm bg-stone-900 shadow-xl border border-stone-800/80 transition-transform duration-200 group-active:scale-95 group-hover:border-amber-900/40">
                                    <img
                                        src={row.books.cover_url || PLACEHOLDER}
                                        alt={row.books.title}
                                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                        }}
                                    />
                                </div>
                                <h3 className="line-clamp-1 text-xs md:text-sm font-bold tracking-wide text-[#e8e4db] transition-colors group-hover:text-amber-500">
                                    {row.books.title}
                                </h3>
                                <p className="mt-0.5 truncate font-sans text-[10px] text-stone-500 uppercase tracking-widest">
                                    {row.books.author}
                                </p>
                            </button>

                            {/* Trash/Remove Action - Minimalist scholarly style */}
                            <button
                                onClick={() => handleRemove(row.id)}
                                disabled={removing === row.id}
                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-stone-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500 border border-white/5 disabled:opacity-50"
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

            {/* Book Detail Sheet */}
            <BookSideSheet
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
}