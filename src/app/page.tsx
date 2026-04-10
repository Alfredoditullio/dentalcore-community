import { createClient } from '@/lib/supabase/server';
import { fetchFeed } from '@/lib/queries';
import { PostCard } from '@/components/PostCard';
import { NewContentToast } from '@/components/NewContentToast';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const posts = await fetchFeed(supabase, { limit: 30 });

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary-600 to-sky-500 rounded-2xl p-6 text-white shadow-sm">
                <h1 className="text-xl sm:text-2xl font-bold mb-1">Bienvenido a la Comunidad DentalCore</h1>
                <p className="text-sm text-white/90 max-w-xl">
                    El lugar donde los odontólogos de Latinoamérica compartimos casos, dudas, aprendemos y crecemos juntos.
                </p>
                {!user && (
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 mt-4 bg-white text-primary font-bold px-4 py-2 rounded-lg hover:bg-slate-50"
                    >
                        Ingresar con tu cuenta DentalCore
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                )}
            </div>

            <NewContentToast
                endpoint="/api/poll/feed"
                currentCount={posts.length}
                label="posts nuevos"
            />

            {posts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="size-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">forum</span>
                    </div>
                    <p className="font-semibold text-slate-700">Todavía no hay posts</p>
                    <p className="text-sm text-slate-500 mt-1">Sé el primero en compartir algo con la comunidad.</p>
                    {user && (
                        <Link
                            href="/new"
                            className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
                        >
                            Crear primer post
                        </Link>
                    )}
                </div>
            ) : (
                posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
        </div>
    );
}
