import Link from 'next/link';
import { signInWithPassword } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
    const { next = '/', error } = await searchParams;

    return (
        <div className="max-w-sm mx-auto mt-8 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="text-center mb-6">
                <div className="size-12 rounded-xl bg-primary/10 mx-auto flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">Ingresar a la Comunidad</h1>
                <p className="text-sm text-slate-500 mt-1">Usá tu misma cuenta de DentalCore.</p>
            </div>

            <form action={signInWithPassword} className="space-y-3">
                <input type="hidden" name="next" value={next} />
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña</label>
                    <input
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>
                {error && (
                    <div className="bg-red-50 text-red-700 text-xs p-2 rounded">{error}</div>
                )}
                <button
                    type="submit"
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-700 transition"
                >
                    Ingresar
                </button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-4">
                ¿Todavía no tenés cuenta?{' '}
                <Link href="https://app.dentalcore.app/auth" className="text-primary font-semibold hover:underline">
                    Registrate en DentalCore
                </Link>
            </p>
        </div>
    );
}
