"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Search,
    Loader2,
    MapPin,
    BookOpen,
    X,
} from "lucide-react";

/* ── Types ── */
interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    cover_url: string | null;
    category: string | null;
    location_alley: string | null;
    location_column: string | null;
    location_shelf: string | null;
}

/* ── Location parser: "C3" → [3], "C1 to C3" → [1,2,3] ── */
function parseLocationRange(value: string | null): number[] {
    if (!value) return [];
    const cleaned = value.replace(/\s+/g, " ").trim();
    const rangeMatch = cleaned.match(/[A-Za-z]?(\d+)\s*(?:to|-)\s*[A-Za-z]?(\d+)/i);
    if (rangeMatch) {
        const s = parseInt(rangeMatch[1], 10);
        const e = parseInt(rangeMatch[2], 10);
        const nums: number[] = [];
        for (let i = Math.min(s, e); i <= Math.max(s, e); i++) nums.push(i);
        return nums;
    }
    const single = cleaned.match(/[A-Za-z]?(\d+)/);
    return single ? [parseInt(single[1], 10)] : [];
}

const COLS = 6;
const ROWS = 6;

export default function LibraryMapPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/books");
                if (res.ok) setBooks(await res.json());
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const q = query.trim().toLowerCase();
    const results = useMemo(() => {
        if (!q) return [];
        return books.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.isbn.toLowerCase().includes(q) ||
            (b.category && b.category.toLowerCase().includes(q))
        ).slice(0, 8);
    }, [q, books]);

    const activeCols = useMemo(() => parseLocationRange(selectedBook?.location_column ?? null), [selectedBook]);
    const activeRows = useMemo(() => parseLocationRange(selectedBook?.location_shelf ?? null), [selectedBook]);

    function select(book: Book) {
        setSelectedBook(book);
        setQuery("");
        setDropdownOpen(false);
    }

    return (
        <div className="w-full overflow-x-hidden px-4 py-8 md:px-8 pb-32">
            {/* Header */}
            <div className="mb-8 max-w-3xl">
                <h1 className="font-serif text-4xl font-bold text-orange-50 md:text-5xl mb-3">Library Map</h1>
                <p className="text-orange-50/60 text-lg">Search for a book to locate it on the shelf map.</p>
            </div>

            {/* Search */}
            <div className="relative mb-10 max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-50/30" />
                <input
                    type="text"
                    placeholder="Search by title, author, or ISBN…"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setDropdownOpen(true); }}
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full rounded-2xl bg-white/[0.04] border border-white/10 py-4 pl-12 pr-4 text-lg text-orange-50 outline-none placeholder:text-orange-50/25 focus:border-amber-600 focus:bg-white/[0.06] transition-all"
                />
                {dropdownOpen && q && results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
                        {results.map(book => (
                            <button key={book.id} onClick={() => select(book)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] border-b border-white/5 last:border-b-0">
                                <BookOpen className="h-4 w-4 shrink-0 text-amber-600/60" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-orange-50">{book.title}</p>
                                    <p className="truncate text-xs text-orange-50/40">{book.author}</p>
                                </div>
                                {book.location_column && (
                                    <span className="shrink-0 rounded-full bg-amber-600/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                                        {book.location_alley} · {book.location_column} · {book.location_shelf}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
                {dropdownOpen && q && results.length === 0 && !loading && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-white/10 bg-slate-900 px-5 py-6 text-center shadow-2xl">
                        <p className="text-sm text-orange-50/40">No books found.</p>
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
                </div>
            )}

            {/* Empty state */}
            {!loading && !selectedBook && (
                <div className="mt-12 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10">
                        <MapPin className="h-10 w-10 text-amber-600/40" />
                    </div>
                    <h2 className="mb-2 font-serif text-2xl font-bold text-orange-50">Find a book on the map</h2>
                    <p className="max-w-sm text-sm text-orange-50/50">Search above to see exact alley, column, and shelf coordinates.</p>
                </div>
            )}

            {/* ═══ Selected Book: Coordinates + Minimap ═══ */}
            {!loading && selectedBook && (
                <div>
                    {/* Coordinates Card */}
                    <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="min-w-0 flex-1">
                                <h2 className="font-serif text-xl font-bold text-orange-50 mb-1 line-clamp-2">{selectedBook.title}</h2>
                                <p className="text-sm text-amber-600">{selectedBook.author}</p>
                            </div>
                            <button onClick={() => setSelectedBook(null)} className="ml-4 shrink-0 rounded-full bg-white/5 p-2 text-orange-50/50 hover:bg-white/10 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Big coordinate badges */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center rounded-xl bg-slate-900 border border-white/5 p-4">
                                <span className="text-[10px] font-medium uppercase tracking-widest text-orange-50/30 mb-1">Alley</span>
                                <span className="text-2xl font-bold text-amber-500">{selectedBook.location_alley ?? "—"}</span>
                            </div>
                            <div className="flex flex-col items-center rounded-xl bg-slate-900 border border-white/5 p-4">
                                <span className="text-[10px] font-medium uppercase tracking-widest text-orange-50/30 mb-1">Column</span>
                                <span className="text-2xl font-bold text-amber-500">{selectedBook.location_column ?? "—"}</span>
                            </div>
                            <div className="flex flex-col items-center rounded-xl bg-slate-900 border border-white/5 p-4">
                                <span className="text-[10px] font-medium uppercase tracking-widest text-orange-50/30 mb-1">Shelf</span>
                                <span className="text-2xl font-bold text-amber-500">{selectedBook.location_shelf ?? "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Minimap */}
                    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 md:p-6">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-orange-50/40">
                            Shelf Map — Alley {selectedBook.location_alley ?? "—"}
                        </h3>

                        {/* Column headers */}
                        <div className="mb-2 grid gap-1.5 md:gap-2" style={{ gridTemplateColumns: `2rem repeat(${COLS}, 1fr)` }}>
                            <div />
                            {Array.from({ length: COLS }, (_, i) => {
                                const n = i + 1;
                                const active = activeCols.includes(n);
                                return (
                                    <div key={`h-${n}`} className={`text-center text-[11px] font-bold py-1 rounded-md transition-colors ${active ? "text-amber-400 bg-amber-500/10" : "text-orange-50/20"}`}>
                                        C{n}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid rows */}
                        {Array.from({ length: ROWS }, (_, si) => {
                            const shelfNum = si + 1;
                            const shelfActive = activeRows.includes(shelfNum);
                            return (
                                <div key={`r-${shelfNum}`} className="mb-1.5 grid gap-1.5 md:gap-2 items-center" style={{ gridTemplateColumns: `2rem repeat(${COLS}, 1fr)` }}>
                                    {/* Row label */}
                                    <div className={`text-[11px] font-bold text-right pr-1 ${shelfActive ? "text-amber-400" : "text-orange-50/20"}`}>
                                        S{shelfNum}
                                    </div>
                                    {Array.from({ length: COLS }, (_, ci) => {
                                        const colNum = ci + 1;
                                        const hit = activeCols.includes(colNum) && shelfActive;
                                        return (
                                            <div
                                                key={`c-${colNum}-${shelfNum}`}
                                                className={`flex items-center justify-center rounded-md border transition-all ${hit
                                                        ? "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                                        : "bg-slate-950/60 border-white/5"
                                                    }`}
                                                style={{ aspectRatio: "2.2 / 1", minHeight: "32px" }}
                                            >
                                                {hit && (
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-orange-50/40">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded border border-amber-500 bg-amber-500/20 shadow-[0_0_6px_rgba(245,158,11,0.4)]">
                                <span className="h-1 w-1 rounded-full bg-amber-500" />
                            </span>
                            <span>Book location</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-3.5 w-3.5 rounded border border-white/5 bg-slate-950/60" />
                            <span>Empty shelf</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
