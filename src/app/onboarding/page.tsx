import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { completeProfile } from '@/app/actions';

const COUNTRIES = ['Argentina','México','Colombia','Chile','Perú','Uruguay','Paraguay','Bolivia','Ecuador','Venezuela','Brasil','España','Otro'];
const SPECIALTIES = ['General','Endodoncia','Periodoncia','Ortodoncia','Cirugía','Implantología','Prótesis','Odontopediatría','Estética','Patología','Otro'];

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: existing } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
    if (existing) redirect('/');

    // Show step indicator

    return (
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-8 mt-4">
            {/* Progress steps */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1.5">
                    <span className="size-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">Normas</span>
                </div>
                <div className="flex-1 h-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                    <span className="size-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                    <span className="text-xs text-primary font-semibold">Perfil</span>
                </div>
                <div className="flex-1 h-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                    <span className="size-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center">3</span>
                    <span className="text-xs text-slate-400 font-semibold">Listo</span>
                </div>
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-1">Completá tu perfil</h1>
            <p className="text-sm text-slate-500 mb-6">
                Estos datos son públicos dentro de la comunidad. Podés editarlos cuando quieras.
            </p>

            <form action={completeProfile} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre completo</label>
                    <input
                        name="display_name"
                        required
                        maxLength={60}
                        placeholder="Dr/a. Nombre Apellido"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Usuario (handle)</label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                        <span className="pl-3 pr-1 text-sm text-slate-400">@</span>
                        <input
                            name="handle"
                            required
                            pattern="[a-zA-Z0-9_]{3,24}"
                            placeholder="dra_sanchez"
                            className="flex-1 px-0 py-2 text-sm focus:outline-none"
                        />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Único, 3-24 caracteres. Solo letras, números y _.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidad</label>
                        <select
                            name="specialty"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">País</label>
                        <select
                            name="country"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Bio (opcional)</label>
                    <textarea
                        name="bio"
                        rows={3}
                        maxLength={400}
                        placeholder="Contanos en una o dos líneas sobre vos y tu práctica."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-700 transition"
                >
                    Entrar a la comunidad
                </button>
            </form>
        </div>
    );
}
