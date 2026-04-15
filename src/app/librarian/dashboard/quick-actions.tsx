"use client";

import { useState } from "react";
import { ScanLine, ClipboardList, BookPlus } from "lucide-react";
import ScanReturnSideSheet from "./components/ScanReturnSideSheet";
import ProcessQueueSideSheet from "./components/ProcessQueueSideSheet";
import AddBookSideSheet from "./components/AddBookSideSheet";

const quickActions = [
    { id: "scan", label: "Scan & Return Book", icon: ScanLine, desc: "Process a book return via barcode" },
    { id: "queue", label: "Process Request Queue", icon: ClipboardList, desc: "Review pending issue requests" },
    { id: "add", label: "Add New Book to Catalog", icon: BookPlus, desc: "Register a new volume in the system" },
] as const;

type SheetId = "scan" | "queue" | "add" | null;

export function QuickActions() {
    const [openSheet, setOpenSheet] = useState<SheetId>(null);

    return (
        <>
            <div className="mb-12">
                <p className="px-1 mb-6 text-[9px] uppercase tracking-[0.3em] text-stone-700 font-black font-sans">
                    Quick Actions
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => setOpenSheet(action.id)}
                            className="group relative flex flex-col items-center gap-4 bg-[#0d0d0d] border border-stone-900 p-8 shadow-inner hover:border-amber-900/40 transition-all text-center"
                        >
                            <div className="flex h-14 w-14 items-center justify-center border border-amber-900/20 bg-[#0a0a0a] text-amber-700 group-hover:bg-amber-900/10 transition-all">
                                <action.icon size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.25em] text-[#e8e4db] mb-2 group-hover:text-amber-500 transition-colors">
                                    {action.label}
                                </h3>
                                <p className="text-[10px] text-stone-600 font-sans tracking-wide leading-relaxed">
                                    {action.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <ScanReturnSideSheet isOpen={openSheet === "scan"} onClose={() => setOpenSheet(null)} />
            <ProcessQueueSideSheet isOpen={openSheet === "queue"} onClose={() => setOpenSheet(null)} />
            <AddBookSideSheet isOpen={openSheet === "add"} onClose={() => setOpenSheet(null)} />
        </>
    );
}
