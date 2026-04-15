"use client";

import { useState, useCallback, type ReactNode, createContext, useContext } from "react";

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
            <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
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
