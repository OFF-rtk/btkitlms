"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Inbox, Eye } from "lucide-react";
import ProcurementSideSheet, { type BookRequest } from "../components/ProcurementSideSheet";

const PLACEHOLDER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop";

export default function ProcurementPage() {
    const [requests, setRequests] = useState<BookRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/procurement");
            if (res.ok) setRequests(await res.json());
        } catch (err) { console.error("Failed to fetch procurement requests:", err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    function openReview(req: BookRequest) { setSelectedRequest(req); setIsReviewOpen(true); }
    function closeReview() { setIsReviewOpen(false); setSelectedRequest(null); }

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
                    Procurement <span className="italic text-stone-500">Inbox</span>
                </h1>
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-stone-600 mt-2">
                    {requests.length} pending request{requests.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Empty State */}
            {requests.length === 0 && (
                <div className="mt-20 flex flex-col items-center justify-center text-center">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-stone-800 bg-stone-900/40 shadow-inner">
                        <Inbox className="h-10 w-10 text-stone-800" />
                    </div>
                    <h2 className="mb-3 text-2xl font-normal text-[#e8e4db] italic tracking-tight">No pending requests</h2>
                    <p className="max-w-sm text-sm text-stone-600 font-sans leading-relaxed tracking-wide font-light uppercase">
                        All procurement requests have been processed.
                    </p>
                </div>
            )}

            {/* Request Cards Grid: Styled to match the catalogue cards */}
            {requests.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {requests.map((req) => (
                        <div key={req.id} className="group relative bg-[#0d0d0d] border border-stone-800/80 p-5 shadow-2xl hover:border-amber-900/40 transition-all rounded-sm">
                            <div className="flex gap-4 mb-5">
                                <div className="h-24 w-16 shrink-0 overflow-hidden border border-stone-800 shadow-xl bg-stone-950">
                                    <img
                                        src={req.cover_url || PLACEHOLDER}
                                        alt=""
                                        className="h-full w-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className="text-sm italic text-[#e8e4db] tracking-tight leading-tight line-clamp-2">{req.title}</h3>
                                    <p className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-[0.12em] mt-1">{req.author}</p>
                                    <p className="text-[9px] text-stone-600 font-mono tracking-widest mt-1 uppercase">ISBN: {req.isbn}</p>
                                </div>
                            </div>

                            {/* Reason snippet */}
                            {req.reason && (
                                <div className="mb-5 border-l border-stone-800 pl-4 py-1">
                                    <p className="text-[11px] text-stone-500 font-serif italic line-clamp-2 leading-relaxed">&ldquo;{req.reason}&rdquo;</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-stone-900/50">
                                <span className="text-[9px] text-stone-700 font-sans font-black tracking-widest uppercase">
                                    {new Date(req.created_at).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => openReview(req)}
                                    className="flex items-center gap-2 px-4 py-2 border border-amber-900/30 text-[9px] font-sans font-black uppercase tracking-[0.2em] text-amber-700 hover:bg-amber-900 hover:text-amber-50 transition-all shadow-lg"
                                >
                                    <Eye size={12} /> Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Side Sheet */}
            <ProcurementSideSheet
                request={selectedRequest}
                isOpen={isReviewOpen}
                onClose={closeReview}
                onUpdated={fetchRequests}
            />
        </div>
    );
}