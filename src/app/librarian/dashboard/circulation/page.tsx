
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ClipboardList, ScanLine, User, BookOpen, Clock, Check, AlertTriangle } from "lucide-react";
import ProcessQueueSideSheet from "../components/ProcessQueueSideSheet";
import ScanReturnSideSheet from "../components/ScanReturnSideSheet";

interface PendingRequest {
    id: string;
    requested_days: number;
    created_at: string;
    students: { full_name: string; roll_number: string };
    books: { title: string; author: string; isbn: string };
}

interface ActiveLoan {
    id: string;
    status: string;
    due_date: string;
    issued_at: string;
    students: { full_name: string; roll_number: string };
    books: { title: string; author: string; isbn: string };
}

export default function CirculationPage() {
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isQueueSheetOpen, setIsQueueSheetOpen] = useState(false);
    const [isReturnSheetOpen, setIsReturnSheetOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/circulation");
            if (res.ok) {
                const data = await res.json();
                setPendingRequests(data.pendingRequests);
                setActiveLoans(data.activeLoans);
            }
        } catch (err) { console.error("Failed to fetch circulation data:", err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-[#1a1a1a]">
            <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
        </div>
    );

    return (
        /* MAIN BACKGROUND UPDATE: 
           Changed to #1a1a1a to replicate the Student Dashboard.
        */
        <div className="w-full min-h-screen bg-[#1a1a1a] px-6 py-8 md:px-12 md:py-12 pb-32 font-serif selection:bg-amber-900/40">
            
            {/* Header: Consistent with Dashboard Typography */}
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-stone-800/60 pb-8">
                <div>
                    <h1 className="text-4xl font-normal text-[#e8e4db] md:text-5xl mb-1 leading-tight tracking-tight">
                        Circulation <span className="italic text-stone-500">Desk</span>
                    </h1>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-stone-600 mt-2">
                        Real-time operations overview
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsQueueSheetOpen(true)}
                        className="flex items-center gap-2.5 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border border-amber-700/30 px-5 py-3 font-sans text-[9px] font-black uppercase tracking-[0.15em] text-amber-50 shadow-2xl transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                        <ClipboardList size={14} /> Process Queue
                    </button>
                    <button
                        onClick={() => setIsReturnSheetOpen(true)}
                        className="flex items-center gap-2.5 bg-stone-900 border border-stone-800 px-5 py-3 font-sans text-[9px] font-black uppercase tracking-[0.15em] text-stone-400 shadow-xl transition-all hover:text-amber-500 hover:border-amber-900/40 active:scale-[0.98]"
                    >
                        <ScanLine size={14} /> Scan &amp; Return
                    </button>
                </div>
            </div>

            {/* ── Section 1: Pending Issue Requests ── */}
            <div className="mb-16">
                <p className="px-1 mb-6 text-[9px] uppercase tracking-[0.3em] text-stone-500 font-black font-sans flex items-center gap-2">
                    <ClipboardList size={12} className="text-amber-900" />
                    Pending Issue Requests ({pendingRequests.length})
                </p>

                {pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-[#0d0d0d] border border-stone-900/80 shadow-inner text-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-stone-900/50 bg-stone-950/40 shadow-inner">
                            <Check className="h-6 w-6 text-emerald-800" />
                        </div>
                        <h3 className="text-lg italic text-[#e8e4db] tracking-tight mb-1">All caught up</h3>
                        <p className="text-[10px] text-stone-600 font-sans tracking-wide">No pending issue requests in the queue.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-stone-800">
                                    <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Student</th>
                                    <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Book</th>
                                    <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans hidden md:table-cell">ISBN</th>
                                    <th className="pb-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans text-center">Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-900/40">
                                {pendingRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-stone-900/30 transition-colors border-b border-stone-900/30 group">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-stone-700 shrink-0" />
                                                <div>
                                                    <p className="text-sm text-[#e8e4db] italic tracking-tight">{req.students.full_name}</p>
                                                    <p className="text-[9px] text-stone-600 font-mono tracking-widest mt-0.5">{req.students.roll_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <p className="text-sm text-stone-400 italic tracking-tight line-clamp-1">{req.books.title}</p>
                                            <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.1em] mt-0.5">{req.books.author}</p>
                                        </td>
                                        <td className="py-4 pr-4 hidden md:table-cell">
                                            <p className="text-[9px] text-stone-600 font-mono tracking-widest">{req.books.isbn}</p>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-950/10 border border-amber-900/20 text-amber-700">
                                                {req.requested_days}d
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Section 2: Currently Active Loans ── */}
            <div className="mb-12">
                <p className="px-1 mb-6 text-[9px] uppercase tracking-[0.3em] text-stone-500 font-black font-sans flex items-center gap-2">
                    <BookOpen size={12} className="text-amber-900" />
                    Currently Active Loans ({activeLoans.length})
                </p>

                {activeLoans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-[#0d0d0d] border border-stone-900/80 shadow-inner text-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-stone-900/50 bg-stone-950/40 shadow-inner">
                            <BookOpen className="h-6 w-6 text-stone-800" />
                        </div>
                        <h3 className="text-lg italic text-[#e8e4db] tracking-tight mb-1">No active loans</h3>
                        <p className="text-[10px] text-stone-600 font-sans tracking-wide">All books are currently in the library.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-stone-800">
                                    <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Student</th>
                                    <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Book</th>
                                    <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans hidden md:table-cell">Issued</th>
                                    <th className="pb-4 pr-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans">Due Date</th>
                                    <th className="pb-4 text-[8px] uppercase tracking-[0.3em] text-stone-600 font-black font-sans text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-900/40">
                                {activeLoans.map((loan) => {
                                    const isOverdue = loan.status === "overdue";
                                    return (
                                        <tr key={loan.id} className="hover:bg-stone-900/30 transition-colors border-b border-stone-900/30 group">
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={12} className="text-stone-700 shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-[#e8e4db] italic tracking-tight">{loan.students.full_name}</p>
                                                        <p className="text-[9px] text-stone-600 font-mono tracking-widest mt-0.5">{loan.students.roll_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <p className="text-sm text-stone-400 italic tracking-tight line-clamp-1">{loan.books.title}</p>
                                                <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.1em] mt-0.5">{loan.books.author}</p>
                                            </td>
                                            <td className="py-4 pr-4 hidden md:table-cell">
                                                <p className="text-[10px] text-stone-500 font-sans tracking-wide">
                                                    {new Date(loan.issued_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <p className={`text-sm font-serif ${isOverdue ? "text-red-700" : "text-stone-400"}`}>
                                                    {new Date(loan.due_date).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border ${isOverdue ? "text-red-700 border-red-900/30 bg-red-950/10" : "text-emerald-700 border-emerald-900/30 bg-emerald-950/10"}`}>
                                                    {isOverdue ? <AlertTriangle size={9} /> : <Clock size={9} />}
                                                    {loan.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Side Sheets */}
            <ProcessQueueSideSheet isOpen={isQueueSheetOpen} onClose={() => { setIsQueueSheetOpen(false); fetchData(); }} />
            <ScanReturnSideSheet isOpen={isReturnSheetOpen} onClose={() => { setIsReturnSheetOpen(false); fetchData(); }} />
        </div>
    );
}