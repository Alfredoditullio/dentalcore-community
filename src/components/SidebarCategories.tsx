'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Category } from '@/lib/types';

const COMMUNITY = [
    { href: '/directorio', icon: 'group', color: '#7c3aed', label: 'Directorio' },
    { href: '/eventos', icon: 'event', color: '#0891b2', label: 'Eventos' },
    { href: '/mensajes', icon: 'mail', color: '#2563eb', label: 'Mensajes' },
    { href: '/notificaciones', icon: 'notifications', color: '#f59e0b', label: 'Notificaciones' },
];

const RESOURCES = [
    { href: '/recursos/vademecum', icon: 'pill', color: '#dc2626', label: 'Vademécum' },
    { href: '/recursos/atlas', icon: 'biotech', color: '#ea580c', label: 'Atlas de patología oral' },
    { href: '/recursos/glosario', icon: 'menu_book', color: '#0d9488', label: 'Glosario dental' },
    { href: '/reglas', icon: 'security', color: '#64748b', label: 'Normas de la comunidad' },
];

export function SidebarCategories({ categories }: { categories: Category[] }) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <nav className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-3 space-y-0.5 shadow-sm">
            <Link
                href="/"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isHome
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Inicio
            </Link>

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Categorías
            </div>
            {categories.map((c) => {
                const href = `/c/${c.slug}`;
                const active = isActive(href);
                return (
                    <Link
                        key={c.slug}
                        href={href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                            active
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        style={active ? { boxShadow: `inset 3px 0 0 ${c.color ?? '#0284c7'}` } : undefined}
                    >
                        <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ color: c.color ?? '#64748b' }}
                        >
                            {c.icon ?? 'tag'}
                        </span>
                        <span className="flex-1 truncate">{c.name}</span>
                        {c.post_policy === 'admin_only' && (
                            <span className="material-symbols-outlined text-[14px] text-slate-300" title="Solo admin postea">lock</span>
                        )}
                    </Link>
                );
            })}

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Comunidad
            </div>
            {COMMUNITY.map((r) => {
                const active = isActive(r.href);
                return (
                    <Link
                        key={r.href}
                        href={r.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                            active
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        style={active ? { boxShadow: `inset 3px 0 0 ${r.color}` } : undefined}
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ color: r.color }}>
                            {r.icon}
                        </span>
                        {r.label}
                    </Link>
                );
            })}

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Recursos
            </div>
            {RESOURCES.map((r) => {
                const active = isActive(r.href);
                return (
                    <Link
                        key={r.href}
                        href={r.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                            active
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        style={active ? { boxShadow: `inset 3px 0 0 ${r.color}` } : undefined}
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ color: r.color }}>
                            {r.icon}
                        </span>
                        {r.label}
                    </Link>
                );
            })}
        </nav>
    );
}
