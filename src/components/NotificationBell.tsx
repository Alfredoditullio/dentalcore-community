'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function NotificationBell({ initialCount }: { initialCount: number }) {
    const [count, setCount] = useState(initialCount);

    // Poll every 30 seconds for new notifications
    useEffect(() => {
        const poll = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
                const res = await fetch(`${base}/api/notifications/count`);
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count);
                }
            } catch {
                // Silently fail
            }
        };

        const interval = setInterval(poll, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Link
            href="/notificaciones"
            className="relative size-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25 transition"
            title="Notificaciones"
        >
            <span className="material-symbols-outlined text-[22px] text-white">notifications</span>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-sky-600">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </Link>
    );
}
