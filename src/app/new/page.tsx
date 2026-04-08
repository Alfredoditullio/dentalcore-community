import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchCategories } from '@/lib/queries';
import { createPost } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/new');

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
    if (!profile) redirect('/onboarding');

    const categories = await fetchCategories(supabase);

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6">
            <h1 className="text-xl font-bold text-slate-900 mb-4">Nuevo post</h1>

            <form action={createPost} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                    <select
                        name="category_slug"
                        defaultValue={category ?? categories[0]?.slug}
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Título</label>
                    <input
                        name="title"
                        required
                        minLength={4}
                        maxLength={200}
                        placeholder="¿Cómo resolverías este caso?"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contenido</label>
                    <textarea
                        name="body"
                        required
                        minLength={1}
                        maxLength={20000}
                        rows={12}
                        placeholder="Compartí el caso, tu duda, tu experiencia… (Markdown básico soportado)"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <a
                        href="/"
                        className="px-4 py-2 text-sm text-slate-600 font-semibold hover:text-slate-900"
                    >
                        Cancelar
                    </a>
                    <button
                        type="submit"
                        className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        Publicar
                    </button>
                </div>
            </form>
        </div>
    );
}
