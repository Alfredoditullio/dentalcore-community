import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';
import { initials } from '@/lib/format';
import { NotificationBell } from './NotificationBell';

export function TopNav({
    user,
    profile,
    unreadMessages = 0,
    unreadNotifications = 0,
}: {
    user: User | null;
    profile: Profile | null;
    unreadMessages?: number;
    unreadNotifications?: number;
}) {
    return (
        <header className="sticky top-0 z-30 bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 text-white group">
                    <div className="size-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20 group-hover:bg-white/25 transition">
                        <span className="material-symbols-outlined text-[28px]">groups</span>
                    </div>
                    <div className="leading-tight">
                        <div className="flex items-center gap-2">
                            <span className="text-lg sm:text-xl font-extrabold tracking-tight">Comunidad DentalCore</span>
                            <span className="text-[10px] font-bold bg-amber-300 text-amber-900 px-1.5 py-0.5 rounded">BETA</span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-white/80 font-medium hidden sm:block">
                            La red de odontólogos de Latinoamérica
                        </div>
                    </div>
                </Link>

                <div className="flex-1" />

                {user && profile ? (
                    <div className="flex items-center gap-2">
                        {/* Notifications bell - polls every 30s */}
                        <NotificationBell initialCount={unreadNotifications} />

                        {/* Messages */}
                        <Link
                            href="/mensajes"
                            className="relative size-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25 transition"
                            title="Mensajes"
                        >
                            <span className="material-symbols-outlined text-[22px] text-white">mail</span>
                            {unreadMessages > 0 && (
                                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-sky-600">
                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                            )}
                        </Link>

                        {/* New post */}
                        <Link
                            href="/new"
                            className="inline-flex items-center gap-1.5 bg-white text-sky-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-sky-50 shadow-sm transition"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span className="hidden sm:inline">Nuevo post</span>
                        </Link>

                        {/* Avatar */}
                        <Link
                            href={`/u/${profile.handle}`}
                            className="size-10 rounded-full bg-white/15 backdrop-blur ring-2 ring-white/30 flex items-center justify-center font-bold text-white hover:ring-white/60 transition overflow-hidden"
                            title={profile.display_name}
                        >
                            {profile.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                            ) : (
                                initials(profile.display_name)
                            )}
                        </Link>
                    </div>
                ) : user && !profile ? (
                    <Link href="/onboarding" className="bg-amber-400 text-amber-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                        Completar perfil
                    </Link>
                ) : (
                    <Link href="/login" className="bg-white text-sky-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-sky-50 shadow-sm transition">
                        Ingresar
                    </Link>
                )}
            </div>
        </header>
    );
}
