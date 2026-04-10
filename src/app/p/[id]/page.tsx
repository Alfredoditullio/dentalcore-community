import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchPost, fetchComments } from '@/lib/queries';
import { timeAgo, initials } from '@/lib/format';
import { LikeButton } from '@/components/LikeButton';
import { CommentForm } from '@/components/CommentForm';
import { PollDisplay } from '@/components/PollDisplay';
import { NewContentToast } from '@/components/NewContentToast';
import type { Poll, PollVote, MarketMeta } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const post = await fetchPost(supabase, id);
    if (!post) notFound();

    const [{ data: { user } }, comments, { data: pollData }] = await Promise.all([
        supabase.auth.getUser(),
        fetchComments(supabase, id),
        supabase.from('polls').select('*').eq('post_id', id).maybeSingle(),
    ]);

    const poll = pollData as Poll | null;
    let pollVotes: PollVote[] = [];
    if (poll) {
        const { data } = await supabase.from('poll_votes').select('*').eq('poll_id', poll.id);
        pollVotes = (data ?? []) as PollVote[];
    }

    let userLiked = false;
    if (user) {
        const { data } = await supabase
            .from('likes')
            .select('post_id')
            .eq('post_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
        userLiked = !!data;
    }

    return (
        <div className="space-y-4">
            <article className="bg-white rounded-xl border border-slate-200 p-6">
                <header className="flex items-center gap-3 mb-4">
                    <Link
                        href={`/u/${post.author.handle}`}
                        className="size-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm"
                    >
                        {post.author.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.author.avatar_url} alt="" className="size-full rounded-full object-cover" />
                        ) : (
                            initials(post.author.display_name)
                        )}
                    </Link>
                    <div className="flex-1 min-w-0">
                        <Link href={`/u/${post.author.handle}`} className="font-semibold text-slate-900 hover:underline">
                            {post.author.display_name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            {post.author.specialty && <span>{post.author.specialty}</span>}
                            {post.author.country && <span>· {post.author.country}</span>}
                            <span>·</span>
                            <Link
                                href={`/c/${post.category.slug}`}
                                className="inline-flex items-center gap-1 font-medium"
                                style={{ color: post.category.color ?? undefined }}
                            >
                                <span className="material-symbols-outlined text-[14px]">{post.category.icon ?? 'tag'}</span>
                                {post.category.name}
                            </Link>
                            <span>·</span>
                            <span>{timeAgo(post.created_at)}</span>
                        </div>
                    </div>
                </header>

                <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-4">{post.title}</h1>

                {/* Mercado info bar */}
                {post.category.slug === 'mercado' && post.metadata && (() => {
                    const m = post.metadata as Partial<MarketMeta>;
                    const listingLabels: Record<string, string> = { sell: 'Vendo', buy: 'Compro', trade: 'Permuto' };
                    const condLabels: Record<string, string> = { new: 'Nuevo', like_new: 'Como nuevo', good: 'Buen estado', fair: 'Uso visible' };
                    return (
                        <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            {m.listing_type && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                    {listingLabels[m.listing_type] ?? m.listing_type}
                                </span>
                            )}
                            {m.price ? (
                                <span className="text-xl font-black text-emerald-700">{m.currency ?? 'USD'} {m.price}</span>
                            ) : (
                                <span className="text-sm font-bold text-slate-500">A convenir</span>
                            )}
                            {m.condition && (
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {condLabels[m.condition] ?? m.condition}
                                </span>
                            )}
                            {m.item_category && (
                                <span className="text-xs text-slate-500">{m.item_category}</span>
                            )}
                            {m.location && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    {m.location}
                                </span>
                            )}
                            {m.is_sold && (
                                <span className="text-xs font-bold uppercase text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Vendido</span>
                            )}
                        </div>
                    );
                })()}

                <div className="prose-post">{post.body}</div>

                {poll && (
                    <PollDisplay poll={poll} votes={pollVotes} userId={user?.id ?? null} />
                )}

                <footer className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
                    <LikeButton postId={post.id} initialLiked={userLiked} initialCount={post.like_count} disabled={!user} />
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        {post.comment_count} comentarios
                    </span>
                </footer>
            </article>

            <NewContentToast
                endpoint={`/api/poll/comments?postId=${id}`}
                currentCount={comments.length}
                label="comentarios nuevos"
            />

            <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4">Comentarios</h2>

                {user ? (
                    <CommentForm postId={post.id} />
                ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-600 mb-4">
                        <Link href={`/login?next=/p/${post.id}`} className="text-primary font-semibold hover:underline">
                            Ingresá
                        </Link>{' '}
                        para comentar.
                    </div>
                )}

                <div className="space-y-4 mt-6">
                    {comments.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">Todavía no hay comentarios. Sé el primero.</p>
                    ) : (
                        comments.map((c) => (
                            <div key={c.id} className="flex gap-3">
                                <Link
                                    href={`/u/${c.author.handle}`}
                                    className="size-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs flex-shrink-0"
                                >
                                    {c.author.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={c.author.avatar_url} alt="" className="size-full rounded-full object-cover" />
                                    ) : (
                                        initials(c.author.display_name)
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0 bg-slate-50 rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Link href={`/u/${c.author.handle}`} className="font-semibold text-slate-900 hover:underline">
                                            {c.author.display_name}
                                        </Link>
                                        <span className="text-slate-400">{timeAgo(c.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{c.body}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
