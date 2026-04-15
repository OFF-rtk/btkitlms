"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Hash, Book, GitBranch, Calendar, AlertCircle, Feather } from "lucide-react";

const COURSES = ["B.Tech", "M.Tech", "BCA", "MCA"];
const BRANCHES = [
    "Computer Science",
    "Electrical",
    "Mechanical",
    "Civil",
    "Electronics",
    "Information Technology",
    "Chemical",
    "Biotechnology",
];
const YEARS = [1, 2, 3, 4];

// ------------------------------------------------------------------
// CUSTOM DARK ACADEMIA DROPDOWN COMPONENT
// ------------------------------------------------------------------
function CustomDropdown({ id, value, onChange, options, placeholder, icon: Icon, required, isYear = false, disabled = false }: any) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <input 
                type="text" 
                id={id} 
                required={required && !disabled} 
                value={value} 
                onChange={() => {}} 
                className="opacity-0 absolute -z-10 w-0 h-0" 
            />

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 border ${isOpen ? 'border-[#d4af37]' : 'border-[#3e352c]'} text-base sm:text-sm ${value ? 'text-[#e8e4db]' : 'text-[#8c8273]'} focus:ring-1 focus:ring-[#d4af37] outline-none transition-all rounded-sm flex items-center justify-between ${disabled ? 'bg-[#1a1a1a] opacity-60 cursor-not-allowed' : 'bg-[#26221f] cursor-pointer'}`}
            >
                <div className={`absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none ${disabled ? 'text-[#4a423b]' : 'text-[#5c544d]'}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="truncate">{value ? (isYear && value !== "None" ? `Year ${value}` : value) : placeholder}</span>
                <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none ${disabled ? 'text-[#4a423b]' : 'text-[#5c544d]'}`}>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#d4af37]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {isOpen && !disabled && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-[#3e352c] rounded-sm shadow-2xl max-h-60 overflow-y-auto hide-scrollbar">
                        {options.map((opt: any) => (
                            <div
                                key={opt}
                                onClick={() => {
                                    onChange(opt.toString());
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center ${value === opt.toString() ? 'bg-[#3e352c] text-[#d4af37] border-l-2 border-[#d4af37]' : 'text-[#e8e4db] hover:bg-[#2b2622] hover:text-[#d4af37] border-l-2 border-transparent'}`}
                            >
                                {isYear ? `Year ${opt}` : opt}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
// ------------------------------------------------------------------

export default function StudentOnboardingPage() {
    const router = useRouter();

    const [rollNumber, setRollNumber] = useState("");
    const [course, setCourse] = useState("");
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ------------------------------------------------------------------
    // FRONTEND LOGIC: Handle Course Change for BCA/MCA
    // ------------------------------------------------------------------
    const handleCourseChange = (selectedCourse: string) => {
        setCourse(selectedCourse);
        
        // If course doesn't have a branch, auto-set to None visually
        if (["BCA", "MCA"].includes(selectedCourse)) {
            setBranch("None");
        } 
        // If they switch back from BCA/MCA to B.Tech, clear the "None" selection
        else if (branch === "None") {
            setBranch("");
        }
    };
    
    // Determine if branch dropdown should be locked
    const isBranchDisabled = ["BCA", "MCA"].includes(course);

    // ------------------------------------------------------------------
    // BACKEND LOGIC BOUNDARY (ENFORCED API PAYLOAD)
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
                    role: "student",
                    roll_number: rollNumber,
                    course,
                    // Hard-enforce "None" for API security if BCA/MCA is selected
                    branch: ["BCA", "MCA"].includes(course) ? "None" : branch,
                    year: year ? Number(year) : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Onboarding failed");
                return;
            }

            router.push("/student/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    // ------------------------------------------------------------------

    return (
        <div className="min-h-screen flex w-full bg-[#1a1a1a] text-[#e0d6c8] selection:bg-[#5c4033] selection:text-[#f4f1ea] font-serif">
            
            {/* LEFT SIDE: The Grand Library */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden p-12 xl:p-16 border-r border-[#3e352c]">
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
                        Scholar Enrollment
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-normal leading-tight mb-6 text-[#e8e4db] drop-shadow-md">
                        The final inscription.
                    </h1>
                    <p className="text-[#a89f91] text-base xl:text-lg leading-relaxed font-sans font-light">
                        Add your academic details to your profile. This helps us match you with the exact books you need for your classes.
                    </p>
                </div>

                <div className="relative z-10 text-[#7a7265] text-[10px] xl:text-xs font-sans uppercase tracking-widest">
                    Library • BTKIT,Dwarahat • PROJECT Libris
                </div>
            </div>

            {/* RIGHT SIDE: The Ledger Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 w-full md:max-w-xl lg:max-w-none mx-auto bg-[#1a1a1a] relative min-h-screen py-10">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-[#111111]/90"></div>

                <div className="flex lg:hidden items-center gap-3 mb-10 text-[#d4af37] relative z-10">
                    <BookOpen size={28} strokeWidth={1.5} />
                    <span className="text-xl sm:text-2xl font-normal tracking-widest uppercase">Libris</span>
                </div>

                <div className="w-full max-w-sm sm:max-w-md lg:max-w-sm xl:max-w-md mx-auto relative z-10">
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-1 flex-1 bg-[#3e352c] rounded-full overflow-hidden">
                            <div className="h-full bg-[#d4af37] w-full"></div>
                        </div>
                        <span className="text-xs font-sans tracking-widest text-[#d4af37] uppercase">Final Step</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-normal mb-2 sm:mb-3 text-[#e8e4db]">Complete Profile.</h2>
                    <p className="text-[#8c8273] text-sm sm:text-base mb-8 sm:mb-10 font-sans font-light flex items-center gap-2">
                        A few more details to access the archives.
                    </p>

                    {error && (
                        <div className="mb-6 sm:mb-8 flex items-center gap-3 bg-[#3e2c2c] p-3 sm:p-4 text-xs sm:text-sm font-sans text-[#e6b8b8] border-l-2 border-[#a34444]">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 font-sans">
                        
                        {/* Roll Number */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label htmlFor="rollNumber" className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#a89f91] uppercase flex gap-1">
                                Roll Number <span className="text-[#a34444]">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#5c544d]">
                                    <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <input
                                    id="rollNumber"
                                    type="text"
                                    required
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="e.g. 21CS1044"
                                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#26221f] border border-[#3e352c] text-base sm:text-sm text-[#e8e4db] focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all placeholder-[#4a423b] rounded-sm uppercase"
                                />
                            </div>
                        </div>

                        {/* CUSTOM Course Select */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label htmlFor="course" className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#a89f91] uppercase flex gap-1">
                                Course <span className="text-[#a34444]">*</span>
                            </label>
                            <CustomDropdown 
                                id="course"
                                value={course}
                                onChange={handleCourseChange}
                                options={COURSES}
                                placeholder="Select course"
                                icon={Book}
                                required={true}
                            />
                        </div>

                        {/* CUSTOM Branch Select */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label htmlFor="branch" className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#a89f91] uppercase flex gap-1">
                                Branch <span className="text-[#a34444]">*</span>
                            </label>
                            <CustomDropdown 
                                id="branch"
                                value={branch}
                                onChange={setBranch}
                                options={isBranchDisabled ? ["None"] : BRANCHES}
                                placeholder="Select branch"
                                icon={GitBranch}
                                required={true}
                                disabled={isBranchDisabled}
                            />
                        </div>

                        {/* CUSTOM Year Select */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <label htmlFor="year" className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#a89f91] uppercase flex gap-1">
                                Academic Year <span className="text-[#a34444]">*</span>
                            </label>
                            <CustomDropdown 
                                id="year"
                                value={year}
                                onChange={setYear}
                                options={YEARS}
                                placeholder="Select year"
                                icon={Calendar}
                                required={true}
                                isYear={true}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#3e352c] hover:bg-[#4a4035] border border-[#5c4f42] disabled:bg-[#26221f] disabled:text-[#5c544d] disabled:border-[#3e352c] disabled:cursor-not-allowed text-[#e8e4db] font-serif py-3 sm:py-3.5 rounded-sm transition-all mt-8 hover:border-[#d4af37]/50 active:scale-[0.98]"
                        >
                            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="tracking-wider uppercase text-xs sm:text-sm">
                                {loading ? "Saving Details…" : "Continue to Dashboard"}
                            </span>
                        </button>
                    </form>

                </div>
            </div>
            
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}