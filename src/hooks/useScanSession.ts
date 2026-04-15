"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook for the "Magic Handoff" QR scanner architecture.
 * Creates a scan_session row, subscribes to Realtime updates,
 * and returns the session ID + any scanned ISBN.
 */
export function useScanSession(isOpen: boolean) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [scannedIsbn, setScannedIsbn] = useState<string | null>(null);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const createSession = useCallback(async () => {
        try {
            const res = await fetch("/api/scan-sessions", { method: "POST" });
            if (res.ok) {
                const { id } = await res.json();
                setSessionId(id);
                return id;
            }
        } catch (err) {
            console.error("Failed to create scan session:", err);
        }
        return null;
    }, []);

    const cleanupSession = useCallback(async (sid: string | null) => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
        if (sid) {
            fetch(`/api/scan-sessions?id=${sid}`, { method: "DELETE" }).catch(() => { });
        }
        setSessionId(null);
        setScannedIsbn(null);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            cleanupSession(sessionId);
            return;
        }

        let currentSessionId: string | null = null;

        (async () => {
            const sid = await createSession();
            if (!sid) return;
            currentSessionId = sid;

            const channel = supabase
                .channel(`scan-session-${sid}`)
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "scan_sessions",
                        filter: `id=eq.${sid}`,
                    },
                    (payload) => {
                        const isbn = (payload.new as { isbn?: string }).isbn;
                        if (isbn) {
                            setScannedIsbn(isbn);
                        }
                    }
                )
                .subscribe();

            channelRef.current = channel;
        })();

        return () => {
            cleanupSession(currentSessionId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return { sessionId, scannedIsbn, resetScannedIsbn: () => setScannedIsbn(null) };
}
