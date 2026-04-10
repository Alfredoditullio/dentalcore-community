import type { CommunityEvent, Profile } from '@/lib/types';

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
    webinar: { icon: 'videocam', color: 'bg-blue-100 text-blue-700', label: 'Webinar' },
    congress: { icon: 'groups', color: 'bg-purple-100 text-purple-700', label: 'Congreso' },
    course: { icon: 'school', color: 'bg-emerald-100 text-emerald-700', label: 'Curso' },
    meetup: { icon: 'handshake', color: 'bg-amber-100 text-amber-700', label: 'Meetup' },
    workshop: { icon: 'construction', color: 'bg-rose-100 text-rose-700', label: 'Taller' },
};

function formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatEventTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function EventCard({
    event: e,
}: {
    event: CommunityEvent & { author: Pick<Profile, 'display_name' | 'handle' | 'avatar_url'> };
}) {
    const config = TYPE_CONFIG[e.event_type] || TYPE_CONFIG.webinar;
    const isPast = new Date(e.starts_at) < new Date();

    return (
        <article className={`bg-white rounded-xl border border-slate-200 p-5 transition ${isPast ? 'opacity-60' : 'hover:border-primary/30 hover:shadow-sm'}`}>
            <div className="flex gap-4">
                {/* Date block */}
                <div className="shrink-0 text-center w-16">
                    <div className="bg-primary/10 rounded-xl p-2">
                        <div className="text-2xl font-black text-primary">
                            {new Date(e.starts_at).getDate()}
                        </div>
                        <div className="text-[10px] font-bold text-primary/70 uppercase">
                            {new Date(e.starts_at).toLocaleDateString('es-AR', { month: 'short' })}
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold mt-1">
                        {formatEventTime(e.starts_at)}
                    </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${config.color}`}>
                            <span className="material-symbols-outlined text-[12px]">{config.icon}</span>
                            {config.label}
                        </span>
                        {e.is_free ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                Gratis
                            </span>
                        ) : e.price ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                {e.price}
                            </span>
                        ) : null}
                        {isPast && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                Finalizado
                            </span>
                        )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-lg">{e.title}</h3>

                    {e.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{e.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        {e.location && (
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {e.location}
                            </span>
                        )}
                        {e.event_url && !isPast && (
                            <a
                                href={e.event_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary font-bold hover:underline"
                            >
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                Unirse
                            </a>
                        )}
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {e.author?.display_name}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
