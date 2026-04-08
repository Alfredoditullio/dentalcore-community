import Link from 'next/link';
import type { Category } from '@/lib/types';

export function SidebarCategories({ categories }: { categories: Category[] }) {
    return (
        <nav className="sticky top-20 bg-white rounded-xl border border-slate-200 p-3 space-y-1">
            <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Inicio
            </Link>
            <div className="pt-2 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Categorías
            </div>
            {categories.map((c) => (
                <Link
                    key={c.slug}
                    href={`/c/${c.slug}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                    <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ color: c.color ?? '#64748b' }}
                    >
                        {c.icon ?? 'tag'}
                    </span>
                    {c.name}
                </Link>
            ))}
        </nav>
    );
}
