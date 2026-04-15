"use client";

import { useState, useCallback, type ReactNode, createContext, useContext } from "react";
import { AlertCircle, Feather, Info } from "lucide-react";


/* ── Toast types ── */
interface Toast {
    id: number;
    message: string;
    type: "success" | "error" | "info";
}

interface ToastContextValue {
    showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
    showToast: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast container — bottom-center */}
            {/* <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto animate-slide-up rounded-xl px-5 py-3 text-sm font-semibold shadow-2xl shadow-black/40 backdrop-blur-lg border transition-all
                            ${toast.type === "success"
                                ? "bg-emerald-600/90 text-white border-emerald-500/30"
                                : toast.type === "error"
                                    ? "bg-red-600/90 text-white border-red-500/30"
                                    : "bg-slate-800/90 text-orange-50 border-white/10"
                            }`}
                    >
                        {toast.message}
                    </div>
                ))}

            </div> */}
{/* Toast container — Refined for Dark Academia */}
<div className="fixed bottom-10 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-3 pointer-events-none font-serif">
    {toasts.map((toast) => {
        // Theme-specific icons
        const Icon = {
            success: Feather,
            error: AlertCircle,
            info: Info
        }[toast.type];

        return (
            <div
                key={toast.id}
                className={`pointer-events-auto animate-slide-up relative flex items-center gap-4 px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-l-2 backdrop-blur-xl transition-all min-w-[280px]
                    ${toast.type === "success"
                        ? "bg-[#0d0d0d]/95 border-amber-700 text-[#e8e4db]"
                        : toast.type === "error"
                            ? "bg-[#0d0d0d]/95 border-red-900 text-red-200"
                            : "bg-[#0d0d0d]/95 border-stone-700 text-stone-200"
                    }`}
            >
                {/* Subtle paper texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }} />

                <div className="shrink-0">
                    <Icon size={18} className={toast.type === "success" ? "text-amber-600" : "text-red-800"} />
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-stone-600 font-sans font-black leading-none mb-1">
                        {toast.type === "success" ? "Cart Update" : "Archive Alert"}
                    </span>
                    <p className="text-sm italic tracking-tight leading-tight">
                        {toast.message}
                    </p>
                </div>
            </div>
        );
    })}
</div>
            {/* Keyframe animation */}
            <style jsx global>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(16px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    );
}
