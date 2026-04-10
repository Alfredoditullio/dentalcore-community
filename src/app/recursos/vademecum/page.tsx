import { createClient } from '@/lib/supabase/server';
import type { VademecumDrug } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function VademecumPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const supabase = await createClient();
    let query = supabase.from('vademecum_drugs').select('*').order('name');
    if (q) query = query.or(`name.ilike.%${q}%,generic_name.ilike.%${q}%`);
    const { data } = await query;
    const drugs = (data ?? []) as VademecumDrug[];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <form className="mb-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Buscar medicamento (ej. amoxicilina, ibuprofeno…)"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>
            </form>

            {drugs.length === 0 ? (
                <EmptyState
                    icon="pill"
                    title="Vademécum en construcción"
                    message="Estamos cargando los medicamentos más usados en odontología. Pronto vas a poder buscar dosis, contraindicaciones e interacciones."
                />
            ) : (
                <ul className="divide-y divide-slate-100">
                    {drugs.map((d) => (
                        <li key={d.id} className="py-4">
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">{d.name}</h3>
                                {d.category && (
                                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{d.category}</span>
                                )}
                            </div>
                            {d.generic_name && <p className="text-xs text-slate-500 mb-2">{d.generic_name}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {d.adult_dose && <Field label="Dosis adulto" value={d.adult_dose} />}
                                {d.pediatric_dose && <Field label="Dosis pediátrica" value={d.pediatric_dose} />}
                                {d.contraindications && <Field label="Contraindicaciones" value={d.contraindications} />}
                                {d.interactions && <Field label="Interacciones" value={d.interactions} />}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
            <div className="text-slate-700">{value}</div>
        </div>
    );
}

function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
    return (
        <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-slate-300">{icon}</span>
            <h3 className="font-bold text-slate-700 mt-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">{message}</p>
        </div>
    );
}
