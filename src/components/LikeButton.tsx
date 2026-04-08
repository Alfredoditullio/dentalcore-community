'use client';

import { useState, useTransition } from 'react';
import { toggleLike } from '@/app/actions';

export function LikeButton({
    postId,
    initialLiked,
    initialCount,
    disabled,
}: {
    postId: string;
    initialLiked: boolean;
    initialCount: number;
    disabled?: boolean;
}) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [isPending, startTransition] = useTransition();

    const onClick = () => {
        if (disabled || isPending) return;
        setLiked(!liked);
        setCount((c) => c + (liked ? -1 : 1));
        startTransition(async () => {
            const res = await toggleLike(postId);
            if (res && typeof res.liked === 'boolean') {
                setLiked(res.liked);
            }
        });
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold transition ${
                liked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
            <span
                className="material-symbols-outlined text-[20px]"
                style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
                favorite
            </span>
            {count}
        </button>
    );
}
