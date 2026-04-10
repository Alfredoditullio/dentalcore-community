'use client';

import { useState, useTransition } from 'react';
import { createPost, createPostWithPoll } from '@/app/actions';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';
import { PollCreator } from './PollCreator';

const POST_TYPES = [
    { value: 'help', label: 'Pido ayuda', icon: 'help', color: 'bg-amber-100 text-amber-700', desc: 'Busco opinión de colegas sobre un caso en curso' },
    { value: 'resolved', label: 'Caso resuelto', icon: 'check_circle', color: 'bg-emerald-100 text-emerald-700', desc: 'Comparto un caso terminado y el plan aplicado' },
    { value: 'debate', label: 'Debate / pregunta', icon: 'forum', color: 'bg-indigo-100 text-indigo-700', desc: 'Discusión teórica o pregunta abierta a la comunidad' },
];

const LISTING_TYPES = [
    { value: 'sell', label: 'Vendo', icon: 'sell', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'buy', label: 'Compro', icon: 'shopping_cart', color: 'bg-blue-100 text-blue-700' },
    { value: 'trade', label: 'Permuto', icon: 'swap_horiz', color: 'bg-amber-100 text-amber-700' },
];

const ITEM_CONDITIONS = [
    { value: 'new', label: 'Nuevo / sin uso' },
    { value: 'like_new', label: 'Como nuevo' },
    { value: 'good', label: 'Buen estado' },
    { value: 'fair', label: 'Uso visible' },
];

const ITEM_CATEGORIES = [
    'Instrumental',
    'Equipamiento',
    'Materiales dentales',
    'Mobiliario clínico',
    'Radiología',
    'Ortodoncia',
    'Endodoncia',
    'Implantología',
    'Prótesis',
    'Libros / Cursos',
    'Otro',
];

const CATEGORY_COPY: Record<string, { heading: string; subtitle: string; titlePh: string; bodyPh: string }> = {
    presentaciones: {
        heading: 'Presentate a la comunidad',
        subtitle: 'Contanos quién sos, de dónde venís, qué hacés en tu día a día. Conocé colegas latinos.',
        titlePh: '¡Hola! Soy [tu nombre], odontólogo/a en…',
        bodyPh: '¿Dónde ejercés? ¿Tu área favorita? ¿Qué te trajo a DentalCore? Contá lo que quieras de vos.',
    },
    'casos-clinicos': {
        heading: 'Compartí un caso clínico',
        subtitle: 'Pedí segunda opinión, mostrá un caso resuelto o abrí un debate clínico.',
        titlePh: 'Ej. Molar con reabsorción externa, ¿ortopantomografía suficiente?',
        bodyPh: 'Contexto clínico, antecedentes, hallazgos, plan propuesto, tu duda concreta…',
    },
    'marketing-dental': {
        heading: 'Post en Marketing dental',
        subtitle: 'Canal oficial. Solo el equipo de DentalCore publica aquí.',
        titlePh: 'Un título claro y conciso',
        bodyPh: 'Contenido del post…',
    },
    'ia-tecnologia': {
        heading: 'Post en IA y tecnología',
        subtitle: 'Canal oficial. Solo el equipo de DentalCore publica aquí.',
        titlePh: 'Un título claro y conciso',
        bodyPh: 'Contenido del post…',
    },
    'novedades-dentalcore': {
        heading: 'Post en Novedades DentalCore',
        subtitle: 'Canal oficial. Solo el equipo de DentalCore publica aquí.',
        titlePh: 'Un título claro y conciso',
        bodyPh: 'Contenido del post…',
    },
    mercado: {
        heading: 'Publicar en el Mercado',
        subtitle: 'Comprá, vendé o permutá instrumental, materiales y equipamiento entre colegas.',
        titlePh: 'Ej: Vendo cavitron Satelec P5 Newtron',
        bodyPh: 'Describí el producto: marca, modelo, antigüedad, motivo de venta, incluye accesorios, forma de entrega/envío...',
    },
};

export function NewPostForm({
    categories,
    isAdmin,
    initialCategory,
    userId,
}: {
    categories: Category[];
    isAdmin: boolean;
    initialCategory?: string;
    userId: string;
}) {
    const lockedToCategory = Boolean(initialCategory);
    const [categorySlug, setCategorySlug] = useState(initialCategory ?? categories.find((c) => c.post_policy === 'open')?.slug ?? categories[0]?.slug);
    const [postType, setPostType] = useState<string>('help');
    const [listingType, setListingType] = useState<string>('sell');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const selectedCategory = categories.find((c) => c.slug === categorySlug);
    const isClinical = categorySlug === 'casos-clinicos';
    const isMercado = categorySlug === 'mercado';
    const isAdminOnlyCat = selectedCategory?.post_policy === 'admin_only';
    const canPost = !isAdminOnlyCat || isAdmin;
    const copy = CATEGORY_COPY[categorySlug ?? ''] ?? {
        heading: 'Nuevo post',
        subtitle: 'Compartí con la comunidad DentalCore.',
        titlePh: 'Un título claro y conciso',
        bodyPh: 'Contenido del post…',
    };

    function handleFiles(fileList: FileList | null) {
        if (!fileList) return;
        const newFiles = Array.from(fileList).slice(0, 6 - files.length);
        setFiles((prev) => [...prev, ...newFiles].slice(0, 6));
        newFiles.forEach((f) => {
            const reader = new FileReader();
            reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
            reader.readAsDataURL(f);
        });
    }

    function removeFile(i: number) {
        setFiles((prev) => prev.filter((_, idx) => idx !== i));
        setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    }

    async function uploadAttachments(): Promise<string[]> {
        if (files.length === 0) return [];
        const supabase = createClient();
        const urls: string[] = [];
        for (const file of files) {
            const ext = file.name.split('.').pop() || 'jpg';
            const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error: upErr } = await supabase.storage.from('community-attachments').upload(path, file, { cacheControl: '3600', upsert: false });
            if (upErr) throw new Error(upErr.message);
            const { data } = supabase.storage.from('community-attachments').getPublicUrl(path);
            urls.push(data.publicUrl);
        }
        return urls;
    }

    async function onSubmit(formData: FormData) {
        setError(null);
        try {
            setUploading(true);
            const urls = await uploadAttachments();
            setUploading(false);
            urls.forEach((u) => formData.append('attachment_urls', u));
            formData.set('category_slug', categorySlug);
            if (isClinical) formData.set('post_type', postType);
            if (isMercado) {
                formData.set('listing_type', listingType);
            }

            // Use poll-aware action if poll question is present
            const hasPoll = formData.get('poll_question')?.toString().trim();
            const action = hasPoll ? createPostWithPoll : createPost;

            startTransition(async () => {
                await action(formData);
            });
        } catch (e: any) {
            setUploading(false);
            setError(e.message ?? 'Error al subir imágenes');
        }
    }

    return (
        <form action={onSubmit} className="space-y-5">
            {/* Category: locked hero OR picker grid */}
            {lockedToCategory && selectedCategory ? (
                <div
                    className="flex items-start gap-3 p-4 rounded-xl border"
                    style={{
                        backgroundColor: (selectedCategory.color ?? '#0284c7') + '10',
                        borderColor: (selectedCategory.color ?? '#0284c7') + '40',
                    }}
                >
                    <div
                        className="size-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: (selectedCategory.color ?? '#0284c7') + '20' }}
                    >
                        <span className="material-symbols-outlined text-[24px]" style={{ color: selectedCategory.color ?? '#0284c7' }}>
                            {selectedCategory.icon ?? 'tag'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Publicando en</div>
                        <div className="text-base font-bold text-slate-900">{selectedCategory.name}</div>
                        {selectedCategory.description && (
                            <div className="text-xs text-slate-500 mt-0.5">{selectedCategory.description}</div>
                        )}
                    </div>
                    <a href="/new" className="text-xs text-slate-500 hover:text-slate-700 font-semibold shrink-0">
                        Cambiar
                    </a>
                </div>
            ) : (
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Categoría</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categories.map((c) => {
                            const locked = c.post_policy === 'admin_only' && !isAdmin;
                            const active = categorySlug === c.slug;
                            return (
                                <button
                                    type="button"
                                    key={c.slug}
                                    disabled={locked}
                                    onClick={() => setCategorySlug(c.slug)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition ${
                                        active
                                            ? 'border-primary bg-primary/5'
                                            : locked
                                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[22px]" style={{ color: c.color ?? '#64748b' }}>
                                        {c.icon ?? 'tag'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                                            {c.name}
                                            {locked && <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {!canPost && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            Esta categoría es solo para el equipo de DentalCore. Elegí otra para publicar.
                        </p>
                    )}
                </div>
            )}

            {/* Clinical post type */}
            {isClinical && canPost && (
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Tipo de post</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {POST_TYPES.map((t) => (
                            <button
                                type="button"
                                key={t.value}
                                onClick={() => setPostType(t.value)}
                                className={`px-3 py-3 rounded-lg border text-left transition ${
                                    postType === t.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`size-6 rounded-full flex items-center justify-center ${t.color}`}>
                                        <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                                    </span>
                                    <span className="text-sm font-bold text-slate-800">{t.label}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-tight">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Mercado fields */}
            {isMercado && canPost && (
                <div className="space-y-4 p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Tipo de publicación</label>
                        <div className="flex gap-2">
                            {LISTING_TYPES.map((t) => (
                                <button
                                    type="button"
                                    key={t.value}
                                    onClick={() => setListingType(t.value)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-bold transition ${
                                        listingType === t.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <input type="hidden" name="listing_type" value={listingType} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Precio</label>
                            <div className="flex">
                                <select
                                    name="currency"
                                    className="border border-r-0 border-slate-300 rounded-l-lg px-2 py-2 text-sm bg-slate-50 focus:outline-none"
                                >
                                    <option value="USD">USD</option>
                                    <option value="ARS">ARS</option>
                                    <option value="MXN">MXN</option>
                                    <option value="CLP">CLP</option>
                                    <option value="COP">COP</option>
                                    <option value="EUR">EUR</option>
                                </select>
                                <input
                                    name="price"
                                    type="text"
                                    placeholder={listingType === 'buy' ? 'Presupuesto' : 'Ej: 350'}
                                    className="flex-1 border border-slate-300 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">Dejá vacío si es a convenir</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Estado</label>
                            <select
                                name="item_condition"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            >
                                {ITEM_CONDITIONS.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Categoría del artículo</label>
                            <select
                                name="item_category"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            >
                                {ITEM_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Ubicación / Envío</label>
                            <input
                                name="item_location"
                                type="text"
                                placeholder="Ej: CABA, envío a todo el país"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Título</label>
                <input
                    name="title"
                    required
                    minLength={4}
                    maxLength={200}
                    disabled={!canPost}
                    placeholder={copy.titlePh}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-slate-50"
                />
            </div>

            {/* Body */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Contenido</label>
                <textarea
                    name="body"
                    required
                    minLength={1}
                    maxLength={20000}
                    rows={10}
                    disabled={!canPost}
                    placeholder={copy.bodyPh}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y disabled:bg-slate-50"
                />
            </div>

            {/* Poll (not for Mercado) */}
            {canPost && !isMercado && <PollCreator enabled={canPost} />}

            {/* Image upload */}
            {canPost && categorySlug !== 'presentaciones' && (
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                        Imágenes <span className="font-normal text-slate-400">(opcional, hasta 6)</span>
                    </label>
                    <label
                        htmlFor="file-input"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleFiles(e.dataTransfer.files);
                        }}
                        className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
                    >
                        <span className="material-symbols-outlined text-[36px] text-slate-400">cloud_upload</span>
                        <p className="text-sm font-semibold text-slate-600 mt-1">Arrastrá imágenes o hacé click</p>
                        <p className="text-xs text-slate-400">PNG, JPG, HEIC hasta 10MB cada una</p>
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </label>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                            {previews.map((src, i) => (
                                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="" className="size-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="absolute top-1 right-1 size-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <a href="/" className="px-4 py-2 text-sm text-slate-600 font-semibold hover:text-slate-900">
                    Cancelar
                </a>
                <button
                    type="submit"
                    disabled={!canPost || uploading || isPending}
                    className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {uploading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                    {uploading ? 'Subiendo…' : isPending ? 'Publicando…' : 'Publicar'}
                </button>
            </div>
        </form>
    );
}
