"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Loader2, Smartphone } from "lucide-react";

export default function MobileScannerPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<"scanning" | "success" | "error" | "no-session">("scanning");
    const [error, setError] = useState("");
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrRef = useRef<unknown>(null);

    /* ── Extract session ID from URL ── */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const s = params.get("session");
        if (!s) { setStatus("no-session"); return; }
        setSessionId(s);
    }, []);

    /* ── Auto-redirect to / after successful scan ── */
    useEffect(() => {
        if (status !== "success") return;
        const t = setTimeout(() => { window.location.href = "/"; }, 1500);
        return () => clearTimeout(t);
    }, [status]);

    /* ── Initialize camera scanner ── */
    useEffect(() => {
        if (!sessionId || status !== "scanning") return;

        let scanner: { clear: () => Promise<void>; stop: () => Promise<void> } | null = null;

        async function init() {
            try {
                const { Html5Qrcode } = await import("html5-qrcode");
                const s = new Html5Qrcode("mobile-scanner-viewport");
                html5QrRef.current = s;
                scanner = s as unknown as typeof scanner;

                await s.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 100 }, aspectRatio: 1.0 },
                    async (decodedText) => {
                        // Stop scanning immediately
                        try { await s.stop(); } catch { /* already stopped */ }

                        // Send ISBN to supabase via API
                        try {
                            const res = await fetch("/api/scan-sessions", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ session_id: sessionId, isbn: decodedText }),
                            });
                            if (res.ok) {
                                setStatus("success");
                            } else {
                                const d = await res.json();
                                setError(d.error || "Failed to send ISBN");
                                setStatus("error");
                            }
                        } catch {
                            setError("Network error sending ISBN");
                            setStatus("error");
                        }
                    },
                    () => { /* ignore scan failures */ }
                );
            } catch (err) {
                console.error("Scanner init failed:", err);
                setError("Camera access denied or unavailable");
                setStatus("error");
            }
        }

        init();

        return () => {
            if (scanner) {
                scanner.stop().catch(() => { });
            }
        };
    }, [sessionId, status]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-10 font-serif selection:bg-amber-900/40">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <div className="h-14 w-14 flex items-center justify-center rounded-full bg-stone-950 border border-stone-800 shadow-inner">
                            <Smartphone size={24} className="text-amber-700" />
                        </div>
                    </div>
                    <h1 className="text-2xl italic text-[#e8e4db] tracking-tight mb-2">Mobile Scanner</h1>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-stone-600">
                        Point camera at barcode
                    </p>
                </div>

                {/* No Session */}
                {status === "no-session" && (
                    <div className="bg-[#0d0d0d] border border-stone-900 p-8 text-center shadow-inner">
                        <XCircle size={32} className="text-red-600 mx-auto mb-4" />
                        <p className="text-sm text-stone-400 font-serif">No scan session found.</p>
                        <p className="text-[10px] text-stone-600 font-sans mt-2 tracking-wide">Please scan the QR code from your PC dashboard.</p>
                    </div>
                )}

                {/* Scanning */}
                {status === "scanning" && sessionId && (
                    <div className="space-y-4">
                        <div
                            id="mobile-scanner-viewport"
                            ref={scannerRef}
                            className="w-full aspect-square bg-black rounded-sm overflow-hidden border border-stone-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                        />
                        <div className="flex items-center justify-center gap-2 text-amber-700">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em]">Scanning...</span>
                        </div>
                    </div>
                )}

                {/* Success — auto-redirect */}
                {status === "success" && (
                    <div className="bg-[#0d0d0d] border border-emerald-900/30 p-10 text-center shadow-inner">
                        <CheckCircle size={48} className="text-emerald-600 mx-auto mb-4" />
                        <h2 className="text-xl italic text-[#e8e4db] tracking-tight mb-2">Barcode Sent!</h2>
                        <p className="text-[10px] text-stone-500 font-sans tracking-wide mb-4">
                            The ISBN has been sent to your PC.
                        </p>
                        <p className="text-[10px] text-stone-600 font-sans tracking-wide">
                            Redirecting...
                        </p>
                    </div>
                )}

                {/* Error */}
                {status === "error" && (
                    <div className="bg-[#0d0d0d] border border-red-900/30 p-8 text-center shadow-inner">
                        <XCircle size={32} className="text-red-600 mx-auto mb-4" />
                        <p className="text-sm text-red-400 font-serif mb-1">{error}</p>
                        <button
                            onClick={() => { setStatus("scanning"); setError(""); }}
                            className="mt-4 px-6 py-3 border border-amber-900/30 text-[9px] font-sans font-black uppercase tracking-[0.2em] text-amber-700 hover:bg-amber-900 hover:text-amber-50 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
