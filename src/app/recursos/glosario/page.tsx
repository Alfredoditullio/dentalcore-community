import { createClient } from '@/lib/supabase/server';
import type { GlossaryTerm } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function GlossaryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const supabase = await createClient();
    let query = supabase.from('glossary_terms').select('*').order('term');
    if (q) query = query.ilike('term', `%${q}%`);
    const { data } = await query;
    const terms = (data ?? []) as GlossaryTerm[];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <form className="mb-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Buscar término (ej. bruxismo, gingivoplastia…)"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>
            </form>

            {terms.length === 0 ? (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">menu_book</span>
                    <h3 className="font-bold text-slate-700 mt-2">Glosario en construcción</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                        Estamos armando un glosario con los términos clínicos y técnicos más usados en odontología.
                    </p>
                </div>
            ) : (
                <dl className="space-y-4">
                    {terms.map((t) => (
                        <div key={t.id} className="pb-4 border-b border-slate-100 last:border-0">
                            <dt className="font-bold text-slate-900">{t.term}</dt>
                            <dd className="text-sm text-slate-600 mt-1">{t.definition}</dd>
                            {t.related_terms.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {t.related_terms.map((r) => (
                                        <span key={r} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{r}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}
