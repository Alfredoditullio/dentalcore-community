import Link from 'next/link';

const TABS = [
    { href: '/recursos/vademecum', label: 'Vademécum', icon: 'pill' },
    { href: '/recursos/atlas', label: 'Atlas patología oral', icon: 'biotech' },
    { href: '/recursos/glosario', label: 'Glosario', icon: 'menu_book' },
];

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-primary">library_books</span>
                    <h1 className="text-xl font-bold text-slate-900">Recursos</h1>
                </div>
                <p className="text-sm text-slate-500">
                    Referencia clínica curada para la comunidad. Contenido mantenido por el equipo de DentalCore.
                </p>
                <div className="flex gap-2 mt-4 border-b border-slate-100 -mx-6 px-6 pt-2">
                    {TABS.map((t) => (
                        <Link
                            key={t.href}
                            href={t.href}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary border-b-2 border-transparent hover:border-primary -mb-px transition"
                        >
                            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                            {t.label}
                        </Link>
                    ))}
                </div>
            </div>
            {children}
        </div>
    );
}
