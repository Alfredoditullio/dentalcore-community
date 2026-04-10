import { createClient } from '@/lib/supabase/server';
import type { OralPathology } from '@/lib/types';
import { PathologyCard } from './PathologyCard';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
    'Todas',
    'Lesiones blancas',
    'Lesiones rojas',
    'Lesiones ulcerativas',
    'Lesiones pigmentadas',
    'Infecciones fúngicas',
    'Infecciones virales',
    'Infecciones bacterianas',
    'Enfermedades vesículo-ampollares',
    'Neoplasias malignas',
    'Neoplasias benignas',
    'Quistes odontogénicos',
    'Quistes no odontogénicos',
    'Patología de glándulas salivales',
    'Lesiones reactivas',
    'Patología periodontal',
    'Patología ósea',
    'Patología de ATM',
    'Trastornos del desarrollo',
];

export default async function AtlasPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
    const { q, cat } = await searchParams;
    const supabase = await createClient();
    let query = supabase.from('oral_pathologies').select('*').order('name');
    if (q) query = query.ilike('name', `%${q}%`);
    if (cat && cat !== 'Todas') query = query.eq('category', cat);
    const { data } = await query;
    const items = (data ?? []) as OralPathology[];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-primary text-[28px]">biotech</span>
                    <h1 className="text-xl font-black text-slate-900">Atlas de Patología Oral</h1>
                </div>
                <p className="text-sm text-slate-500 ml-[40px]">
                    Guía visual de patologías orales con diagnóstico diferencial y tratamiento.
                    Basado en Neville, Regezi y clasificación OMS.
                </p>

                {/* Search */}
                <form className="mt-4">
                    {cat && <input type="hidden" name="cat" value={cat} />}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Buscar patología (ej. liquen plano, candidiasis, melanoma…)"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                    </div>
                </form>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {CATEGORIES.map((c) => {
                        const isActive = (!cat && c === 'Todas') || cat === c;
                        return (
                            <a
                                key={c}
                                href={`/recursos/atlas?cat=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {c}
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-400 font-bold">
                    {items.length} {items.length === 1 ? 'patología' : 'patologías'}
                    {cat && cat !== 'Todas' ? ` en "${cat}"` : ''}
                    {q ? ` para "${q}"` : ''}
                </p>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 text-center py-16">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">biotech</span>
                    <h3 className="font-bold text-slate-700 mt-2">No se encontraron patologías</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                        Intentá con otro término de búsqueda o seleccioná otra categoría.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map((p) => (
                        <PathologyCard key={p.id} pathology={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
