"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2, BookPlus, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useScanSession } from "@/hooks/useScanSession";

interface AddBookSideSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

interface BookForm {
    isbn: string;
    title: string;
    author: string;
    cover_url: string;
    category: string;
    total_copies: number;
    location_alley: string;
    location_column: string;
    location_shelf: string;
}

const empty: BookForm = {
    isbn: "", title: "", author: "", cover_url: "", category: "",
    total_copies: 1, location_alley: "", location_column: "", location_shelf: "",
};

export default function AddBookSideSheet({ isOpen, onClose }: AddBookSideSheetProps) {
    const [step, setStep] = useState<"scan" | "form">("scan");
    const [manualIsbn, setManualIsbn] = useState("");
    const [fetching, setFetching] = useState(false);
    const [autoFilled, setAutoFilled] = useState(false);
    const [form, setForm] = useState<BookForm>(empty);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const { sessionId, scannedIsbn } = useScanSession(isOpen);
    const [origin, setOrigin] = useState("");

    useEffect(() => { setOrigin(window.location.origin); }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    /* ── Auto-trigger fetch when phone scans a barcode ── */
    useEffect(() => {
        if (scannedIsbn) {
            setManualIsbn(scannedIsbn);
            handleFetchByIsbn(scannedIsbn);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scannedIsbn]);

    function reset() { setStep("scan"); setManualIsbn(""); setForm(empty); setError(""); setAutoFilled(false); }
    function handleClose() { reset(); onClose(); }

    /* ── Fetch from Google Books, fallback to empty form ── */
    async function handleFetchByIsbn(isbn: string) {
        if (!isbn.trim()) return;
        setFetching(true); setError("");
        const cleanIsbn = isbn.trim();

        try {
            const res = await fetch(`/api/google-books?isbn=${encodeURIComponent(cleanIsbn)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.found && data.book) {
                    setForm({
                        ...empty,
                        isbn: data.book.isbn || cleanIsbn,
                        title: data.book.title || "",
                        author: data.book.author || "",
                        cover_url: data.book.cover_url || "",
                    });
                    setAutoFilled(true);
                    setStep("form");
                    return;
                }
            }
            setForm({ ...empty, isbn: cleanIsbn });
            setAutoFilled(false);
            setStep("form");
        } catch {
            setForm({ ...empty, isbn: cleanIsbn });
            setAutoFilled(false);
            setStep("form");
        } finally {
            setFetching(false);
        }
    }

    async function handleFetch() { handleFetchByIsbn(manualIsbn); }

    function update(key: keyof BookForm, value: string | number) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit() {
        if (!form.isbn || !form.title || !form.author) {
            setError("ISBN, Title, and Author are required.");
            return;
        }
        setSubmitting(true); setError("");
        try {
            const res = await fetch("/api/admin/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to add book."); return; }
            handleClose();
        } catch { setError("Something went wrong."); }
        finally { setSubmitting(false); }
    }

    const fieldClass = "w-full bg-stone-950 border border-stone-900 px-4 py-3 text-sm text-stone-300 font-serif outline-none focus:border-amber-900/50 transition-colors";
    const labelClass = "text-[9px] uppercase tracking-[0.2em] text-stone-700 font-black font-sans mb-2 block";
    const scannerUrl = sessionId && origin ? `${origin}/scanner?session=${sessionId}` : null;

    return (
        <>
            {/* ── Backdrop: Identical to BookSideSheet ── */}
            <div
                className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-md transition-opacity duration-500 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
                onClick={handleClose}
            />

            {/* ── Panel: Identical Transition and Positioning ── */}
            <div
                className={`fixed z-[70] flex flex-col bg-[#0a0a0a] border-stone-800 shadow-[0_0_50px_rgba(0,0,0,1)] transition-all duration-500 ease-out
                    bottom-0 left-0 right-0 max-h-[94vh] rounded-t-[2.5rem] border-t
                    md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l
                    ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-900 bg-[#0d0d0d] p-8">
                    <div>
                        <h2 className="font-serif text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black mb-1">
                            {step === "scan" ? "Add New Book" : "Book Details"}
                        </h2>
                        <p className="text-stone-500 text-[10px] font-mono tracking-widest uppercase opacity-60">
                            {step === "scan" ? "Scan or enter ISBN" : `ISBN: ${form.isbn}`}
                        </p>
                    </div>
                    <button onClick={handleClose} className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 border border-stone-800 text-stone-600 transition-all hover:border-amber-900/50 hover:text-amber-600">
                        <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide space-y-8">

                    {step === "scan" && (
                        <div>
                            {/* QR Code Scanner */}
                            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-sm shadow-[0_0_40px_rgba(255,255,255,0.03)]">
                                {scannerUrl ? (
                                    <QRCodeSVG value={scannerUrl} size={180} bgColor="#ffffff" fgColor="#0a0a0a" level="M" />
                                ) : (
                                    <div className="h-[180px] w-[180px] flex items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-stone-400" />
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-[9px] font-sans font-black uppercase tracking-[0.2em] text-stone-600">
                                Scan QR with mobile device to read barcode
                            </p>

                            {/* Manual ISBN */}
                            <div className="font-sans">
                                <label className={labelClass}>Or enter ISBN manually</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text" value={manualIsbn}
                                        onChange={(e) => setManualIsbn(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                                        placeholder="e.g. 978-01..."
                                        className="flex-1 bg-stone-950 border border-stone-900 px-4 py-3 text-sm text-stone-300 outline-none focus:border-amber-900 transition-colors"
                                    />
                                    <button onClick={handleFetch} disabled={!manualIsbn.trim() || fetching} className="bg-stone-900 px-4 text-stone-600 border border-stone-800 transition-colors hover:text-amber-600 disabled:opacity-50 rounded-sm">
                                        {fetching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                    </button>
                                </div>
                                <p className="mt-2 text-[9px] text-stone-700 font-sans tracking-wide">
                                    Archive will attempt to auto-fill details from university records.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === "form" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <button onClick={() => { setStep("scan"); setAutoFilled(false); }} className="text-[9px] font-sans font-black uppercase tracking-[0.2em] text-stone-600 hover:text-amber-600 transition-colors">
                                ← Back to scanner
                            </button>

                            {autoFilled && (
                                <div className="rounded-sm bg-emerald-950/10 border border-emerald-900/20 p-4 shadow-inner">
                                    <p className="text-[10px] text-emerald-600 font-sans font-black uppercase tracking-widest">
                                        ✓ Details auto-filled from registry
                                    </p>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div><label className={labelClass}>ISBN</label><input type="text" value={form.isbn} onChange={(e) => update("isbn", e.target.value)} className={fieldClass} /></div>
                                <div><label className={labelClass}>Title *</label><input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Book title" className={fieldClass} /></div>
                                <div><label className={labelClass}>Author *</label><input type="text" value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="Author name" className={fieldClass} /></div>
                                <div><label className={labelClass}>Cover URL</label><input type="text" value={form.cover_url} onChange={(e) => update("cover_url", e.target.value)} placeholder="https://..." className={fieldClass} /></div>
                                <div><label className={labelClass}>Category</label><input type="text" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Fiction, Science" className={fieldClass} /></div>
                                <div>
                                    <label className={labelClass}>Total Copies</label>
                                    <input type="number" min={1} value={form.total_copies} onChange={(e) => update("total_copies", Math.max(1, parseInt(e.target.value) || 1))} className={fieldClass} />
                                </div>

                                <div className="pt-4 border-t border-stone-900/50">
                                    <p className="text-[8px] uppercase tracking-[0.3em] text-stone-700 font-black font-sans mb-4">Vault Location</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div><label className={labelClass}>Alley</label><input type="text" value={form.location_alley} onChange={(e) => update("location_alley", e.target.value)} placeholder="A1" className={fieldClass} /></div>
                                        <div><label className={labelClass}>Column</label><input type="text" value={form.location_column} onChange={(e) => update("location_column", e.target.value)} placeholder="C3" className={fieldClass} /></div>
                                        <div><label className={labelClass}>Shelf</label><input type="text" value={form.location_shelf} onChange={(e) => update("location_shelf", e.target.value)} placeholder="S2" className={fieldClass} /></div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 rounded-sm bg-red-950/10 border border-red-900/20 p-4 text-xs text-red-500 font-sans">
                                    <AlertCircle size={14} className="shrink-0" /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex w-full items-center justify-center gap-4 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/20 px-10 py-5 font-black text-amber-50 uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookPlus className="h-5 w-5" />}
                                {submitting ? "Inscribing..." : "Add to Catalog"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}