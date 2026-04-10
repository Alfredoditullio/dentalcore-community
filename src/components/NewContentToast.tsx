'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NewContentToastProps {
    /** The endpoint to poll, e.g. /api/poll/feed or /api/poll/comments?postId=xxx */
    endpoint: string;
    /** Current known count to compare against */
    currentCount: number;
    /** Label to show, e.g. "comentarios nuevos" or "posts nuevos" */
    label: string;
}

export function NewContentToast({ endpoint, currentCount, label }: NewContentToastProps) {
    const [newCount, setNewCount] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const pathname = usePathname();

    // Reset on navigation
    useEffect(() => {
        setNewCount(0);
        setDismissed(false);
    }, [pathname]);

    // Poll every 20 seconds
    useEffect(() => {
        const poll = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
                const res = await fetch(`${base}${endpoint}`);
                if (res.ok) {
                    const data = await res.json();
                    const diff = data.count - currentCount;
                    if (diff > 0) setNewCount(diff);
                }
            } catch {
                // Silently fail
            }
        };

        const interval = setInterval(poll, 20000);
        return () => clearInterval(interval);
    }, [endpoint, currentCount]);

    if (newCount <= 0 || dismissed) return null;

    return (
        <button
            onClick={() => {
                setDismissed(true);
                window.location.reload();
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-primary/90 transition flex items-center gap-2 text-sm font-bold animate-bounce"
        >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            {newCount} {label}
        </button>
    );
}
