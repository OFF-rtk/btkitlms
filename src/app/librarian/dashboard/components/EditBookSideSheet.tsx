"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";

export interface Book {
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

interface EditBookSideSheetProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const COLLECTION_OPTIONS = ["Trending", "Teacher's Pick", "New Arrival"];

export default function EditBookSideSheet({ book, isOpen, onClose, onUpdated }: EditBookSideSheetProps) {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [category, setCategory] = useState("");
    const [totalCopies, setTotalCopies] = useState(1);
    const [availableCopies, setAvailableCopies] = useState(1);
    const [collections, setCollections] = useState<string[]>([]);
    const [alley, setAlley] = useState("");
    const [column, setColumn] = useState("");
    const [shelf, setShelf] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => {
        if (book) {
            setTitle(book.title); setAuthor(book.author);
            setCoverUrl(book.cover_url || ""); setCategory(book.category || "");
            setTotalCopies(book.total_copies); setAvailableCopies(book.available_copies);
            setCollections(book.collections || []);
            setAlley(book.location_alley || ""); setColumn(book.location_column || "");
            setShelf(book.location_shelf || "");
        }
    }, [book]);

    function toggleCollection(c: string) {
        setCollections((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
    }

    async function handleSave() {
        if (!book || !title || !author) { setError("Title and Author are required."); return; }
        setSaving(true); setError("");
        try {
            const res = await fetch("/api/admin/books", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: book.id, title, author,
                    cover_url: coverUrl || null,
                    category: category || null,
                    total_copies: totalCopies,
                    available_copies: availableCopies,
                    collections: collections.length > 0 ? collections : null,
                    location_alley: alley || null,
                    location_column: column || null,
                    location_shelf: shelf || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Save failed."); return; }
            onUpdated?.();
            onClose();
        } catch { setError("Something went wrong."); }
        finally { setSaving(false); }
    }

    if (!isOpen || !book) return null;

    const fieldClass = "w-full bg-stone-950 border border-stone-900 px-4 py-3 text-sm text-stone-300 font-serif outline-none focus:border-amber-900/50 transition-colors";
    const labelClass = "text-[9px] uppercase tracking-[0.2em] text-stone-700 font-black font-sans mb-2 block";

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md transition-opacity duration-500 opacity-100" onClick={onClose} />
            <div className="fixed z-50 flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l translate-y-0 md:translate-x-0">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                    <div>
                        <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">Edit Book</h2>
                        <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">ISBN: {book.isbn}</p>
                    </div>
                    <button onClick={onClose} className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 border border-stone-800 text-stone-600 transition-all hover:border-amber-900/50 hover:text-amber-600">
                        <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-6">
                    <div><label className={labelClass}>Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Author *</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Cover URL</label><input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Category</label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass} /></div>
                    <div><label className={labelClass}>Total Copies</label><input type="number" min={1} value={totalCopies} onChange={(e) => setTotalCopies(Math.max(1, parseInt(e.target.value) || 1))} className={fieldClass} /></div>
                    <div><label className={labelClass}>Available Copies</label><input type="number" min={0} value={availableCopies} onChange={(e) => setAvailableCopies(Math.max(0, parseInt(e.target.value) || 0))} className={fieldClass} /></div>

                    {/* Collections */}
                    <div className="bg-[#050505] p-6 rounded-3xl border border-stone-900/60 shadow-inner">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-stone-700 font-black font-sans mb-4">Collections</p>
                        <div className="space-y-3">
                            {COLLECTION_OPTIONS.map((c) => (
                                <div key={c} onClick={() => toggleCollection(c)} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`h-5 w-5 border flex items-center justify-center transition-all ${collections.includes(c) ? "bg-amber-900 border-amber-700" : "border-stone-800 bg-stone-950"}`}>
                                        {collections.includes(c) && <span className="text-amber-50 text-[10px] font-black">✓</span>}
                                    </div>
                                    <span className="text-sm text-stone-400 font-serif group-hover:text-[#e8e4db] transition-colors">{c}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="pt-2">
                        <p className="text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black font-sans mb-4">Shelf Location</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div><label className={labelClass}>Alley</label><input type="text" value={alley} onChange={(e) => setAlley(e.target.value)} className={fieldClass} /></div>
                            <div><label className={labelClass}>Column</label><input type="text" value={column} onChange={(e) => setColumn(e.target.value)} className={fieldClass} /></div>
                            <div><label className={labelClass}>Shelf</label><input type="text" value={shelf} onChange={(e) => setShelf(e.target.value)} className={fieldClass} /></div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 rounded-sm bg-red-950/10 border border-red-900/20 p-4 text-xs text-red-500 font-sans">
                            <AlertCircle size={14} className="shrink-0" /> {error}
                        </div>
                    )}

                    <button
                        onClick={handleSave} disabled={saving}
                        className="flex w-full items-center justify-center gap-4 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/20 px-10 py-5 font-black text-amber-50 uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}
