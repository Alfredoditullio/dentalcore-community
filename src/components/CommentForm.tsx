'use client';

import { useRef, useTransition } from 'react';
import { createComment } from '@/app/actions';

export function CommentForm({ postId }: { postId: string }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <form
            ref={formRef}
            action={(formData) => {
                startTransition(async () => {
                    await createComment(formData);
                    formRef.current?.reset();
                });
            }}
            className="space-y-2"
        >
            <input type="hidden" name="post_id" value={postId} />
            <textarea
                name="body"
                required
                minLength={1}
                maxLength={4000}
                rows={3}
                placeholder="Escribí un comentario…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-primary text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-60"
                >
                    {isPending ? 'Enviando…' : 'Comentar'}
                </button>
            </div>
        </form>
    );
}
