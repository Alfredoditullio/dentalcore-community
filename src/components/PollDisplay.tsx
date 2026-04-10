'use client';

import { useTransition } from 'react';
import { votePoll } from '@/app/actions';
import type { Poll, PollVote } from '@/lib/types';

interface PollDisplayProps {
    poll: Poll;
    votes: PollVote[];
    userId: string | null;
}

export function PollDisplay({ poll, votes, userId }: PollDisplayProps) {
    const [isPending, startTransition] = useTransition();
    const totalVotes = votes.length;
    const userVotes = userId ? votes.filter((v) => v.user_id === userId).map((v) => v.option_index) : [];
    const hasVoted = userVotes.length > 0;
    const isClosed = poll.closes_at ? new Date(poll.closes_at) < new Date() : false;
    const showResults = hasVoted || isClosed || !userId;

    // Count votes per option
    const voteCounts = poll.options.map((_, i) => votes.filter((v) => v.option_index === i).length);

    function handleVote(optionIndex: number) {
        if (!userId || isClosed) return;
        startTransition(() => votePoll(poll.id, optionIndex));
    }

    return (
        <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 my-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[20px] text-indigo-600">ballot</span>
                <h3 className="font-bold text-slate-800 text-sm">{poll.question}</h3>
            </div>

            <div className="space-y-2">
                {poll.options.map((option, i) => {
                    const count = voteCounts[i];
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isSelected = userVotes.includes(i);

                    return showResults ? (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleVote(i)}
                            disabled={isPending || isClosed || !userId}
                            className={`relative w-full text-left rounded-lg border px-3 py-2.5 transition overflow-hidden ${
                                isSelected
                                    ? 'border-indigo-400 bg-white'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            } disabled:cursor-default`}
                        >
                            {/* Progress bar background */}
                            <div
                                className={`absolute inset-0 rounded-lg transition-all ${
                                    isSelected ? 'bg-indigo-100' : 'bg-slate-100'
                                }`}
                                style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                                <span className="text-sm text-slate-800 flex items-center gap-2">
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-[16px] text-indigo-600">check_circle</span>
                                    )}
                                    {option}
                                </span>
                                <span className="text-xs font-bold text-slate-500 ml-2">{pct}%</span>
                            </div>
                        </button>
                    ) : (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleVote(i)}
                            disabled={isPending}
                            className="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 transition disabled:opacity-50"
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span>{totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}</span>
                {poll.multiple_choice && <span>· Múltiple elección</span>}
                {isClosed && (
                    <span className="text-red-400 font-semibold">· Encuesta cerrada</span>
                )}
                {poll.closes_at && !isClosed && (
                    <span>· Cierra {new Date(poll.closes_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                )}
            </div>
        </div>
    );
}
