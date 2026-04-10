'use client';

import { useState } from 'react';

export function PollCreator({ enabled }: { enabled: boolean }) {
    const [showPoll, setShowPoll] = useState(false);
    const [options, setOptions] = useState(['', '']);

    if (!enabled) return null;

    function addOption() {
        if (options.length < 8) setOptions([...options, '']);
    }

    function removeOption(i: number) {
        if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
    }

    function updateOption(i: number, val: string) {
        setOptions(options.map((o, idx) => (idx === i ? val : o)));
    }

    if (!showPoll) {
        return (
            <button
                type="button"
                onClick={() => setShowPoll(true)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-semibold transition"
            >
                <span className="material-symbols-outlined text-[20px]">ballot</span>
                Agregar encuesta
            </button>
        );
    }

    return (
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                    <span className="material-symbols-outlined text-[20px]">ballot</span>
                    Encuesta
                </div>
                <button
                    type="button"
                    onClick={() => { setShowPoll(false); setOptions(['', '']); }}
                    className="text-xs text-slate-400 hover:text-red-500 font-semibold"
                >
                    Quitar encuesta
                </button>
            </div>

            <div>
                <input
                    name="poll_question"
                    placeholder="Pregunta de la encuesta"
                    maxLength={200}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
            </div>

            <div className="space-y-2">
                {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold w-5 text-center">{i + 1}</span>
                        <input
                            name="poll_option"
                            value={opt}
                            onChange={(e) => updateOption(i, e.target.value)}
                            placeholder={`Opción ${i + 1}`}
                            maxLength={100}
                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                        />
                        {options.length > 2 && (
                            <button
                                type="button"
                                onClick={() => removeOption(i)}
                                className="text-slate-300 hover:text-red-500 transition"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {options.length < 8 && (
                <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Agregar opción
                </button>
            )}

            <div className="flex items-center gap-4 pt-2 border-t border-indigo-200/50">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input type="hidden" name="poll_multiple" value="false" />
                    <input
                        type="checkbox"
                        name="poll_multiple"
                        value="true"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Permitir múltiples respuestas
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Cierra en</span>
                    <select
                        name="poll_closes_days"
                        className="border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                        <option value="0">Sin límite</option>
                        <option value="1">1 día</option>
                        <option value="3">3 días</option>
                        <option value="7">7 días</option>
                        <option value="14">14 días</option>
                        <option value="30">30 días</option>
                    </select>
                </label>
            </div>
        </div>
    );
}
