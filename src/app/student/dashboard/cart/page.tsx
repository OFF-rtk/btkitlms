"use client";

import { useEffect, useState, useCallback } from "react";
import {
    X,
    Trash2,
    ScanLine,
    Loader2,
    Search,
    Minus,
    Plus,
    ShoppingCart,
    BookOpen,
    Camera,
    Send,
    CheckCircle,
} from "lucide-react";
import { useCart } from "../cart-context";
import { useToast } from "../toast-context";
import RequestBookSideSheet, {
    type GoogleBookData,
} from "../components/RequestBookSideSheet";

/* ── Types ── */
interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    cover_url: string | null;
    category: string | null;
    collections: string[] | null;
    total_copies: number;
    available_copies: number;
}

interface CartItem {
    id: string;
    requested_days: number;
    books: Book;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function CartPage() {
    const { refreshCart } = useCart();
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [scanMode, setScanMode] = useState<"scan" | "manual">("scan");
    const [manualIsbn, setManualIsbn] = useState("");
    const [searching, setSearching] = useState(false);
    const [foundBook, setFoundBook] = useState<Book | null>(null);
    const [issueDays, setIssueDays] = useState(7);
    const [addingToCart, setAddingToCart] = useState(false);
    const [sheetError, setSheetError] = useState("");

    /* ── Google Books fallback state ── */
    const [googleBook, setGoogleBook] = useState<GoogleBookData | null>(null);
    const [requestSheetOpen, setRequestSheetOpen] = useState(false);

    const fetchCart = useCallback(async () => {
        try {
            const res = await fetch("/api/cart");
            if (res.ok) setCartItems(await res.json());
        } catch (err) { console.error("Failed to fetch cart:", err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    async function handleRemove(cartItemId: string) {
        setRemoving(cartItemId);
        try {
            const res = await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
            if (res.ok) { setCartItems((prev) => prev.filter((item) => item.id !== cartItemId)); refreshCart(); }
        } finally { setRemoving(null); }
    }

    function openSheet() {
        setFoundBook(null); setGoogleBook(null); setManualIsbn(""); setSheetError("");
        setIssueDays(7); setScanMode("scan"); setSheetOpen(true);
    }

    function closeSheet() { setSheetOpen(false); setFoundBook(null); setGoogleBook(null); setSheetError(""); }

    /* ── Lock background scroll when scanner sheet is open ── */
    useEffect(() => {
        document.body.style.overflow = sheetOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [sheetOpen]);

    /* ── Search by ISBN: local DB first, then Google Books fallback ── */
    async function handleIsbnSearch() {
        if (!manualIsbn.trim()) return;
        setSearching(true); setFoundBook(null); setGoogleBook(null); setSheetError("");
        const isbn = manualIsbn.trim();

        try {
            // 1. Search local catalog
            const res = await fetch("/api/books");
            if (!res.ok) throw new Error("Failed to fetch books");
            const allBooks: Book[] = await res.json();
            const match = allBooks.find((b) => b.isbn.toLowerCase() === isbn.toLowerCase());

            if (match) { setFoundBook(match); setSearching(false); return; }

            // 2. Not in local DB — try Google Books via server proxy
            const gRes = await fetch(`/api/google-books?isbn=${encodeURIComponent(isbn)}`);
            if (gRes.ok) {
                const gData = await gRes.json();
                if (gData.found && gData.book) { setGoogleBook(gData.book); setSearching(false); return; }
            }

            // 3. Not found anywhere
            setSheetError("No book found with that ISBN — not in our library or Google Books.");
        } catch { setSheetError("Search failed. Please try again."); }
        finally { setSearching(false); }
    }

    async function handleSimulateScan() {
        setSearching(true); setFoundBook(null); setGoogleBook(null); setSheetError("");
        try {
            const res = await fetch("/api/books");
            const allBooks: Book[] = await res.json();
            if (allBooks.length > 0) setFoundBook(allBooks[Math.floor(Math.random() * allBooks.length)]);
            else setSheetError("No books in the system to scan.");
        } finally { setSearching(false); }
    }

    async function handleAddToCart() {
        if (!foundBook) return;
        setAddingToCart(true); setSheetError("");
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ book_id: foundBook.id, requested_days: issueDays }),
            });
            const data = await res.json();
            if (!res.ok) { setSheetError(data.error || "Failed to add to cart."); setAddingToCart(false); return; }
            await fetchCart(); refreshCart(); closeSheet();
        } finally { setAddingToCart(false); }
    }

    async function handleCheckout() {
        setCheckingOut(true);
        try {
            const res = await fetch("/api/checkout", { method: "POST" });
            const data = await res.json();
            if (!res.ok) { showToast(data.error || "Checkout failed", "error"); return; }
            setCartItems([]);
            refreshCart();
            showToast(`Checkout complete! ${data.requests_created} issue request${data.requests_created !== 1 ? "s" : ""} sent to the librarian.`, "success");
        } catch { showToast("Something went wrong. Please try again.", "error"); }
        finally { setCheckingOut(false); }
    }

    const totalCartDays = cartItems.reduce((s, i) => s + i.requested_days, 0);

    if (loading) return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
        </div>
    );

    return (
        <div className="w-full bg-[#0a0a0a] min-h-screen px-6 py-8 md:px-12 md:py-12 pb-32 font-serif selection:bg-amber-900/40">

            {/* ── Header ── */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-stone-900/50 pb-8">
                <div>
                    <h1 className="text-4xl font-normal text-[#e8e4db] md:text-5xl mb-1 leading-tight tracking-tight">
                        Your <span className="italic text-stone-500">Cart</span>
                    </h1>
                    <div className="flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.2em] text-stone-600 font-bold">
                        <span>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
                        {cartItems.length > 0 && (
                            <>
                                <span className="w-1 h-1 bg-stone-800 rounded-full" />
                                <span>{totalCartDays} total days requested</span>
                            </>
                        )}
                    </div>
                </div>
                <button
                    onClick={openSheet}
                    className="flex items-center justify-center gap-2.5 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/30 px-6 py-3.5 font-sans text-[10px] font-black uppercase tracking-[0.2em] text-amber-50 shadow-2xl transition-all hover:brightness-110 active:scale-[0.98]"
                >
                    <ScanLine className="h-4 w-4" />
                    Scan / Add New Book
                </button>
            </div>

            {/* ── Empty State ── */}
            {cartItems.length === 0 && (
                <div className="mt-20 flex flex-col items-center justify-center text-center">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-stone-900/50 bg-stone-950/40 shadow-inner">
                        <ShoppingCart className="h-10 w-10 text-stone-800" />
                    </div>
                    <h2 className="mb-3 text-2xl font-normal text-[#e8e4db] italic tracking-tight">
                        Your cart is empty
                    </h2>
                    <p className="mb-10 max-w-sm text-sm text-stone-500 font-sans leading-relaxed tracking-wide font-light">
                        Scan a book barcode or search by ISBN to add manuscripts to your borrowing ledger.
                    </p>
                    <button
                        onClick={openSheet}
                        className="bg-gradient-to-br from-amber-800 via-amber-900 to-[#2b180a] px-10 py-4 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-amber-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-amber-700/20 hover:brightness-110 transition-all"
                    >
                        Scan a Book
                    </button>
                </div>
            )}

            {/* ── List ── */}
            {cartItems.length > 0 && (
                <>
                    <div className="space-y-4 max-w-6xl">
                        {cartItems.map((item) => (
                            <div key={item.id} className="group relative flex gap-6 bg-[#0d0d0d] border border-stone-900 p-5 transition-all hover:border-amber-900/40 shadow-sm">
                                <div className="h-28 w-20 shrink-0 overflow-hidden border border-stone-800 shadow-xl">
                                    <img
                                        src={item.books.cover_url || PLACEHOLDER}
                                        alt=""
                                        className="h-full w-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-center min-w-0">
                                    <h3 className="line-clamp-1 text-lg md:text-xl font-normal text-[#e8e4db] leading-tight italic tracking-tight">
                                        {item.books.title}
                                    </h3>
                                    <p className="mt-1 text-[10px] text-amber-800 font-sans uppercase tracking-[0.15em] font-black opacity-80">
                                        {item.books.author}
                                    </p>
                                    <div className="mt-4 flex items-center gap-3 font-sans">
                                        <span className="inline-flex items-center gap-1.5 bg-stone-950 border border-stone-800/60 px-3 py-1 text-[9px] font-black text-stone-500 uppercase tracking-widest">
                                            <BookOpen className="h-3 w-3" />
                                            {item.requested_days} day{item.requested_days !== 1 ? "s" : ""}
                                        </span>
                                        {item.books.available_copies < 1 && (
                                            <span className="text-[9px] font-black text-red-900 uppercase tracking-widest border border-red-900/20 px-2 py-0.5 bg-red-950/10">Out of stock</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    disabled={removing === item.id}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center self-center text-stone-700 transition-colors hover:text-red-700 disabled:opacity-50"
                                >
                                    {removing === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ── Checkout Button ── */}
                    <div className="mt-8 max-w-6xl">
                        <button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="flex w-full items-center justify-center gap-4 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border border-emerald-700/20 px-10 py-5 font-black text-emerald-50 uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                        >
                            {checkingOut ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle className="h-5 w-5" />
                            )}
                            {checkingOut ? "Processing..." : "Proceed to Checkout"}
                        </button>
                        <p className="mt-3 text-center text-[9px] text-stone-700 font-sans uppercase tracking-widest">
                            Sends an issuance request to the librarian for approval.
                        </p>
                    </div>
                </>
            )}

            {/* ═════════════════════════════════════════════════
               Scanner Side Sheet
               ═════════════════════════════════════════════ */}
            <div className={`fixed inset-0 z-[60] bg-black/85 backdrop-blur-xl transition-opacity duration-500 ${sheetOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={closeSheet} />
            <div className={`fixed z-[70] flex flex-col bg-[#0a0a0a] border-stone-900 shadow-2xl transition-transform duration-500 ease-in-out bottom-0 left-0 right-0 max-h-[92vh] rounded-t-[2.5rem] border-t md:top-0 md:bottom-auto md:right-0 md:left-auto md:h-screen md:w-[480px] md:max-h-none md:rounded-none md:border-l md:border-t-0 ${sheetOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}`}>

                <div className="flex items-center justify-between p-8 border-b border-stone-900/50">
                    <h2 className="text-xl font-normal text-[#e8e4db] italic tracking-tight underline decoration-stone-800 underline-offset-8">Add a Book</h2>
                    <button onClick={closeSheet} className="p-2.5 bg-stone-950 border border-stone-800 text-stone-600 hover:text-amber-600 transition-all"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    {/* Toggle */}
                    <div className="mb-8 flex border border-stone-900 p-1 bg-stone-950 font-sans">
                        <button onClick={() => { setScanMode("scan"); setFoundBook(null); setGoogleBook(null); setSheetError(""); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${scanMode === "scan" ? "bg-amber-900 text-amber-50 shadow-lg" : "text-stone-700"}`}>
                            <Camera size={14} /> Scan Barcode
                        </button>
                        <button onClick={() => { setScanMode("manual"); setFoundBook(null); setGoogleBook(null); setSheetError(""); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${scanMode === "manual" ? "bg-amber-900 text-amber-50 shadow-lg" : "text-stone-700"}`}>
                            <Search size={14} /> Manual ISBN
                        </button>
                    </div>

                    {scanMode === "scan" ? (
                        <div className="mb-8 relative aspect-video flex flex-col items-center justify-center border border-stone-900 bg-stone-950/40 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_#0a0a0a_100%)] opacity-40" />
                            <ScanLine size={32} className="text-stone-800 mb-4 animate-pulse" />
                            <button onClick={handleSimulateScan} disabled={searching} className="relative px-6 py-2 border border-amber-900/30 text-[9px] font-sans font-black uppercase tracking-[0.2em] text-amber-700 hover:bg-amber-900 hover:text-amber-50 transition-all">
                                {searching ? "Searching..." : "Simulate Scan"}
                            </button>
                        </div>
                    ) : (
                        <div className="mb-8 font-sans">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-700 font-black mb-2 block">Enter ISBN</label>
                            <div className="flex gap-2">
                                <input type="text" value={manualIsbn} onChange={(e) => setManualIsbn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleIsbnSearch()} placeholder="e.g. 978-01..." className="flex-1 bg-stone-950 border border-stone-900 px-4 py-3 text-sm text-stone-300 outline-none focus:border-amber-900 transition-colors" />
                                <button onClick={handleIsbnSearch} disabled={searching || !manualIsbn.trim()} className="bg-stone-900 px-4 text-stone-600 border border-stone-800 transition-colors">
                                    {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {sheetError && <div className="mb-8 p-4 bg-red-950/10 border border-red-900/20 text-[10px] font-sans font-black text-red-800 uppercase tracking-widest text-center">{sheetError}</div>}

                    {/* ── Google Books fallback result ── */}
                    {!foundBook && googleBook && (
                        <div className="border border-sky-900/20 bg-sky-950/5 p-5 shadow-inner">
                            <div className="flex gap-4 mb-6">
                                <div className="h-28 w-20 shrink-0 overflow-hidden border border-stone-800 shadow-xl">
                                    <img
                                        src={googleBook.cover_url || PLACEHOLDER}
                                        alt=""
                                        className="h-full w-full object-cover grayscale-[20%]"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className="text-lg italic text-[#e8e4db] tracking-tight leading-tight line-clamp-2">{googleBook.title}</h3>
                                    <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.15em] mt-1">{googleBook.author}</p>
                                    <p className="mt-1.5 text-[9px] text-stone-600 font-mono tracking-widest">ISBN: {googleBook.isbn}</p>
                                </div>
                            </div>
                            <div className="rounded-sm bg-[#0d0d0d] p-4 border border-stone-900 shadow-inner mb-5">
                                <p className="text-stone-400 text-sm font-serif italic leading-relaxed">
                                    This volume isn&apos;t in our library archives. You can request the librarian to procure it.
                                </p>
                            </div>
                            <button
                                onClick={() => setRequestSheetOpen(true)}
                                className="flex w-full items-center justify-center gap-3 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/20 px-6 py-4 font-black text-amber-50 uppercase tracking-[0.3em] text-[10px] shadow-[0_15px_30px_rgba(0,0,0,0.4)] rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
                            >
                                <Send className="h-4 w-4" />
                                Request This Book
                            </button>
                        </div>
                    )}

                    {/* ── Found book result ── */}
                    {foundBook && (
                        <div className="border border-stone-900 bg-stone-950/30 p-5 shadow-inner">
                            <div className="flex gap-4 mb-8">
                                <img src={foundBook.cover_url || PLACEHOLDER} className="h-32 w-22 object-cover border border-stone-800 shadow-2xl" />
                                <div className="flex flex-col justify-center">
                                    <h3 className="text-lg italic text-[#e8e4db] tracking-tight leading-tight">{foundBook.title}</h3>
                                    <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.15em] mt-1">{foundBook.author}</p>
                                    <span className={`mt-3 text-[10px] font-black font-sans uppercase tracking-widest ${foundBook.available_copies > 0 ? "text-emerald-800" : "text-red-900"}`}>
                                        {foundBook.available_copies > 0 ? `${foundBook.available_copies} available` : "Out of stock"}
                                    </span>
                                </div>
                            </div>
                            <div className="font-sans">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-700 font-black mb-3 block">Issue Duration (Days)</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIssueDays(Math.max(1, issueDays - 1))} className="h-10 w-10 border border-stone-900 flex justify-center items-center text-stone-600 hover:text-amber-600 transition-colors"><Minus size={14} /></button>
                                    <span className="flex-1 text-center text-xl font-bold text-amber-700">{issueDays}</span>
                                    <button onClick={() => setIssueDays(Math.min(365, issueDays + 1))} className="h-10 w-10 border border-stone-900 flex justify-center items-center text-stone-600 hover:text-amber-600 transition-colors"><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {foundBook && (
                    <div className="p-8 border-t border-stone-900 bg-[#0d0d0d] font-sans">
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart || foundBook.available_copies < 1}
                            className="w-full bg-gradient-to-br from-amber-800 to-amber-950 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-amber-50 hover:brightness-110 disabled:bg-stone-950 disabled:text-stone-800 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-amber-700/20"
                        >
                            {addingToCart ? "Adding…" : foundBook.available_copies < 1 ? "Currently Unavailable" : "Confirm & Add to Cart"}
                        </button>
                    </div>
                )}
            </div>

            {/* ═══ Request Book Side Sheet ═══ */}
            <RequestBookSideSheet
                bookData={requestSheetOpen ? googleBook : null}
                onClose={() => setRequestSheetOpen(false)}
            />

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}