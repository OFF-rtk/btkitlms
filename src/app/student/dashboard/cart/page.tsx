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
} from "lucide-react";
import { useCart } from "../cart-context";

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

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

/* ════════════════════════════════════════════════════════════════════════
   Cart Page
   ════════════════════════════════════════════════════════════════════ */

export default function CartPage() {
    const { refreshCart } = useCart();
    /* ── Cart state ── */
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    /* ── Scanner sheet state ── */
    const [sheetOpen, setSheetOpen] = useState(false);
    const [scanMode, setScanMode] = useState<"scan" | "manual">("scan");
    const [manualIsbn, setManualIsbn] = useState("");
    const [searching, setSearching] = useState(false);
    const [foundBook, setFoundBook] = useState<Book | null>(null);
    const [issueDays, setIssueDays] = useState(7);
    const [addingToCart, setAddingToCart] = useState(false);
    const [sheetError, setSheetError] = useState("");

    /* ── Fetch cart on mount ── */
    const fetchCart = useCallback(async () => {
        try {
            const res = await fetch("/api/cart");
            if (res.ok) {
                const data = await res.json();
                setCartItems(data);
            }
        } catch (err) {
            console.error("Failed to fetch cart:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    /* ── Remove item ── */
    async function handleRemove(cartItemId: string) {
        setRemoving(cartItemId);
        try {
            const res = await fetch(`/api/cart?id=${cartItemId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
                refreshCart();
            }
        } catch (err) {
            console.error("Failed to remove:", err);
        } finally {
            setRemoving(null);
        }
    }

    /* ── Open / close sheet ── */
    function openSheet() {
        setFoundBook(null);
        setManualIsbn("");
        setSheetError("");
        setIssueDays(7);
        setScanMode("scan");
        setSheetOpen(true);
    }

    function closeSheet() {
        setSheetOpen(false);
        setFoundBook(null);
        setSheetError("");
    }

    /* ── Search by ISBN (manual) ── */
    async function handleIsbnSearch() {
        if (!manualIsbn.trim()) return;
        setSearching(true);
        setFoundBook(null);
        setSheetError("");

        try {
            const res = await fetch("/api/books");
            if (!res.ok) throw new Error("Failed to fetch books");
            const allBooks: Book[] = await res.json();
            const match = allBooks.find(
                (b) => b.isbn.toLowerCase() === manualIsbn.trim().toLowerCase()
            );
            if (match) {
                setFoundBook(match);
            } else {
                setSheetError("No book found with that ISBN.");
            }
        } catch {
            setSheetError("Search failed. Please try again.");
        } finally {
            setSearching(false);
        }
    }

    /* ── Simulate barcode scan ── */
    async function handleSimulateScan() {
        setSearching(true);
        setFoundBook(null);
        setSheetError("");

        try {
            const res = await fetch("/api/books");
            if (!res.ok) throw new Error("Failed to fetch books");
            const allBooks: Book[] = await res.json();
            if (allBooks.length > 0) {
                const random = allBooks[Math.floor(Math.random() * allBooks.length)];
                setFoundBook(random);
            } else {
                setSheetError("No books in the system to scan.");
            }
        } catch {
            setSheetError("Scan failed. Please try again.");
        } finally {
            setSearching(false);
        }
    }

    /* ── Add found book to cart ── */
    async function handleAddToCart() {
        if (!foundBook) return;
        setAddingToCart(true);
        setSheetError("");

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    book_id: foundBook.id,
                    requested_days: issueDays,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSheetError(data.error || "Failed to add to cart.");
                setAddingToCart(false);
                return;
            }

            // Refresh the cart and close
            await fetchCart();
            refreshCart();
            closeSheet();
        } catch {
            setSheetError("Something went wrong. Please try again.");
        } finally {
            setAddingToCart(false);
        }
    }

    /* ── Total days display helper ── */
    const totalCartDays = cartItems.reduce((s, i) => s + i.requested_days, 0);

    /* ═══════════════════ RENDER ═══════════════════ */

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-hidden px-4 py-8 md:px-8 pb-32">
            {/* ── Header ── */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-orange-50 md:text-5xl mb-1">
                        Your Cart
                    </h1>
                    <p className="text-orange-50/50 text-sm">
                        {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                        {cartItems.length > 0 && (
                            <span> · {totalCartDays} total day{totalCartDays !== 1 ? "s" : ""} requested</span>
                        )}
                    </p>
                </div>
                <button
                    onClick={openSheet}
                    className="flex items-center justify-center gap-2.5 rounded-xl bg-amber-700 px-6 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-[0.98]"
                >
                    <ScanLine className="h-5 w-5" />
                    Scan / Add New Book
                </button>
            </div>

            {/* ── Empty state ── */}
            {cartItems.length === 0 && (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10">
                        <ShoppingCart className="h-10 w-10 text-amber-600/60" />
                    </div>
                    <h2 className="mb-2 font-serif text-2xl font-bold text-orange-50">
                        Your cart is empty
                    </h2>
                    <p className="mb-8 max-w-sm text-sm text-orange-50/50">
                        Scan a book barcode or search by ISBN to add books to your borrowing cart.
                    </p>
                    <button
                        onClick={openSheet}
                        className="flex items-center gap-2.5 rounded-xl bg-amber-700 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-[0.98]"
                    >
                        <ScanLine className="h-5 w-5" />
                        Scan a Book
                    </button>
                </div>
            )}

            {/* ── Cart items list ── */}
            {cartItems.length > 0 && (
                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="group flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                        >
                            {/* Cover */}
                            <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-800 shadow-lg shadow-black/30">
                                <img
                                    src={item.books.cover_url || PLACEHOLDER}
                                    alt={item.books.title}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                    }}
                                />
                            </div>

                            {/* Details */}
                            <div className="flex flex-1 flex-col justify-center min-w-0">
                                <h3 className="line-clamp-2 font-serif text-lg font-bold leading-tight text-orange-50">
                                    {item.books.title}
                                </h3>
                                <p className="mt-0.5 truncate text-sm text-amber-600 font-medium">
                                    {item.books.author}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-orange-50/70">
                                        <BookOpen className="h-3 w-3" />
                                        {item.requested_days} day{item.requested_days !== 1 ? "s" : ""}
                                    </span>
                                    {item.books.available_copies < 1 && (
                                        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                                            Out of stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Remove */}
                            <button
                                onClick={() => handleRemove(item.id)}
                                disabled={removing === item.id}
                                className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl text-orange-50/30 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                aria-label="Remove from cart"
                            >
                                {removing === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
               Scanner Side Sheet
               ═══════════════════════════════════════════════════════ */}

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${sheetOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={closeSheet}
            />

            {/* Panel */}
            <div
                className={`fixed z-50 flex flex-col bg-slate-900 border-white/10 shadow-2xl transition-transform duration-300 ease-in-out
                    /* Mobile: Bottom Sheet */
                    bottom-0 left-0 right-0 max-h-[90vh] rounded-t-3xl border-t
                    /* Desktop: Right Panel */
                    md:top-0 md:bottom-auto md:right-0 md:left-auto md:h-screen md:w-[440px] md:max-h-none md:rounded-none md:border-l md:border-t-0
                    ${sheetOpen
                        ? "translate-y-0 md:translate-x-0"
                        : "translate-y-full md:translate-y-0 md:translate-x-full"
                    }
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <h2 className="font-serif text-xl font-bold text-orange-50">
                        Add a Book
                    </h2>
                    <button
                        onClick={closeSheet}
                        className="rounded-full bg-white/5 p-2 text-orange-50/50 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {/* ── Mode toggle ── */}
                    <div className="mb-6 flex rounded-xl bg-slate-950 p-1 border border-white/5">
                        <button
                            onClick={() => {
                                setScanMode("scan");
                                setFoundBook(null);
                                setSheetError("");
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${scanMode === "scan"
                                    ? "bg-amber-700 text-white shadow"
                                    : "text-orange-50/50 hover:text-orange-50"
                                }`}
                        >
                            <Camera className="h-4 w-4" />
                            Scan Barcode
                        </button>
                        <button
                            onClick={() => {
                                setScanMode("manual");
                                setFoundBook(null);
                                setSheetError("");
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${scanMode === "manual"
                                    ? "bg-amber-700 text-white shadow"
                                    : "text-orange-50/50 hover:text-orange-50"
                                }`}
                        >
                            <Search className="h-4 w-4" />
                            Manual ISBN
                        </button>
                    </div>

                    {/* ── Scan Barcode UI ── */}
                    {scanMode === "scan" && (
                        <div className="mb-6">
                            <div className="relative flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/50">
                                <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-amber-600/60 rounded-tl-md" />
                                <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-amber-600/60 rounded-tr-md" />
                                <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-amber-600/60 rounded-bl-md" />
                                <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-amber-600/60 rounded-br-md" />
                                <div className="absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50 animate-pulse" />
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <Camera className="h-8 w-8 text-orange-50/20" />
                                    <p className="text-xs text-orange-50/30">Camera viewfinder</p>
                                    <button
                                        onClick={handleSimulateScan}
                                        disabled={searching}
                                        className="mt-1 flex items-center gap-2 rounded-lg bg-amber-700/80 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-amber-600 disabled:opacity-50"
                                    >
                                        {searching ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <ScanLine className="h-3.5 w-3.5" />
                                        )}
                                        Simulate Scan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Manual ISBN UI ── */}
                    {scanMode === "manual" && (
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-orange-50/70">
                                Enter ISBN
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualIsbn}
                                    onChange={(e) => setManualIsbn(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleIsbnSearch()}
                                    placeholder="e.g. 978-0-06-112008-4"
                                    className="flex-1 rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-orange-50 outline-none placeholder:text-orange-50/25 focus:border-amber-600 transition-colors"
                                />
                                <button
                                    onClick={handleIsbnSearch}
                                    disabled={searching || !manualIsbn.trim()}
                                    className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 font-bold text-white transition-all hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {searching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Error message ── */}
                    {sheetError && (
                        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                            {sheetError}
                        </div>
                    )}

                    {/* ── Found book result ── */}
                    {foundBook && (
                        <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-5">
                            <div className="mb-5 flex gap-4">
                                <div className="h-32 w-22 shrink-0 overflow-hidden rounded-lg bg-slate-800 shadow-lg shadow-black/40">
                                    <img
                                        src={foundBook.cover_url || PLACEHOLDER}
                                        alt={foundBook.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className="mb-1 font-serif text-lg font-bold leading-tight text-orange-50 line-clamp-2">
                                        {foundBook.title}
                                    </h3>
                                    <p className="text-sm text-amber-600 font-medium truncate">
                                        {foundBook.author}
                                    </p>
                                    <p className="mt-1 text-xs text-orange-50/40">
                                        ISBN: {foundBook.isbn}
                                    </p>
                                    <span
                                        className={`mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${foundBook.available_copies > 0
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-red-500/10 text-red-400"
                                            }`}
                                    >
                                        {foundBook.available_copies > 0
                                            ? `${foundBook.available_copies} available`
                                            : "Out of stock"}
                                    </span>
                                </div>
                            </div>

                            {/* Issue duration */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-orange-50/70">
                                    Issue Duration (Days)
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIssueDays((d) => Math.max(1, d - 1))}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-orange-50 hover:bg-slate-700 active:scale-95 transition-all"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={issueDays}
                                        onChange={(e) =>
                                            setIssueDays(Math.max(1, Math.min(365, Number(e.target.value))))
                                        }
                                        className="h-10 w-16 rounded-lg bg-slate-950 border border-amber-900/30 text-center text-lg font-bold text-orange-50 outline-none focus:border-amber-600"
                                    />
                                    <button
                                        onClick={() => setIssueDays((d) => Math.min(365, d + 1))}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-orange-50 hover:bg-slate-700 active:scale-95 transition-all"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer action ── */}
                {foundBook && (
                    <div className="border-t border-white/10 bg-slate-900 p-6">
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart || foundBook.available_copies < 1}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-6 py-4 font-bold text-white shadow-lg transition-all hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none active:scale-[0.98]"
                        >
                            {addingToCart ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ShoppingCart className="h-5 w-5" />
                            )}
                            {addingToCart
                                ? "Adding…"
                                : foundBook.available_copies < 1
                                    ? "Currently Unavailable"
                                    : "Confirm & Add to Cart"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
