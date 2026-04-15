"use client";

import { useState } from "react";
import { BookOpen, Shield, ArrowRight, BadgeCheck, AlertCircle, Feather } from "lucide-react";

export default function LibrarianOnboardingPage() {
    const [employeeId, setEmployeeId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ------------------------------------------------------------------
    // BACKEND LOGIC BOUNDARY (UNCHANGED)
    // ------------------------------------------------------------------
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "librarian",
                    employee_id: employeeId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Onboarding failed");
                setLoading(false);
                return;
            }

            window.location.href = "/librarian/dashboard";
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    }
    // ------------------------------------------------------------------

    return (
        <div className="min-h-screen flex w-full bg-[#1a1a1a] text-[#e0d6c8] selection:bg-[#5c4033] selection:text-[#f4f1ea] font-serif">
            
            {/* LEFT SIDE: The Grand Library (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden p-12 xl:p-16 border-r border-[#3e352c]">
                
                {/* Historic Library Image Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-md scale-105 z-0" 
                    style={{ backgroundImage: "url('/images/login.png')" }}
                ></div>
                <div className="absolute inset-0 bg-black/80 z-0"></div>
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>

                <div className="relative z-10 flex items-center gap-4 text-[#d4af37]">
                    <div className="p-2 border border-[#d4af37]/30 rounded-sm">
                        <BookOpen size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-2xl xl:text-3xl font-normal tracking-widest uppercase">Libris</span>
                </div>

                <div className="relative z-10 text-[#f4f1ea] max-w-lg">
                    <div className="mb-6 inline-flex items-center gap-2 border-b border-[#d4af37]/50 pb-1 text-xs xl:text-sm font-semibold tracking-widest text-[#d4af37] uppercase">
                        <Feather size={14} />
                        Staff Verification
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-normal leading-tight mb-6 text-[#e8e4db] drop-shadow-md">
                        The Librarian's desk.
                    </h1>
                    <p className="text-[#a89f91] text-base xl:text-lg leading-relaxed font-sans font-light">
                        Please provide your staff identity. This ensures you have the proper authority to manage the book collection and approve student requests.
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

                {/* Mobile Header (Only small screens) */}
                <div className="flex lg:hidden items-center gap-3 mb-10 text-[#d4af37] relative z-10">
                    <BookOpen size={28} strokeWidth={1.5} />
                    <span className="text-xl sm:text-2xl font-normal tracking-widest uppercase">Libris</span>
                </div>

                <div className="w-full max-w-sm sm:max-w-md lg:max-w-sm xl:max-w-md mx-auto relative z-10">
                    
                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-1 flex-1 bg-[#3e352c] rounded-full overflow-hidden">
                            <div className="h-full bg-[#d4af37] w-full"></div>
                        </div>
                        <span className="text-xs font-sans tracking-widest text-[#d4af37] uppercase text-right">Verification</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-normal mb-2 sm:mb-3 text-[#e8e4db]">Staff Setup.</h2>
                    <p className="text-[#8c8273] text-sm sm:text-base mb-8 sm:mb-10 font-sans font-light">
                        Confirm your employee ID to access the dashboard.
                    </p>

                    {error && (
                        <div className="mb-6 sm:mb-8 flex items-center gap-3 bg-[#3e2c2c] p-3 sm:p-4 text-xs sm:text-sm font-sans text-[#e6b8b8] border-l-2 border-[#a34444]">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                        
                        {/* Employee ID Input */}
                        <div className="space-y-2">
                            <label htmlFor="employeeId" className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#a89f91] uppercase flex gap-1">
                                Employee ID <span className="text-[#a34444]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#5c544d]">
                                    <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <input
                                    id="employeeId"
                                    type="text"
                                    required
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="e.g. LIB-2024-0042"
                                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#26221f] border border-[#3e352c] text-base sm:text-sm text-[#e8e4db] focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all placeholder-[#4a423b] rounded-sm uppercase tracking-wider"
                                />
                            </div>
                            <p className="text-[10px] sm:text-xs text-[#5c544d] italic">
                                Use the ID provided by your college administration.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#3e352c] hover:bg-[#4a4035] border border-[#5c4f42] disabled:bg-[#26221f] disabled:text-[#5c544d] disabled:border-[#3e352c] disabled:cursor-not-allowed text-[#e8e4db] font-serif py-3 sm:py-3.5 rounded-sm transition-all mt-4 hover:border-[#d4af37]/50 active:scale-[0.98] shadow-lg"
                        >
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="tracking-wider uppercase text-xs sm:text-sm">
                                {loading ? "Verifying Credentials…" : "Continue to Dashboard"}
                            </span>
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}