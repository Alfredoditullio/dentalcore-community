'use client';

import { useState, useTransition } from 'react';
import { acceptRules } from '@/app/actions';

export function AcceptRulesButton() {
    const [checked, setChecked] = useState(false);
    const [isPending, startTransition] = useTransition();

    return (
        <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="mt-0.5 size-5 rounded border-slate-300 text-primary focus:ring-primary/50"
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                    Leí y acepto las <strong>normas de la comunidad</strong>. Entiendo que su violación puede
                    resultar en la suspensión o eliminación de mi cuenta.
                </span>
            </label>

            <button
                onClick={() => startTransition(() => acceptRules())}
                disabled={!checked || isPending}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Procesando...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-[20px]">check</span>
                        Acepto las normas — Continuar
                    </>
                )}
            </button>
        </div>
    );
}
