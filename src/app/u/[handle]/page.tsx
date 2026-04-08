import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchProfileByHandle, fetchFeed } from '@/lib/queries';
import { initials, timeAgo } from '@/lib/format';
import { PostCard } from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
    const { handle } = await params;
    const supabase = await createClient();
    const profile = await fetchProfileByHandle(supabase, handle);
    if (!profile) notFound();

    const { data: posts } = await supabase
        .from('posts')
        .select(`*, author:profiles!posts_author_id_fkey(*), category:categories!posts_category_slug_fkey(*)`)
        .eq('author_id', profile.user_id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(30);

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
                        <h1 className="text-xl font-bold text-slate-900">{profile.display_name}</h1>
                        <p className="text-sm text-slate-500">@{profile.handle}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            {profile.specialty && <span>{profile.specialty}</span>}
                            {profile.country && <span>· {profile.country}</span>}
                            <span>· Se unió {timeAgo(profile.created_at)}</span>
                        </div>
                    </div>
                </div>
                {profile.bio && (
                    <p className="text-sm text-slate-700 mt-4 whitespace-pre-wrap">{profile.bio}</p>
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
