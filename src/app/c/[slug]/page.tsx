import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fetchFeed } from '@/lib/queries';
import { PostCard } from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
    if (!category) notFound();

    const posts = await fetchFeed(supabase, { categorySlug: slug });

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                    <div
                        className="size-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: (category.color ?? '#0284c7') + '15' }}
                    >
                        <span
                            className="material-symbols-outlined text-2xl"
                            style={{ color: category.color ?? '#0284c7' }}
                        >
                            {category.icon ?? 'tag'}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{category.name}</h1>
                        {category.description && (
                            <p className="text-sm text-slate-500 mt-0.5">{category.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <p className="font-semibold text-slate-700">Esta categoría todavía no tiene posts</p>
                    <Link href="/new" className="inline-block mt-4 text-primary font-semibold text-sm hover:underline">
                        Publicar el primero →
                    </Link>
                </div>
            ) : (
                posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
        </div>
    );
}
