import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { markMessagesAsRead } from '@/app/actions';
import { initials, timeAgo } from '@/lib/format';
import { MessageForm } from './MessageForm';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    body: string;
    read_at: string | null;
    created_at: string;
}

export default async function ConversationPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId: otherUserId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/mensajes');

    // Fetch the other user's profile
    const { data: otherProfile } = await supabase
        .from('profiles')
        .select('user_id, display_name, handle, avatar_url, specialty, country, city')
        .eq('user_id', otherUserId)
        .single();

    if (!otherProfile) notFound();

    // Fetch conversation messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })
        .limit(200);

    const msgs = (messages ?? []) as Message[];

    // Mark unread messages as read
    const hasUnread = msgs.some((m) => m.receiver_id === user.id && !m.read_at);
    if (hasUnread) {
        await markMessagesAsRead(otherUserId);
    }

    // Group messages by date
    const grouped = new Map<string, Message[]>();
    for (const msg of msgs) {
        const dateKey = new Date(msg.created_at).toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
        if (!grouped.has(dateKey)) grouped.set(dateKey, []);
        grouped.get(dateKey)!.push(msg);
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/mensajes"
                        className="size-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition shrink-0"
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-600">arrow_back</span>
                    </Link>

                    <Link href={`/u/${otherProfile.handle}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                        {otherProfile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={otherProfile.avatar_url}
                                alt={otherProfile.display_name}
                                className="size-10 rounded-full object-cover shrink-0"
                            />
                        ) : (
                            <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                                <span className="text-primary font-black text-sm">{initials(otherProfile.display_name)}</span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-primary transition truncate">
                                {otherProfile.display_name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                {otherProfile.specialty && <span>{otherProfile.specialty}</span>}
                                {otherProfile.country && (
                                    <span>· {otherProfile.city ? `${otherProfile.city}, ${otherProfile.country}` : otherProfile.country}</span>
                                )}
                            </div>
                        </div>
                    </Link>

                    <Link
                        href={`/u/${otherProfile.handle}`}
                        className="text-xs text-slate-400 hover:text-primary font-semibold shrink-0"
                    >
                        Ver perfil
                    </Link>
                </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 min-h-[400px] flex flex-col">
                {msgs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                        <span className="material-symbols-outlined text-[48px] text-slate-200">chat</span>
                        <p className="text-sm text-slate-400 mt-2">
                            Empezá la conversación con {otherProfile.display_name}
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 space-y-6 mb-6">
                        {Array.from(grouped.entries()).map(([dateLabel, dayMsgs]) => (
                            <div key={dateLabel}>
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-[11px] text-slate-400 font-semibold capitalize">{dateLabel}</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                                <div className="space-y-3">
                                    {dayMsgs.map((msg) => {
                                        const isMine = msg.sender_id === user.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                                                        isMine
                                                            ? 'bg-primary text-white rounded-br-md'
                                                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                                    }`}
                                                >
                                                    {msg.body}
                                                    <div
                                                        className={`text-[10px] mt-1 ${
                                                            isMine ? 'text-white/60' : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {new Date(msg.created_at).toLocaleTimeString('es-AR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                        {isMine && msg.read_at && (
                                                            <span className="ml-1">✓✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Message input */}
                <MessageForm receiverId={otherUserId} />
            </div>
        </div>
    );
}
