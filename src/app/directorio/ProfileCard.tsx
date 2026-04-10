import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { FollowButton } from '@/components/FollowButton';

const SPECIALTY_ICONS: Record<string, string> = {
    'endodoncia': 'stethoscope',
    'periodoncia': 'grass',
    'ortodoncia': 'straighten',
    'cirugía maxilofacial': 'surgical',
    'implantología': 'settings_input_component',
    'rehabilitación oral': 'dentistry',
    'odontopediatría': 'child_care',
    'estética dental': 'auto_awesome',
    'patología oral': 'biotech',
    'radiología oral': 'radiology',
    'prostodoncia': 'settings_input_component',
    'general': 'dentistry',
};

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

export function ProfileCard({
    profile: p,
    isFollowing = false,
    showFollowButton = false,
}: {
    profile: Profile;
    isFollowing?: boolean;
    showFollowButton?: boolean;
}) {
    const icon = SPECIALTY_ICONS[(p.specialty || '').toLowerCase()] || 'dentistry';

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-sm transition overflow-hidden">
            <Link href={`/u/${p.handle}`} className="block p-5">
                {/* Top row: avatar + name + points */}
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {p.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={p.avatar_url}
                            alt={p.display_name}
                            className="size-12 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                            <span className="text-primary font-black text-base">{getInitials(p.display_name)}</span>
                        </div>
                    )}

                    {/* Name + specialty */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 truncate text-[15px]">{p.display_name}</h3>
                            {p.reputation_points >= 200 && (
                                <span className="material-symbols-outlined text-[16px] text-amber-500" title={`${p.reputation_points} pts`}>
                                    military_tech
                                </span>
                            )}
                        </div>
                        {p.specialty && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="material-symbols-outlined text-[14px] text-primary">{icon}</span>
                                <span className="text-xs text-primary font-semibold">{p.specialty}</span>
                            </div>
                        )}
                    </div>

                    {/* Points */}
                    <div className="shrink-0 text-center pl-2">
                        <div className="text-lg font-black text-primary leading-tight">{p.reputation_points}</div>
                        <div className="text-[10px] text-slate-400 font-bold">pts</div>
                    </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 flex-wrap">
                    {p.country && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                            {p.city ? `${p.city}, ${p.country}` : p.country}
                        </span>
                    )}
                    {p.accepts_referrals && (
                        <span className="flex items-center gap-1 text-emerald-500 font-bold">
                            <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                            Derivaciones
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">group</span>
                        {p.follower_count ?? 0}
                    </span>
                </div>

                {/* Bio */}
                {p.bio && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{p.bio}</p>
                )}
            </Link>

            {/* Follow button - outside the link to avoid nested interactivity */}
            {showFollowButton && (
                <div className="px-5 pb-4 -mt-1">
                    <FollowButton targetUserId={p.user_id} initialFollowing={isFollowing} size="small" />
                </div>
            )}
        </div>
    );
}
