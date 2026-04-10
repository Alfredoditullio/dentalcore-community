import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { initials, timeAgo } from '@/lib/format';
import { MarkAllReadButton } from './MarkAllReadButton';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Notification {
    id: string;
    user_id: string;
    type: string;
    post_id: string | null;
    comment_id: string | null;
    actor_id: string;
    read_at: string | null;
    created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; text: string }> = {
    comment: { icon: 'chat_bubble', color: 'text-blue-600 bg-blue-100', text: 'comentó en tu post' },
    like: { icon: 'favorite', color: 'text-red-500 bg-red-100', text: 'le gustó tu post' },
    follow: { icon: 'person_add', color: 'text-purple-600 bg-purple-100', text: 'te empezó a seguir' },
    message: { icon: 'mail', color: 'text-emerald-600 bg-emerald-100', text: 'te envió un mensaje' },
};

export default async function NotificacionesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/notificaciones');

    // Fetch notifications
    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    const notifs = (notifications ?? []) as Notification[];

    // Fetch actor profiles
    const actorIds = [...new Set(notifs.map((n) => n.actor_id))];
    let actors = new Map<string, Pick<Profile, 'user_id' | 'display_name' | 'handle' | 'avatar_url'>>();
    if (actorIds.length > 0) {
        const { data } = await supabase
            .from('profiles')
            .select('user_id, display_name, handle, avatar_url')
            .in('user_id', actorIds);
        actors = new Map((data ?? []).map((p: any) => [p.user_id, p]));
    }

    // Fetch post titles for context
    const postIds = [...new Set(notifs.map((n) => n.post_id).filter(Boolean))] as string[];
    let posts = new Map<string, { id: string; title: string }>();
    if (postIds.length > 0) {
        const { data } = await supabase
            .from('posts')
            .select('id, title')
            .in('id', postIds);
        posts = new Map((data ?? []).map((p: any) => [p.id, p]));
    }

    // Mark all as read
    const unreadIds = notifs.filter((n) => !n.read_at).map((n) => n.id);
    if (unreadIds.length > 0) {
        await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadIds);
    }

    const unreadCount = unreadIds.length;

    function getLink(n: Notification): string {
        if (n.type === 'follow') {
            const actor = actors.get(n.actor_id);
            return actor ? `/u/${actor.handle}` : '/directorio';
        }
        if (n.type === 'message') {
            return `/mensajes/${n.actor_id}`;
        }
        if (n.post_id) return `/p/${n.post_id}`;
        return '/';
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="material-symbols-outlined text-primary text-[28px]">notifications</span>
                            <h1 className="text-xl font-black text-slate-900">Notificaciones</h1>
                        </div>
                        <p className="text-sm text-slate-500 ml-[40px]">
                            {unreadCount > 0
                                ? `${unreadCount} ${unreadCount === 1 ? 'nueva' : 'nuevas'} — marcadas como leídas`
                                : 'Todas al día'}
                        </p>
                    </div>
                </div>
            </div>

            {notifs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 text-center py-16">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">notifications_none</span>
                    <h3 className="font-bold text-slate-700 mt-2">No tenés notificaciones</h3>
                    <p className="text-sm text-slate-500 mt-1">Cuando alguien interactúe con tu contenido, vas a verlo acá.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {notifs.map((n) => {
                        const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.comment;
                        const actor = actors.get(n.actor_id);
                        const post = n.post_id ? posts.get(n.post_id) : null;
                        const isUnread = unreadIds.includes(n.id);

                        return (
                            <Link
                                key={n.id}
                                href={getLink(n)}
                                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition ${
                                    isUnread ? 'bg-primary/5' : ''
                                }`}
                            >
                                {/* Actor avatar */}
                                <div className="relative shrink-0">
                                    {actor?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={actor.avatar_url} alt="" className="size-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                                            {actor ? initials(actor.display_name) : '?'}
                                        </div>
                                    )}
                                    <span className={`absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center ${config.color}`}>
                                        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-800">
                                        <span className="font-bold">{actor?.display_name ?? 'Alguien'}</span>{' '}
                                        {config.text}
                                    </p>
                                    {post && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            &ldquo;{post.title}&rdquo;
                                        </p>
                                    )}
                                </div>

                                {/* Time */}
                                <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(n.created_at)}</span>

                                {/* Unread dot */}
                                {isUnread && (
                                    <span className="size-2.5 rounded-full bg-primary shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
