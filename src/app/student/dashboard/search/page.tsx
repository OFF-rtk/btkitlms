"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import BookSideSheet, { type Book } from "../components/BookSideSheet";

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function SearchPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
        fetchBooks();
    }, []);

    /* ── Local filter ── */
    const q = query.trim().toLowerCase();
    const filtered = q
        ? books.filter(
            (b) =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                (b.category && b.category.toLowerCase().includes(q)) ||
                b.isbn.toLowerCase().includes(q)
        )
        : books;

    return (
        <div className="w-full overflow-x-hidden px-4 py-8 md:px-8 pb-32">
            {/* Header */}
            <div className="mb-8 max-w-3xl">
                <h1 className="font-serif text-4xl font-bold text-orange-50 md:text-5xl mb-3">
                    Search
                </h1>
                <p className="text-orange-50/60 text-lg">
                    Find any book by title, author, category, or ISBN.
                </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-10 max-w-2xl">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-50/30" />
                <input
                    type="text"
                    placeholder="Search books…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-2xl bg-white/[0.04] border border-white/10 py-4 pl-12 pr-4 text-lg text-orange-50 outline-none placeholder:text-orange-50/25 focus:border-amber-600 focus:bg-white/[0.06] transition-all"
                    autoFocus
                />
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
                </div>
            )}

            {/* No results */}
            {!loading && filtered.length === 0 && (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <SearchIcon className="mb-4 h-12 w-12 text-orange-50/15" />
                    <p className="font-serif text-xl font-bold text-orange-50/50">
                        {q ? "No books match your search" : "No books in the catalog"}
                    </p>
                    {q && (
                        <p className="mt-2 text-sm text-orange-50/30">
                            Try a different title, author, or ISBN.
                        </p>
                    )}
                </div>
            )}

            {/* Book Grid */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filtered.map((book) => (
                        <button
                            key={book.id}
                            onClick={() => setSelectedBook(book)}
                            className="group flex flex-col text-left transition-transform hover:-translate-y-1"
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
                                {/* Availability badge */}
                                {book.available_copies < 1 && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6">
                                        <span className="text-[11px] font-bold text-red-400">
                                            Out of stock
                                        </span>
                                    </div>
                                )}
                            </div>
                            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-orange-50">
                                {book.title}
                            </h3>
                            <p className="mt-1 truncate text-xs text-orange-50/50">
                                {book.author}
                            </p>
                            {book.category && (
                                <p className="mt-0.5 truncate text-[11px] text-amber-600/60">
                                    {book.category}
                                </p>
                            )}
                        </button>
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
