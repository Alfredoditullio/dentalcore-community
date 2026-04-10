import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AcceptRulesButton } from './AcceptRulesButton';

export const dynamic = 'force-dynamic';

const RULES = [
    {
        icon: 'handshake',
        title: 'Respeto profesional',
        description:
            'Tratamos a todos los colegas con respeto, sin importar su especialidad, experiencia o país. Debates clínicos sí, ataques personales no. Cero tolerancia a discriminación de cualquier tipo.',
    },
    {
        icon: 'shield_person',
        title: 'Protección de datos sensibles',
        description:
            'NUNCA compartir datos que identifiquen pacientes: nombres, DNI, fotos de rostros sin consentimiento, historias clínicas con datos visibles. Siempre anonimizá antes de publicar. Esto es ley (Ley 25.326 de Protección de Datos Personales).',
    },
    {
        icon: 'verified',
        title: 'Información basada en evidencia',
        description:
            'Cuando compartas protocolos, dosis o recomendaciones clínicas, citá fuentes confiables. Opiniones personales están bien, pero distinguilas de la evidencia. Evitá difundir información no verificada.',
    },
    {
        icon: 'storefront',
        title: 'Lo comercial va en el Mercado',
        description:
            'Querés vender instrumental, materiales o equipamiento? Usá la sección "Mercado" — está hecha para eso. En el resto de categorías, no se permiten publicaciones comerciales, spam ni autopromoción.',
    },
    {
        icon: 'gavel',
        title: 'Sin publicidad encubierta',
        description:
            'No se permiten posts que sean publicidad disfrazada de caso clínico o contenido educativo. Si tenés relación comercial con una marca o producto, declaralo. Transparencia siempre.',
    },
    {
        icon: 'forum',
        title: 'Contribuí con valor',
        description:
            'Antes de publicar, preguntate: "¿Esto le aporta algo a un colega?" Compartí casos, dudas, experiencias, recursos. Evitá posts vacíos, memes o contenido que no suma a la comunidad profesional.',
    },
    {
        icon: 'report',
        title: 'Reportá lo que no está bien',
        description:
            'Si ves contenido que viola estas reglas, reportalo. No te quedes callado/a. El equipo de moderación revisa cada reporte y actúa rápido. Entre todos mantenemos la calidad del espacio.',
    },
    {
        icon: 'block',
        title: 'Consecuencias',
        description:
            'Las violaciones a estas normas pueden resultar en: advertencia, suspensión temporal o expulsión permanente de la comunidad. Casos graves (compartir datos de pacientes, acoso) son expulsión directa.',
    },
];

export default async function ReglasPage({
    searchParams,
}: {
    searchParams: Promise<{ accept?: string }>;
}) {
    const { accept } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/reglas');

    // Check if already accepted
    const { data: profile } = await supabase
        .from('profiles')
        .select('rules_accepted_at')
        .eq('user_id', user.id)
        .maybeSingle();

    const needsAcceptance = accept === 'true' || !profile?.rules_accepted_at;
    const isFirstTime = !profile; // No profile yet = just registered

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-[32px]">security</span>
                        <h1 className="text-xl font-black">Normas de la Comunidad</h1>
                    </div>
                    <p className="text-sm text-white/85">
                        {isFirstTime
                            ? 'Antes de entrar, leé y aceptá las reglas de convivencia. Son simples: respeto, profesionalismo y cuidado de los pacientes.'
                            : 'Estas son las reglas que mantienen nuestra comunidad profesional y segura.'}
                    </p>
                </div>

                {/* Rules */}
                <div className="p-6 space-y-4">
                    {RULES.map((rule, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[20px] text-primary">{rule.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm">{rule.title}</h3>
                                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{rule.description}</p>
                            </div>
                        </div>
                    ))}

                    {/* Mercado highlight */}
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-[20px] text-emerald-600">storefront</span>
                            <span className="font-bold text-emerald-800 text-sm">Sobre el Mercado</span>
                        </div>
                        <p className="text-sm text-emerald-700">
                            Tenemos una sección dedicada para compraventa de instrumental, materiales y equipamiento entre colegas.
                            Publicá ahí y mantenemos el resto de la comunidad libre de spam. Todos ganan.
                        </p>
                    </div>
                </div>

                {/* Accept section */}
                {needsAcceptance && (
                    <div className="border-t border-slate-200 p-6 bg-slate-50">
                        <AcceptRulesButton />
                    </div>
                )}

                {!needsAcceptance && (
                    <div className="border-t border-slate-200 p-6 bg-emerald-50 text-center">
                        <div className="flex items-center justify-center gap-2 text-emerald-700">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span className="font-bold text-sm">
                                Aceptaste las normas el{' '}
                                {new Date(profile!.rules_accepted_at!).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
