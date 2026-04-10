import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { initials, timeAgo } from '@/lib/format';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ConversationPreview {
    other_user: Pick<Profile, 'user_id' | 'display_name' | 'handle' | 'avatar_url' | 'specialty'>;
    last_message_body: string;
    last_message_at: string;
    last_sender_id: string;
    unread_count: number;
}

export default async function MensajesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/mensajes');

    // Get all messages involving this user, ordered by newest
    const { data: messages } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, body, read_at, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(500);

    interface MessageRow {
        id: string;
        sender_id: string;
        receiver_id: string;
        body: string;
        read_at: string | null;
        created_at: string;
    }

    // Group into conversations
    const convMap = new Map<string, { lastMsg: MessageRow; unread: number }>();
    for (const msg of (messages ?? []) as MessageRow[]) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(otherId)) {
            convMap.set(otherId, { lastMsg: msg, unread: 0 });
        }
        if (msg.receiver_id === user.id && !msg.read_at) {
            convMap.get(otherId)!.unread++;
        }
    }

    // Fetch profiles for all other users
    const otherIds = Array.from(convMap.keys());
    let profiles: Pick<Profile, 'user_id' | 'display_name' | 'handle' | 'avatar_url' | 'specialty'>[] = [];
    if (otherIds.length > 0) {
        const { data } = await supabase
            .from('profiles')
            .select('user_id, display_name, handle, avatar_url, specialty')
            .in('user_id', otherIds);
        profiles = data ?? [];
    }

    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

    // Build conversation list
    const conversations: ConversationPreview[] = Array.from(convMap.entries())
        .map(([otherId, { lastMsg, unread }]) => ({
            other_user: profileMap.get(otherId) ?? {
                user_id: otherId,
                display_name: 'Usuario',
                handle: 'unknown',
                avatar_url: null,
                specialty: null,
            },
            last_message_body: lastMsg.body,
            last_message_at: lastMsg.created_at,
            last_sender_id: lastMsg.sender_id,
            unread_count: unread,
        }))
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
                    <h1 className="text-xl font-black text-slate-900">Mensajes</h1>
                </div>
                <p className="text-sm text-slate-500 ml-[40px]">
                    Tus conversaciones privadas con colegas.
                </p>
            </div>

            {conversations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 text-center py-16">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">forum</span>
                    <h3 className="font-bold text-slate-700 mt-2">No tenés mensajes</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Visitá el{' '}
                        <Link href="/directorio" className="text-primary font-semibold hover:underline">
                            directorio
                        </Link>{' '}
                        y contactá colegas.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {conversations.map((conv) => (
                        <Link
                            key={conv.other_user.user_id}
                            href={`/mensajes/${conv.other_user.user_id}`}
                            className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition ${
                                conv.unread_count > 0 ? 'bg-primary/5' : ''
                            }`}
                        >
                            {/* Avatar */}
                            {conv.other_user.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={conv.other_user.avatar_url}
                                    alt={conv.other_user.display_name}
                                    className="size-12 rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                                    <span className="text-primary font-black text-sm">
                                        {initials(conv.other_user.display_name)}
                                    </span>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                        {conv.other_user.display_name}
                                    </span>
                                    <span className="text-[11px] text-slate-400 shrink-0">
                                        {timeAgo(conv.last_message_at)}
                                    </span>
                                </div>
                                {conv.other_user.specialty && (
                                    <div className="text-[11px] text-primary/70 font-medium">{conv.other_user.specialty}</div>
                                )}
                                <p className={`text-sm truncate mt-0.5 ${conv.unread_count > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                    {conv.last_sender_id === user.id && (
                                        <span className="text-slate-400">Vos: </span>
                                    )}
                                    {conv.last_message_body}
                                </p>
                            </div>

                            {/* Unread badge */}
                            {conv.unread_count > 0 && (
                                <span className="size-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
