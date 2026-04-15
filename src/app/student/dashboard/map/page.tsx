"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Search,
    Loader2,
    MapPin,
    BookOpen,
    X,
    MoveUp,
    Compass
} from "lucide-react";

interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    location_alley: string | null;
}

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
            b.isbn.toLowerCase().includes(q)
        ).slice(0, 6);
    }, [q, books]);

    function select(book: Book) {
        setSelectedBook(book);
        setQuery("");
        setDropdownOpen(false);
    }

    // Helper to check if an alley number matches the selected book's location
    const isAlleySelected = (num: number) => {
        if (!selectedBook?.location_alley) return false;
        const loc = selectedBook.location_alley.toUpperCase();
        return loc === `ALLEY ${num}` || loc === `A${num}`;
    };

    return (
        <div className="min-h-screen w-full bg-[#1a1a1a] text-[#e8e4db] px-6 py-10 md:px-16 font-serif">
            {/* Header */}
            <div className="mb-12 max-w-4xl">
                <div className="flex items-center gap-3 text-amber-700 uppercase tracking-[0.4em] text-[10px] font-black mb-3">
                    <Compass size={14} className="animate-pulse" />
                    Navigation Registry
                </div>
                <h1 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight mb-4">
                    Library <span className="italic font-serif text-stone-500">Map</span>
                </h1>
                <p className="text-[#8c8273] text-sm md:text-lg max-w-xl font-sans font-light leading-relaxed border-l border-stone-800/50 pl-6">
                    Orient yourself from the central Admin Desk. Search for a book to illuminate its corresponding corridor.
                </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-16 max-w-2xl group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-600 group-focus-within:text-amber-600 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by Title or ISBN to locate..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setDropdownOpen(true); }}
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full bg-stone-900/40 border border-stone-800 py-5 pl-14 pr-6 rounded-sm text-lg outline-none focus:border-amber-900/50 transition-all font-sans"
                />
                
                {/* Search Dropdown */}
                {dropdownOpen && q && results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-[#0d0d0d] border border-stone-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {results.map(book => (
                            <button key={book.id} onClick={() => select(book)} className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-amber-900/10 transition-colors border-b border-stone-900 last:border-0">
                                <BookOpen className="h-4 w-4 text-amber-700" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold">{book.title}</p>
                                    <p className="truncate text-[10px] uppercase tracking-widest text-stone-500">{book.author}</p>
                                </div>
                                <span className="text-[10px] font-black text-amber-600 uppercase">{book.location_alley}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── THE ARCHITECTURAL MAP ── */}
            <div className="relative w-full max-w-5xl mx-auto aspect-[4/3] bg-[#141414] border border-stone-900 rounded-sm shadow-inner p-10 overflow-hidden">
                
                {/* Compass/Grid Lines Backdrop */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e8e4db 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Legend */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-stone-600">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-600/80 rounded-full" /> Admin Desk</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-600 rounded-sm" /> Target Alley</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-stone-800 rounded-sm border border-stone-700" /> Collection</div>
                </div>

                {/* Entrance (Bottom Center) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="h-1 w-20 bg-stone-800 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-700">Main Entrance</span>
                    <MoveUp className={`mt-2 text-stone-800 ${selectedBook ? 'animate-bounce text-amber-900' : ''}`} size={20} />
                </div>

                {/* ── The Centerpiece: Admin Desk ── */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-24 h-14 bg-amber-900/20 border-2 border-amber-700/50 shadow-[0_0_30px_rgba(180,83,9,0.1)] flex items-center justify-center relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-amber-700">Admin Desk</span>
                    </div>
                </div>

                {/* ── THE 13 ALLEYS LAYOUT ── */}
                <div className="relative w-full h-full">
                    {/* Left Wing (Alleys 1-6) */}
                    <div className="absolute left-0 top-0 bottom-0 w-1/3 flex flex-col justify-around py-10">
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <AlleyBox key={num} num={num} selected={isAlleySelected(num)} />
                        ))}
                    </div>

                    {/* Center Top Hall (Alley 13 - The Great Hall) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 pt-4">
                        <AlleyBox num={13} selected={isAlleySelected(13)} isHorizontal />
                    </div>

                    {/* Right Wing (Alleys 7-12) */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 flex flex-col justify-around py-10">
                        {[7, 8, 9, 10, 11, 12].map(num => (
                            <AlleyBox key={num} num={num} selected={isAlleySelected(num)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Selected Book Overlay */}
            {selectedBook && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#0d0d0d] border border-amber-900/40 p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center gap-8 min-w-[500px] animate-in slide-in-from-bottom-5 z-[60]">
                    <div className="flex-1">
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">Illuminated Route</h4>
                        <p className="text-lg italic">{selectedBook.title}</p>
                    </div>
                    <div className="h-12 w-px bg-stone-800" />
                    <div className="text-right">
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-stone-600 font-black mb-1">Destination</h4>
                        <p className="text-2xl font-bold text-emerald-500 uppercase">{selectedBook.location_alley}</p>
                    </div>
                    <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Alley Component ── */
function AlleyBox({ num, selected, isHorizontal = false }: { num: number, selected: boolean, isHorizontal?: boolean }) {
    return (
        <div className={`
            relative flex items-center justify-center transition-all duration-700 rounded-sm
            ${isHorizontal ? 'w-48 h-12' : 'w-full h-10'}
            ${selected 
                ? 'bg-emerald-950/40 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-110 z-20' 
                : 'bg-stone-900/10 border border-stone-800/50 hover:border-stone-700'}
        `}>
            {selected && (
                <div className="absolute -top-6 animate-bounce">
                    <MapPin size={18} className="text-emerald-500 fill-emerald-500/20" />
                </div>
            )}
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selected ? 'text-emerald-400' : 'text-stone-700'}`}>
                Alley {num}
            </span>
        </div>
    );
}