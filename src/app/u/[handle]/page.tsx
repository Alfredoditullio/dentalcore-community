import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchProfileByHandle } from '@/lib/queries';
import { initials, timeAgo } from '@/lib/format';
import { PostCard } from '@/components/PostCard';
import { FollowButton } from '@/components/FollowButton';
import type { Badge, UserBadge } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
    const { handle } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const profile = await fetchProfileByHandle(supabase, handle);
    if (!profile) notFound();

    const isOwnProfile = user?.id === profile.user_id;
    const canMessage = user && !isOwnProfile;

    // Check if current user follows this profile
    let isFollowing = false;
    if (user && !isOwnProfile) {
        const { data: follow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.user_id)
            .maybeSingle();
        isFollowing = !!follow;
    }

    const [{ data: posts }, { data: badgesRaw }] = await Promise.all([
        supabase
            .from('posts')
            .select(`*, author:profiles!posts_author_profile_fkey(*), category:categories!posts_category_slug_fkey(*)`)
            .eq('author_id', profile.user_id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(30),
        supabase
            .from('user_badges')
            .select('*, badge:badges(*)')
            .eq('user_id', profile.user_id)
            .order('awarded_at', { ascending: false }),
    ]);

    const userBadges = (badgesRaw ?? []) as (UserBadge & { badge: Badge })[];

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-4">
                    <div className="size-20 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-2xl overflow-hidden">
                        {profile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                        ) : (
                            initials(profile.display_name)
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900">{profile.display_name}</h1>
                            {profile.reputation_points >= 200 && (
                                <span className="material-symbols-outlined text-[18px] text-amber-500" title={`${profile.reputation_points} pts`}>
                                    military_tech
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">@{profile.handle}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            {profile.specialty && <span>{profile.specialty}</span>}
                            {profile.country && <span>· {profile.city ? `${profile.city}, ${profile.country}` : profile.country}</span>}
                            <span>· Se unió {timeAgo(profile.created_at)}</span>
                            {profile.accepts_referrals && (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                    · <span className="material-symbols-outlined text-[13px]">swap_horiz</span> Acepta derivaciones
                                </span>
                            )}
                        </div>

                        {/* Follower stats */}
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm">
                                <span className="font-bold text-slate-900">{profile.follower_count ?? 0}</span>{' '}
                                <span className="text-slate-500">{(profile.follower_count ?? 0) === 1 ? 'seguidor' : 'seguidores'}</span>
                            </span>
                            <span className="text-sm">
                                <span className="font-bold text-slate-900">{profile.following_count ?? 0}</span>{' '}
                                <span className="text-slate-500">siguiendo</span>
                            </span>
                        </div>

                        {/* Action buttons */}
                        {canMessage && (
                            <div className="flex items-center gap-2 mt-2">
                                <FollowButton targetUserId={profile.user_id} initialFollowing={isFollowing} />
                                <Link
                                    href={`/mensajes/${profile.user_id}`}
                                    className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition border border-slate-200"
                                >
                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                    Mensaje
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 text-center">
                        <div className="text-2xl font-black text-primary">{profile.reputation_points}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Reputación</div>
                    </div>
                </div>
                {profile.bio && (
                    <p className="text-sm text-slate-700 mt-4 whitespace-pre-wrap">{profile.bio}</p>
                )}

                {/* Badges */}
                {userBadges.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Insignias</div>
                        <div className="flex flex-wrap gap-2">
                            {userBadges.map((ub) => (
                                <span
                                    key={ub.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                    style={{ backgroundColor: ub.badge.color + '20', color: ub.badge.color }}
                                    title={ub.badge.description ?? ub.badge.name}
                                >
                                    <span className="material-symbols-outlined text-[14px]">{ub.badge.icon}</span>
                                    {ub.badge.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h2 className="font-bold text-slate-900 px-1">Posts</h2>
                {(posts ?? []).length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
                        Todavía no publicó nada.
                    </div>
                ) : (
                    (posts as any[]).map((p) => <PostCard key={p.id} post={p} />)
                )}
            </div>

            <div className="text-center">
                <Link href="/" className="text-sm text-primary font-semibold hover:underline">
                    ← Volver al feed
                </Link>
            </div>
        </div>
    );
}
