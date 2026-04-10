import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchCategories } from '@/lib/queries';
import { NewPostForm } from '@/components/NewPostForm';

export const dynamic = 'force-dynamic';

const HEADINGS: Record<string, { title: string; subtitle: string }> = {
    presentaciones: {
        title: 'Presentate a la comunidad',
        subtitle: 'Contanos quién sos, de dónde venís y qué hacés. Conocé colegas latinos.',
    },
    'casos-clinicos': {
        title: 'Compartí un caso clínico',
        subtitle: 'Pedí segunda opinión, mostrá un caso resuelto o abrí un debate clínico.',
    },
};

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/new');

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, role')
        .eq('user_id', user.id)
        .maybeSingle();
    if (!profile) redirect('/onboarding');

    const categories = await fetchCategories(supabase);
    const isAdmin = profile.role === 'admin' || profile.role === 'moderator';
    const h = category ? HEADINGS[category] : undefined;

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{h?.title ?? 'Nuevo post'}</h1>
            <p className="text-sm text-slate-500 mb-6">{h?.subtitle ?? 'Compartí con la comunidad DentalCore.'}</p>
            <NewPostForm categories={categories} isAdmin={isAdmin} initialCategory={category} userId={user.id} />
        </div>
    );
}
