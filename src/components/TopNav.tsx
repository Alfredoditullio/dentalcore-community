import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';
import { initials } from '@/lib/format';

export function TopNav({ user, profile }: { user: User | null; profile: Profile | null }) {
    return (
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 backdrop-blur bg-white/90">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">groups</span>
                    </div>
                    <span className="hidden sm:inline">Comunidad DentalCore</span>
                    <span className="sm:hidden">Comunidad</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">BETA</span>
                </Link>

                <div className="flex-1" />

                {user && profile ? (
                    <>
                        <Link
                            href="/new"
                            className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            <span className="hidden sm:inline">Nuevo post</span>
                        </Link>
                        <Link
                            href={`/u/${profile.handle}`}
                            className="size-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 hover:ring-2 hover:ring-primary/40 transition"
                            title={profile.display_name}
                        >
                            {profile.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.avatar_url} alt="" className="size-full rounded-full object-cover" />
                            ) : (
                                initials(profile.display_name)
                            )}
                        </Link>
                    </>
                ) : user && !profile ? (
                    <Link href="/onboarding" className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                        Completar perfil
                    </Link>
                ) : (
                    <Link href="/login" className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                        Ingresar
                    </Link>
                )}
            </div>
        </header>
    );
}
