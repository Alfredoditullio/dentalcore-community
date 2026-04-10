import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import { DirectoryFilters } from './DirectoryFilters';
import { ProfileCard } from './ProfileCard';

export const dynamic = 'force-dynamic';

const SPECIALTIES = [
    'Todas',
    'Odontología General',
    'Endodoncia',
    'Periodoncia',
    'Ortodoncia',
    'Cirugía Maxilofacial',
    'Implantología',
    'Rehabilitación Oral',
    'Odontopediatría',
    'Estética Dental',
    'Patología Oral',
    'Radiología Oral',
];

const COUNTRIES = [
    'Todos',
    'Argentina',
    'México',
    'Colombia',
    'Chile',
    'Perú',
    'Ecuador',
    'Venezuela',
    'Uruguay',
    'Paraguay',
    'Bolivia',
    'Costa Rica',
    'Panamá',
    'Guatemala',
    'España',
];

export default async function DirectorioPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; specialty?: string; country?: string }>;
}) {
    const { q, specialty, country } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('profiles')
        .select('*')
        .order('reputation_points', { ascending: false })
        .order('display_name');

    if (q) {
        query = query.or(`display_name.ilike.%${q}%,specialty.ilike.%${q}%,city.ilike.%${q}%`);
    }
    if (specialty && specialty !== 'Todas') {
        query = query.ilike('specialty', `%${specialty}%`);
    }
    if (country && country !== 'Todos') {
        query = query.eq('country', country);
    }

    const { data } = await query.limit(60);
    const profiles = (data ?? []) as Profile[];

    // Get current user's follows to show follow state on cards
    let followingSet = new Set<string>();
    if (user) {
        const { data: follows } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);
        followingSet = new Set((follows ?? []).map((f: any) => f.following_id));
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-primary text-[28px]">group</span>
                    <h1 className="text-xl font-black text-slate-900">Directorio de Profesionales</h1>
                </div>
                <p className="text-sm text-slate-500 ml-[40px]">
                    Encontrá colegas por especialidad, país o ciudad. Ideal para derivaciones y networking.
                </p>

                <DirectoryFilters
                    specialties={SPECIALTIES}
                    countries={COUNTRIES}
                    currentQ={q}
                    currentSpecialty={specialty}
                    currentCountry={country}
                />
            </div>

            <p className="text-xs text-slate-400 font-bold px-1">
                {profiles.length} {profiles.length === 1 ? 'profesional' : 'profesionales'}
                {specialty && specialty !== 'Todas' ? ` en ${specialty}` : ''}
                {country && country !== 'Todos' ? ` de ${country}` : ''}
            </p>

            {profiles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 text-center py-16">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">person_search</span>
                    <h3 className="font-bold text-slate-700 mt-2">No se encontraron profesionales</h3>
                    <p className="text-sm text-slate-500 mt-1">Probá con otros filtros o invitá colegas a unirse.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profiles.map((p) => (
                        <ProfileCard
                            key={p.user_id}
                            profile={p}
                            isFollowing={followingSet.has(p.user_id)}
                            showFollowButton={!!user && user.id !== p.user_id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
