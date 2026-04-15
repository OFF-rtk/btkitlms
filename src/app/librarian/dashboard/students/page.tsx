
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Search, Users, Eye } from "lucide-react";
import StudentDetailsSideSheet, { type Student } from "../components/StudentDetailsSideSheet";

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchStudents = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/students");
            if (res.ok) setStudents(await res.json());
        } catch (err) { console.error("Failed to fetch students:", err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    function openDetail(s: Student) { setSelectedStudent(s); setIsDetailOpen(true); }
    function closeDetail() { setIsDetailOpen(false); setSelectedStudent(null); }

    function activeCount(s: Student) {
        return (s.borrowings ?? []).filter((b) => b.status === "active" || b.status === "overdue").length;
    }

    const filtered = students.filter((s) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return s.full_name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q);
    });

    if (loading) return (
        /* Matching the dashboard background during loading */
        <div className="flex h-screen w-full items-center justify-center bg-[#1a1a1a]">
            <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
        </div>
    );

    return (
        /* CRITICAL UPDATE: Background set to #1a1a1a to match Student Dashboard */
        <div className="w-full min-h-screen bg-[#1a1a1a] px-6 py-8 md:px-12 md:py-12 pb-32 font-serif selection:bg-amber-900/40">
            
            {/* Header: Consistent with Dashboard Typography */}
            <div className="mb-10 border-b border-stone-800/60 pb-8">
                <h1 className="text-4xl font-normal text-[#e8e4db] md:text-5xl mb-1 leading-tight tracking-tight">
                    Student <span className="italic text-stone-500">Directory</span>
                </h1>
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-stone-600 mt-2">
                    {students.length} registered student{students.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Search: Adjusted for #1a1a1a background */}
            <div className="mb-8 relative max-w-2xl">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or roll number…"
                    className="w-full bg-stone-900/40 border border-stone-800 pl-11 pr-4 py-3.5 text-sm text-stone-300 font-sans outline-none focus:border-amber-900/50 transition-colors placeholder:text-stone-700 shadow-inner"
                />
            </div>

            {/* Empty State */}
            {students.length === 0 && (
                <div className="mt-20 flex flex-col items-center justify-center text-center">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-stone-800 bg-stone-900/40 shadow-inner">
                        <Users className="h-10 w-10 text-stone-800" />
                    </div>
                    <h2 className="mb-3 text-2xl font-normal text-[#e8e4db] italic tracking-tight">No students yet</h2>
                    <p className="max-w-sm text-sm text-stone-600 font-sans leading-relaxed tracking-wide font-light uppercase">
                        Students will appear here once they register and complete onboarding.
                    </p>
                </div>
            )}

            {/* No results */}
            {students.length > 0 && filtered.length === 0 && (
                <div className="mt-16 text-center">
                    <p className="text-lg italic text-stone-600 tracking-tight font-serif">No students match &ldquo;{search}&rdquo;</p>
                </div>
            )}

            {/* Table: Matching the Obsidian Registry Style */}
            {filtered.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-stone-800">
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Name</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Roll Number</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans hidden md:table-cell">Course</th>
                                <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans text-center">Active Loans</th>
                                <th className="pb-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-900/40">
                            {filtered.map((s) => {
                                const loans = activeCount(s);
                                return (
                                    <tr key={s.id} className="hover:bg-stone-900/30 transition-colors border-b border-stone-900/30 group">
                                        <td className="py-4 pr-4">
                                            <p className="text-sm text-[#e8e4db] italic tracking-tight">{s.full_name}</p>
                                            <p className="text-[9px] text-stone-600 font-mono tracking-widest mt-0.5 md:hidden uppercase">{s.roll_number}</p>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <p className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">{s.roll_number}</p>
                                        </td>
                                        <td className="py-4 pr-4 hidden md:table-cell">
                                            <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.12em]">
                                                {[s.course, s.branch].filter(Boolean).join(" · ") || "—"}
                                            </p>
                                        </td>
                                        <td className="py-4 pr-4 text-center">
                                            <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${loans > 0 ? "text-amber-500 border-amber-900/30 bg-amber-950/10" : "text-stone-600 border-stone-800 bg-stone-950/30"}`}>
                                                {loans}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => openDetail(s)}
                                                className="flex items-center gap-1.5 ml-auto px-4 py-2 border border-stone-800 text-[9px] font-sans font-black uppercase tracking-[0.15em] text-stone-500 hover:text-amber-600 hover:border-amber-900/40 hover:bg-amber-900/5 transition-all shadow-lg"
                                            >
                                                <Eye size={12} /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Side Sheet */}
            <StudentDetailsSideSheet
                student={selectedStudent}
                isOpen={isDetailOpen}
                onClose={closeDetail}
                onUpdated={() => { fetchStudents(); closeDetail(); }}
            />
        </div>
    );
}