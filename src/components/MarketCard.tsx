import Link from 'next/link';
import type { PostWithAuthor, MarketMeta } from '@/lib/types';
import { timeAgo, initials } from '@/lib/format';

const LISTING_BADGE: Record<string, { label: string; icon: string; className: string }> = {
    sell: { label: 'Vendo', icon: 'sell', className: 'bg-emerald-100 text-emerald-700' },
    buy: { label: 'Compro', icon: 'shopping_cart', className: 'bg-blue-100 text-blue-700' },
    trade: { label: 'Permuto', icon: 'swap_horiz', className: 'bg-amber-100 text-amber-700' },
};

const CONDITION_LABEL: Record<string, string> = {
    new: 'Nuevo',
    like_new: 'Como nuevo',
    good: 'Buen estado',
    fair: 'Uso visible',
};

export function MarketCard({ post }: { post: PostWithAuthor }) {
    const meta = (post.metadata ?? {}) as Partial<MarketMeta>;
    const listing = LISTING_BADGE[meta.listing_type ?? ''] ?? LISTING_BADGE.sell;
    const hasImage = post.attachment_urls.length > 0;

    return (
        <Link
            href={`/p/${post.id}`}
            className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition overflow-hidden group"
        >
            {/* Image */}
            {hasImage ? (
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.attachment_urls[0]}
                        alt=""
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {post.attachment_urls.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                            +{post.attachment_urls.length - 1} fotos
                        </span>
                    )}
                    {meta.is_sold && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white font-black text-sm px-4 py-1.5 rounded-full uppercase tracking-wider">
                                Vendido
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50 to-slate-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[48px] text-emerald-200">storefront</span>
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${listing.className}`}>
                        <span className="material-symbols-outlined text-[12px]">{listing.icon}</span>
                        {listing.label}
                    </span>
                    {meta.condition && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100">
                            {CONDITION_LABEL[meta.condition] ?? meta.condition}
                        </span>
                    )}
                    {meta.item_category && (
                        <span className="text-[10px] font-semibold text-slate-400">
                            {meta.item_category}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition line-clamp-2">
                    {post.title}
                </h3>

                {/* Price */}
                {meta.price ? (
                    <div className="mt-2 text-lg font-black text-emerald-600">
                        {meta.currency ?? 'USD'} {meta.price}
                    </div>
                ) : (
                    <div className="mt-2 text-sm font-bold text-slate-400">A convenir</div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden shrink-0">
                            {post.author.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.author.avatar_url} alt="" className="size-full object-cover" />
                            ) : (
                                initials(post.author.display_name)
                            )}
                        </div>
                        <span className="text-xs text-slate-500 truncate">{post.author.display_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                        {meta.location && (
                            <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                {meta.location}
                            </span>
                        )}
                        <span>{timeAgo(post.created_at)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
