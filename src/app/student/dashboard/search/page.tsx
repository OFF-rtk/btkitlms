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
        /* Background set to #1a1a1a to match the Student Dashboard shade, 
           creating the correct visual separation from the sidebar.
        */
        <div className="w-full min-h-screen bg-[#1a1a1a] overflow-x-hidden px-5 py-8 md:px-12 md:py-12 pb-32 font-serif">
            
            {/* Header matches Dashboard Typography */}
            <div className="mb-10 md:mb-16 max-w-3xl">
                <h1 className="text-3xl font-normal text-[#e8e4db] md:text-6xl mb-3 leading-tight tracking-tight">
                    <span className="italic font-serif text-stone-500">Search</span>
                </h1>
                <p className="text-[#8c8273] text-sm md:text-lg max-w-xl font-sans font-light leading-relaxed">
                    Find any book by title, author, category, or ISBN.
                </p>
            </div>

            {/* Search Input - Adjusted for the #1a1a1a background */}
            <div className="relative mb-12 max-w-2xl">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-600" />
                <input
                    type="text"
                    placeholder="Search books…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-xl bg-stone-900/50 border border-stone-800 py-4 pl-12 pr-4 text-lg text-[#e8e4db] outline-none placeholder:text-stone-700 focus:border-amber-900/50 transition-all shadow-xl font-sans"
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
                    <SearchIcon className="mb-4 h-12 w-12 text-stone-800" />
                    <p className="font-serif text-xl text-stone-600 italic">
                        {q ? "No manuscripts found" : "Catalog is empty"}
                    </p>
                </div>
            )}

            {/* Book Grid - Card styling matches Dashboard */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                    {filtered.map((book) => (
                        <button
                            key={book.id}
                            onClick={() => setSelectedBook(book)}
                            className="group flex flex-col text-left transition-all outline-none"
                        >
                            <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-sm bg-stone-900 shadow-xl border border-stone-800/80 transition-transform duration-200 group-active:scale-95">
                                <img
                                    src={book.cover_url || PLACEHOLDER}
                                    alt={book.title}
                                    className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                    }}
                                />
                                {book.available_copies < 1 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-900/30 px-2 py-1 bg-red-950/20">
                                            Out of stock
                                        </span>
                                    </div>
                                )}
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
            )}

            {/* Book Side Sheet */}
            <BookSideSheet
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
}