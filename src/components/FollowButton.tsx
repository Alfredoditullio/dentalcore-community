'use client';

import { useState, useTransition } from 'react';
import { toggleFollow } from '@/app/actions';

export function FollowButton({
    targetUserId,
    initialFollowing,
    size = 'default',
}: {
    targetUserId: string;
    initialFollowing: boolean;
    size?: 'default' | 'small';
}) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isHovering, setIsHovering] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
            const result = await toggleFollow(targetUserId);
            setIsFollowing(result.following);
        });
    }

    const label = isFollowing
        ? isHovering ? 'Dejar de seguir' : 'Siguiendo'
        : 'Seguir';

    const icon = isFollowing
        ? isHovering ? 'person_remove' : 'check'
        : 'person_add';

    if (size === 'small') {
        return (
            <button
                onClick={handleClick}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                disabled={isPending}
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition disabled:opacity-50 ${
                    isFollowing
                        ? isHovering
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                }`}
            >
                <span className="material-symbols-outlined text-[14px]">{icon}</span>
                {label}
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            disabled={isPending}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                isFollowing
                    ? isHovering
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-primary text-white hover:bg-primary/90'
            }`}
        >
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {label}
        </button>
    );
}
