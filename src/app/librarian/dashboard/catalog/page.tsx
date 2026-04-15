"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Edit2, BookOpen, Search } from "lucide-react";
import EditBookSideSheet, { type Book } from "../components/EditBookSideSheet";
import AddBookSideSheet from "../components/AddBookSideSheet";

const PLACEHOLDER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function CatalogPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [search, setSearch] = useState("");

    const fetchBooks = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/books");
            if (res.ok) setBooks(await res.json());
        } catch (err) { console.error("Failed to fetch books:", err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    function openEdit(book: Book) { setSelectedBook(book); setIsEditOpen(true); }
    function closeEdit() { setIsEditOpen(false); setSelectedBook(null); }

    if (loading) return (
        /* Matching the dashboard background during loading as well */
        <div className="flex h-screen w-full items-center justify-center bg-[#1a1a1a]">
            <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
        </div>
    );

    return (
        /* CRITICAL UPDATE: Background set to #1a1a1a 
           to match the exact shade of the Student Dashboard.
        */
        <div className="w-full min-h-screen bg-[#1a1a1a] px-6 py-8 md:px-12 md:py-12 pb-32 font-serif selection:bg-amber-900/40">
            
            {/* ── Header: Matching Dashboard Typography ── */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-stone-800/60 pb-8">
                <div>
                    <h1 className="text-4xl font-normal text-[#e8e4db] md:text-5xl mb-1 leading-tight tracking-tight">
                        Inventory <span className="italic text-stone-500">Catalog</span>
                    </h1>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-stone-600 mt-2">
                        {books.length} volume{books.length !== 1 ? "s" : ""} registered
                    </p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center justify-center gap-2.5 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/30 px-6 py-3.5 font-sans text-[10px] font-black uppercase tracking-[0.2em] text-amber-50 shadow-2xl transition-all hover:brightness-110 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" /> Add New Book
                </button>
            </div>

            {/* ── Search Bar: Adjusted for #1a1a1a background ── */}
            {books.length > 0 && (
                <div className="mb-8 relative max-w-2xl">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, author, or ISBN…"
                        className="w-full bg-stone-900/40 border border-stone-800 pl-11 pr-4 py-3.5 text-sm text-stone-300 font-sans outline-none focus:border-amber-900/50 transition-colors placeholder:text-stone-700 shadow-inner"
                    />
                </div>
            )}

            {/* ── Empty State ── */}
            {books.length === 0 && (
                <div className="mt-20 flex flex-col items-center justify-center text-center">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-stone-800 bg-stone-900/40 shadow-inner">
                        <BookOpen className="h-10 w-10 text-stone-800" />
                    </div>
                    <h2 className="mb-3 text-2xl font-normal text-[#e8e4db] italic tracking-tight">No books yet</h2>
                    <p className="mb-10 max-w-sm text-sm text-stone-600 font-sans leading-relaxed tracking-wide font-light">
                        Start building your library catalog by adding the first book.
                    </p>
                </div>
            )}

            {/* ── Table: Matching the high-end registry feel ── */}
            {books.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-stone-800">
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Cover</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Title</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans hidden md:table-cell">Author</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans text-center">Total</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans text-center">Avail.</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans hidden lg:table-cell">Collections</th>
                                <th className="pb-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-900/50">
                            {books.filter((b) => {
                                if (!search.trim()) return true;
                                const q = search.toLowerCase();
                                return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q);
                            }).map((book) => (
                                <tr key={book.id} className="hover:bg-stone-900/30 transition-colors group border-b border-stone-900/30">
                                    <td className="py-4 pr-4">
                                        <div className="h-14 w-10 overflow-hidden border border-stone-800 shadow-md bg-stone-950">
                                            <img 
                                                src={book.cover_url || PLACEHOLDER} 
                                                alt="" 
                                                className="h-full w-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                                            />
                                        </div>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <p className="text-sm text-[#e8e4db] italic tracking-tight line-clamp-1">{book.title}</p>
                                        <p className="text-[9px] text-stone-600 font-mono tracking-widest mt-0.5 uppercase">{book.isbn}</p>
                                    </td>
                                    <td className="py-4 pr-4 hidden md:table-cell">
                                        <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.12em]">{book.author}</p>
                                    </td>
                                    <td className="py-4 pr-4 text-center text-sm text-stone-500 font-sans">{book.total_copies}</td>
                                    <td className="py-4 pr-4 text-center">
                                        <span className={`text-sm font-bold ${book.available_copies > 0 ? "text-emerald-700" : "text-red-900"}`}>
                                            {book.available_copies}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(book.collections || []).map((c) => (
                                                <span key={c} className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-amber-950/10 border border-amber-900/20 text-amber-800">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <button
                                            onClick={() => openEdit(book)}
                                            className="flex h-8 w-8 items-center justify-center text-stone-700 hover:text-amber-600 transition-all hover:bg-amber-900/10 rounded-full"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Side Sheets */}
            <EditBookSideSheet book={selectedBook} isOpen={isEditOpen} onClose={closeEdit} onUpdated={fetchBooks} />
            <AddBookSideSheet isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); fetchBooks(); }} />
        </div>
    );
}