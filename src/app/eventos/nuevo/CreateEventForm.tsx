'use client';

import { useTransition } from 'react';
import { createEvent } from '@/app/actions';

export function CreateEventForm() {
    const [isPending, startTransition] = useTransition();

    return (
        <form
            action={(fd) => startTransition(() => createEvent(fd))}
            className="space-y-4"
        >
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Título *</label>
                <input
                    name="title"
                    required
                    placeholder="Ej: Webinar de Endodoncia Regenerativa"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                    name="description"
                    rows={3}
                    placeholder="Contá de qué se trata el evento..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tipo *</label>
                    <select
                        name="event_type"
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="webinar">Webinar</option>
                        <option value="course">Curso</option>
                        <option value="congress">Congreso</option>
                        <option value="workshop">Taller</option>
                        <option value="meetup">Meetup</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Precio</label>
                    <div className="flex items-center gap-2">
                        <input
                            name="price"
                            placeholder="Gratis"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Fecha y hora *</label>
                    <input
                        name="starts_at"
                        type="datetime-local"
                        required
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Fin (opcional)</label>
                    <input
                        name="ends_at"
                        type="datetime-local"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Link del evento (Zoom, Meet, etc.)</label>
                <input
                    name="event_url"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ubicación (si es presencial)</label>
                <input
                    name="location"
                    placeholder="Ej: Buenos Aires, Argentina"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-primary/90 transition disabled:opacity-50"
            >
                {isPending ? 'Creando...' : 'Publicar Evento'}
            </button>
        </form>
    );
}
