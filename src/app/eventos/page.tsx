import { createClient } from '@/lib/supabase/server';
import type { CommunityEvent, Profile } from '@/lib/types';
import { EventCard } from './EventCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const EVENT_TYPE_LABELS: Record<string, string> = {
    webinar: 'Webinar',
    congress: 'Congreso',
    course: 'Curso',
    meetup: 'Meetup',
    workshop: 'Taller',
};

export default async function EventosPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; past?: string }>;
}) {
    const { type, past } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const now = new Date().toISOString();
    let query = supabase
        .from('events')
        .select('*, author:profiles!events_author_id_fkey(display_name, handle, avatar_url)')
        .order('starts_at', { ascending: past !== 'true' });

    if (past === 'true') {
        query = query.lt('starts_at', now);
    } else {
        query = query.gte('starts_at', now);
    }

    if (type) {
        query = query.eq('event_type', type);
    }

    const { data } = await query.limit(30);
    const events = (data ?? []) as (CommunityEvent & { author: Pick<Profile, 'display_name' | 'handle' | 'avatar_url'> })[];

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="material-symbols-outlined text-primary text-[28px]">event</span>
                            <h1 className="text-xl font-black text-slate-900">Eventos</h1>
                        </div>
                        <p className="text-sm text-slate-500 ml-[40px]">
                            Webinars, cursos, congresos y meetups de la comunidad.
                        </p>
                    </div>
                    {user && (
                        <Link
                            href="/eventos/nuevo"
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Crear evento
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <a
                        href="/eventos"
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                            !past && !type ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Próximos
                    </a>
                    <a
                        href="/eventos?past=true"
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                            past === 'true' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Pasados
                    </a>
                    <span className="text-slate-300">|</span>
                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                        <a
                            key={key}
                            href={`/eventos?type=${key}${past === 'true' ? '&past=true' : ''}`}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                                type === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {label}
                        </a>
                    ))}
                </div>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 text-center py-16">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">event_busy</span>
                    <h3 className="font-bold text-slate-700 mt-2">
                        {past === 'true' ? 'No hay eventos pasados' : 'No hay eventos próximos'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {user ? 'Sé el primero en crear un evento para la comunidad.' : 'Pronto habrá eventos.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((e) => (
                        <EventCard key={e.id} event={e} />
                    ))}
                </div>
            )}
        </div>
    );
}
