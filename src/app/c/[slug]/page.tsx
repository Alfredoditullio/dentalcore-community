import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchFeed } from '@/lib/queries';
import { PostCard } from '@/components/PostCard';
import { MarketCard } from '@/components/MarketCard';

export const dynamic = 'force-dynamic';

const CLINICAL_FILTERS = [
    { key: '', label: 'Todos', icon: 'apps' },
    { key: 'help', label: 'Pido ayuda', icon: 'help' },
    { key: 'resolved', label: 'Resueltos', icon: 'check_circle' },
    { key: 'debate', label: 'Debates', icon: 'forum' },
];

const MARKET_FILTERS = [
    { key: '', label: 'Todos', icon: 'apps' },
    { key: 'sell', label: 'Vendo', icon: 'sell' },
    { key: 'buy', label: 'Compro', icon: 'shopping_cart' },
    { key: 'trade', label: 'Permuto', icon: 'swap_horiz' },
];

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ type?: string }>;
}) {
    const { slug } = await params;
    const { type } = await searchParams;
    const supabase = await createClient();
    const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
    if (!category) notFound();

    const isMercado = slug === 'mercado';
    const isClinical = slug === 'casos-clinicos';
    const isAdminOnly = category.post_policy === 'admin_only';

    let posts = await fetchFeed(supabase, { categorySlug: slug, postType: isClinical ? type : undefined });

    // Filter mercado by listing_type
    if (isMercado && type) {
        posts = posts.filter((p: any) => p.metadata?.listing_type === type);
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                    <div
                        className="size-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: (category.color ?? '#0284c7') + '15' }}
                    >
                        <span className="material-symbols-outlined text-2xl" style={{ color: category.color ?? '#0284c7' }}>
                            {category.icon ?? 'tag'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold text-slate-900">{category.name}</h1>
                            {isAdminOnly && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                    Canal oficial
                                </span>
                            )}
                        </div>
                        {category.description && <p className="text-sm text-slate-500 mt-0.5">{category.description}</p>}
                        {isAdminOnly && (
                            <p className="text-xs text-slate-400 mt-2">
                                Solo el equipo de DentalCore publica aquí. Podés comentar libremente.
                            </p>
                        )}
                    </div>
                </div>

                {(isClinical || isMercado) && (
                    <div className="flex gap-2 mt-4 -mx-5 px-5 overflow-x-auto">
                        {(isMercado ? MARKET_FILTERS : CLINICAL_FILTERS).map((f) => {
                            const active = (type ?? '') === f.key;
                            return (
                                <Link
                                    key={f.key || 'all'}
                                    href={f.key ? `/c/${slug}?type=${f.key}` : `/c/${slug}`}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                        active
                                            ? isMercado ? 'bg-emerald-600 text-white' : 'bg-primary text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
                                    {f.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {posts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <p className="font-semibold text-slate-700">
                        {type ? 'No hay posts con este filtro' : 'Esta categoría todavía no tiene posts'}
                    </p>
                    {!isAdminOnly && (
                        <Link href={`/new?category=${slug}`} className="inline-block mt-4 text-primary font-semibold text-sm hover:underline">
                            Publicar el primero →
                        </Link>
                    )}
                </div>
            ) : isMercado ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((p) => <MarketCard key={p.id} post={p} />)}
                </div>
            ) : (
                posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
        </div>
    );
}
