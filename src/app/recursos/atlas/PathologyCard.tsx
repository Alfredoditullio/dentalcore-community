'use client';

import { useState } from 'react';
import type { OralPathology } from '@/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
    'Lesiones blancas': 'bg-slate-100 text-slate-700',
    'Lesiones rojas': 'bg-red-100 text-red-700',
    'Lesiones ulcerativas': 'bg-orange-100 text-orange-700',
    'Lesiones pigmentadas': 'bg-violet-100 text-violet-700',
    'Infecciones fúngicas': 'bg-amber-100 text-amber-700',
    'Infecciones virales': 'bg-pink-100 text-pink-700',
    'Infecciones bacterianas': 'bg-fuchsia-100 text-fuchsia-700',
    'Enfermedades vesículo-ampollares': 'bg-rose-100 text-rose-700',
    'Neoplasias malignas': 'bg-red-200 text-red-800',
    'Neoplasias benignas': 'bg-lime-100 text-lime-700',
    'Quistes odontogénicos': 'bg-sky-100 text-sky-700',
    'Quistes no odontogénicos': 'bg-indigo-100 text-indigo-700',
    'Patología de glándulas salivales': 'bg-cyan-100 text-cyan-700',
    'Lesiones reactivas': 'bg-teal-100 text-teal-700',
    'Patología periodontal': 'bg-emerald-100 text-emerald-700',
    'Patología ósea': 'bg-stone-100 text-stone-700',
    'Patología de ATM': 'bg-blue-100 text-blue-700',
    'Trastornos del desarrollo': 'bg-purple-100 text-purple-700',
};

function Section({ icon, title, content }: { icon: string; title: string; content: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">{title}</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pl-[22px]">{content}</p>
        </div>
    );
}

export function PathologyCard({ pathology: p }: { pathology: OralPathology }) {
    const [expanded, setExpanded] = useState(false);
    const categoryColor = CATEGORY_COLORS[p.category || ''] || 'bg-slate-100 text-slate-600';
    const isMalignant = p.category === 'Neoplasias malignas';

    return (
        <article className={`rounded-xl border overflow-hidden bg-white transition-all ${
            isMalignant ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200 hover:border-primary/30'
        }`}>
            {/* Header — always visible */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            {p.category && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColor}`}>
                                    {p.category}
                                </span>
                            )}
                            {isMalignant && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[12px]">warning</span>
                                    Maligno
                                </span>
                            )}
                        </div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight">{p.name}</h3>
                    </div>
                </div>

                {/* Description — always shown */}
                {p.description && (
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">{p.description}</p>
                )}

                {/* Expand button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition"
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {expanded ? 'expand_less' : 'expand_more'}
                    </span>
                    {expanded ? 'Ver menos' : 'Ver detalles clínicos'}
                </button>
            </div>

            {/* Expanded clinical details */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {p.clinical_features && (
                        <Section icon="stethoscope" title="Características Clínicas" content={p.clinical_features} />
                    )}
                    {p.differential && (
                        <Section icon="compare_arrows" title="Diagnóstico Diferencial" content={p.differential} />
                    )}
                    {p.treatment && (
                        <Section icon="medication" title="Tratamiento" content={p.treatment} />
                    )}
                </div>
            )}
        </article>
    );
}
