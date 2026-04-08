import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchPost, fetchComments } from '@/lib/queries';
import { timeAgo, initials } from '@/lib/format';
import { LikeButton } from '@/components/LikeButton';
import { CommentForm } from '@/components/CommentForm';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const post = await fetchPost(supabase, id);
    if (!post) notFound();

    const [{ data: { user } }, comments] = await Promise.all([
        supabase.auth.getUser(),
        fetchComments(supabase, id),
    ]);

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
                <div className="prose-post">{post.body}</div>

                <footer className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
                    <LikeButton postId={post.id} initialLiked={userLiked} initialCount={post.like_count} disabled={!user} />
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        {post.comment_count} comentarios
                    </span>
                </footer>
            </article>

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
