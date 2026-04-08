import Link from 'next/link';
import type { PostWithAuthor } from '@/lib/types';
import { timeAgo, initials } from '@/lib/format';

export function PostCard({ post }: { post: PostWithAuthor }) {
    return (
        <article className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition p-5">
            <header className="flex items-center gap-3 mb-3">
                <Link
                    href={`/u/${post.author.handle}`}
                    className="size-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0"
                >
                    {post.author.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.author.avatar_url} alt="" className="size-full rounded-full object-cover" />
                    ) : (
                        initials(post.author.display_name)
                    )}
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href={`/u/${post.author.handle}`} className="font-semibold text-slate-900 hover:underline truncate">
                            {post.author.display_name}
                        </Link>
                        {post.author.country && (
                            <span className="text-xs text-slate-400">· {post.author.country}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Link
                            href={`/c/${post.category.slug}`}
                            className="inline-flex items-center gap-1 font-medium hover:text-primary"
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

            <Link href={`/p/${post.id}`} className="block group">
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-primary transition leading-snug mb-2">
                    {post.title}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">
                    {post.body}
                </p>
            </Link>

            <footer className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    {post.like_count}
                </span>
                <Link href={`/p/${post.id}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                    {post.comment_count}
                </Link>
            </footer>
        </article>
    );
}
