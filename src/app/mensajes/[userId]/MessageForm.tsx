'use client';

import { useRef, useTransition } from 'react';
import { sendMessage } from '@/app/actions';

export function MessageForm({ receiverId }: { receiverId: string }) {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function handleSubmit(formData: FormData) {
        const body = formData.get('body')?.toString().trim();
        if (!body) return;

        startTransition(async () => {
            await sendMessage(formData);
            formRef.current?.reset();
            textareaRef.current?.focus();
        });
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    }

    return (
        <form ref={formRef} action={handleSubmit} className="border-t border-slate-100 pt-4">
            <input type="hidden" name="receiver_id" value={receiverId} />
            <div className="flex items-end gap-3">
                <textarea
                    ref={textareaRef}
                    name="body"
                    required
                    rows={1}
                    maxLength={5000}
                    placeholder="Escribí un mensaje..."
                    onKeyDown={handleKeyDown}
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                    }}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="size-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50 shrink-0"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isPending ? 'progress_activity' : 'send'}
                    </span>
                </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
                Enter para enviar · Shift+Enter para nueva línea
            </p>
        </form>
    );
}
