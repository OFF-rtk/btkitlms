"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogIn, Mail, Lock, AlertCircle, Feather } from "lucide-react";

export default function LoginPage() {
const params = useParams();
const role = params.role as string;

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const roleLabel = role === "librarian" ? "Librarian" : "Student";

// ------------------------------------------------------------------
// BACKEND LOGIC BOUNDARY (UNCHANGED)
// ------------------------------------------------------------------
async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        console.log("[LOGIN-UI] Step A — fetch status:", res.status);
        const data = await res.json();
        console.log("[LOGIN-UI] Step B — response body:", JSON.stringify(data));

        if (!res.ok) {
            setError(data.error || "Login failed");
            setLoading(false);
            return;
        }

        /* data.role is always "student" or "librarian" (from DB) */
        const target = !data.onboardingComplete
            ? `/onboarding/${data.role}`
            : `/${data.role}/dashboard`;
        console.log("[LOGIN-UI] Step C — navigating to:", target);
        window.location.href = target;
        /* Don't setLoading(false) — page is navigating away */
    } catch (err) {
        console.error("[LOGIN-UI] CAUGHT ERROR:", err);
        setError("Something went wrong. Please try again.");
        setLoading(false);
    }
}
// ------------------------------------------------------------------

return (
    <div className="min-h-screen flex w-full bg-[#1a1a1a] text-[#e0d6c8] selection:bg-[#5c4033] selection:text-[#f4f1ea] font-serif">
        
        {/* LEFT SIDE: The Grand Library (Hidden on smaller screens) */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden p-12 xl:p-16 border-r border-[#3e352c]">
            
            {/* 1. The Historic Library Background Image (Blurred) */}
            <div 
                className="absolute inset-0 bg-cover bg-center blur-md scale-105 z-0" 
                style={{ backgroundImage: "url('/images/login.png')" }}
            ></div>

            {/* 2. Heavy Dark Overlay to make it moody and readable */}
            <div className="absolute inset-0 bg-black/80 z-0"></div>
            
            {/* 3. Subtle textured overlay for that aged paper feel */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>

            {/* ALL TEXT AND LOGOS WRAPPED IN RELATIVE z-10 TO FLOAT ABOVE BACKGROUND */}
            <div className="relative z-10 flex items-center gap-4 text-[#d4af37]">
                <div className="p-2 border border-[#d4af37]/30 rounded-sm">
                    <BookOpen size={32} strokeWidth={1.5} />
                </div>
                <span className="text-2xl xl:text-3xl font-normal tracking-widest uppercase">Libris</span>
            </div>

            <div className="relative z-10 text-[#f4f1ea] max-w-lg">
                <div className="mb-6 inline-flex items-center gap-2 border-b border-[#d4af37]/50 pb-1 text-xs xl:text-sm font-semibold tracking-widest text-[#d4af37] uppercase">
                    <Feather size={14} />
                    {roleLabel} Portal
                </div>
                <h1 className="text-4xl xl:text-5xl font-normal leading-tight mb-6 text-[#e8e4db] drop-shadow-md">
                    Knowledge demands order.
                </h1>
                <p className="text-[#a89f91] text-base xl:text-lg leading-relaxed font-sans font-light">
                    {role === "librarian" 
                        ? "Manage the library. Check book records, approve returns, and keep the collection organized."
                        : "Skip the lines. Scan, borrow, and track your academic books in seconds."}
                </p>
            </div>

            <div className="relative z-10 text-[#7a7265] text-[10px] xl:text-xs font-sans uppercase tracking-widest">
                Library • BTKIT,Dwarahat • PROJECT libris
            </div>
        </div>

        {/* RIGHT SIDE: The Ledger Form (Fully Mobile Responsive) */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 w-full md:max-w-xl lg:max-w-none mx-auto bg-[#1a1a1a] relative min-h-screen py-10">
            
            {/* Subtle vignette effect for mobile depth */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-[#111111]/90"></div>

            {/* Mobile Header (Shows only on small screens) */}
            <div className="flex lg:hidden items-center gap-3 mb-10 text-[#d4af37] relative z-10">
                <BookOpen size={28} strokeWidth={1.5} />
                <span className="text-xl sm:text-2xl font-normal tracking-widest uppercase">Libris</span>
            </div>

            <div className="w-full max-w-sm sm:max-w-md lg:max-w-sm xl:max-w-md mx-auto relative z-10">
                <h2 className="text-3xl sm:text-4xl font-normal mb-2 sm:mb-3 text-[#e8e4db]">Welcome back</h2>
                <p className="text-[#8c8273] text-sm sm:text-base mb-8 sm:mb-10 font-sans font-light flex items-center gap-2">
                    Present your credentials to the <span className="font-semibold text-[#d4af37] italic">{roleLabel}</span> desk.
                </p>

                {error && (
                    <div className="mb-6 sm:mb-8 flex items-center gap-3 bg-[#3e2c2c] p-3 sm:p-4 text-xs sm:text-sm font-sans text-[#e6b8b8] border-l-2 border-[#a34444]">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 font-sans">
                    
                    {/* Email Input */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="email" className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#a89f91] uppercase">
                             Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#5c544d]">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="student@university.edu"
                                /* Notice text-base sm:text-sm to prevent iOS zoom */
                                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#26221f] border border-[#3e352c] text-base sm:text-sm text-[#e8e4db] focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all placeholder-[#4a423b] rounded-sm"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <label htmlFor="password" className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#a89f91] uppercase">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#5c544d]">
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#26221f] border border-[#3e352c] text-base sm:text-sm text-[#e8e4db] focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all placeholder-[#4a423b] rounded-sm"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#3e352c] hover:bg-[#4a4035] border border-[#5c4f42] disabled:bg-[#26221f] disabled:text-[#5c544d] disabled:border-[#3e352c] disabled:cursor-not-allowed text-[#e8e4db] font-serif py-3 sm:py-3.5 rounded-sm transition-all mt-6 sm:mt-8 hover:border-[#d4af37]/50 active:scale-[0.98]"
                    >
                        <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="tracking-wider uppercase text-xs sm:text-sm">
                            {loading ? "Unlocking Archives…" : "Sign In"}
                        </span>
                    </button>
                </form>

                {/* Registration Link */}
                <div className="mt-8 sm:mt-10 text-center font-sans">
                    <p className="text-xs sm:text-sm text-[#7a7265]">
                        Don't have an account?{" "}
                        <Link href={`/auth/${role}/register`} className="text-[#d4af37] hover:text-[#f4e094] font-semibold transition-colors border-b border-[#d4af37]/30 hover:border-[#d4af37] pb-0.5">
                            Register here.
                        </Link>
                    </p>
                </div>

                {/* Portal Switcher */}
                <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-[#2b2622]">
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <span className="text-[10px] sm:text-xs font-sans tracking-widest text-[#5c544d] uppercase">Or access alternate archives</span>
                        {role === "student" ? (
                            <Link href="/auth/librarian/login" className="font-serif text-xs sm:text-sm italic text-[#8c8273] hover:text-[#d4af37] transition-colors py-1">
                                Proceed to Librarian Desk &rarr;
                            </Link>
                        ) : (
                            <Link href="/auth/student/login" className="font-serif text-xs sm:text-sm italic text-[#8c8273] hover:text-[#d4af37] transition-colors py-1">
                                Proceed to Scholar Desk &rarr;
                            </Link>
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
);
}