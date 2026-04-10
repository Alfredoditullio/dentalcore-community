'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function DirectoryFilters({
    specialties,
    countries,
    currentQ,
    currentSpecialty,
    currentCountry,
}: {
    specialties: string[];
    countries: string[];
    currentQ?: string;
    currentSpecialty?: string;
    currentCountry?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (!value || value === 'Todas' || value === 'Todos') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
            router.push(`/directorio?${params.toString()}`);
        },
        [router, searchParams],
    );

    return (
        <div className="mt-4 space-y-3">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    updateFilter('q', String(fd.get('q') ?? ''));
                }}
            >
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        name="q"
                        defaultValue={currentQ}
                        placeholder="Buscar por nombre, especialidad o ciudad..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>
            </form>

            <div className="flex flex-wrap gap-3">
                <select
                    value={currentSpecialty || 'Todas'}
                    onChange={(e) => updateFilter('specialty', e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {specialties.map((s) => (
                        <option key={s} value={s}>
                            {s === 'Todas' ? 'Especialidad' : s}
                        </option>
                    ))}
                </select>

                <select
                    value={currentCountry || 'Todos'}
                    onChange={(e) => updateFilter('country', e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {countries.map((c) => (
                        <option key={c} value={c}>
                            {c === 'Todos' ? 'País' : c}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
