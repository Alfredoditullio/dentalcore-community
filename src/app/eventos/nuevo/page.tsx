import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CreateEventForm } from './CreateEventForm';

export default async function NuevoEventoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?next=/eventos/nuevo');

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-primary text-[28px]">event</span>
                    <h1 className="text-xl font-black text-slate-900">Crear Evento</h1>
                </div>
                <CreateEventForm />
            </div>
        </div>
    );
}
