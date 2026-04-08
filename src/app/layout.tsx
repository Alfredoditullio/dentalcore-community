import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { TopNav } from '@/components/TopNav';
import { SidebarCategories } from '@/components/SidebarCategories';

export const metadata: Metadata = {
    title: 'Comunidad DentalCore',
    description: 'Comunidad privada de odontólogos latinos. Casos clínicos, marketing, IA y más.',
    icons: { icon: '/favicon.ico' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: categories }, profileRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        user
            ? supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
    ]);

    return (
        <html lang="es">
            <body>
                <TopNav user={user} profile={profileRes.data} />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
                    <aside className="hidden lg:block w-60 flex-shrink-0">
                        <SidebarCategories categories={categories ?? []} />
                    </aside>
                    <main className="flex-1 min-w-0">{children}</main>
                </div>
                <footer className="border-t border-slate-200 bg-white mt-12">
                    <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-500 flex items-center justify-between">
                        <span>Comunidad DentalCore · Beta</span>
                        <Link href="https://dentalcore.app" className="hover:text-primary">← Volver a la app</Link>
                    </div>
                </footer>
            </body>
        </html>
    );
}
