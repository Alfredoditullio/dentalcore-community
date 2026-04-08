'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';

// ── Profile ──────────────────────────────────────────────────────

export async function completeProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const display_name = String(formData.get('display_name') ?? '').trim();
    const handleRaw = String(formData.get('handle') ?? '').trim().toLowerCase();
    const handle = handleRaw ? slugify(handleRaw).replace(/-/g, '_') : '';
    const specialty = String(formData.get('specialty') ?? '').trim() || null;
    const country = String(formData.get('country') ?? '').trim() || null;
    const bio = String(formData.get('bio') ?? '').trim() || null;

    if (display_name.length < 2) return { error: 'Ingresá un nombre válido' };
    if (!/^[a-z0-9_]{3,24}$/.test(handle)) return { error: 'Handle inválido (3-24 chars, letras/números/_)' };

    const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, display_name, handle, specialty, country, bio });

    if (error) {
        if (error.code === '23505') return { error: 'Ese handle ya está en uso' };
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

// ── Posts ────────────────────────────────────────────────────────

export async function createPost(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const category_slug = String(formData.get('category_slug') ?? '').trim();

    if (title.length < 4 || title.length > 200) return { error: 'El título debe tener entre 4 y 200 caracteres' };
    if (body.length < 1 || body.length > 20000) return { error: 'El cuerpo no puede estar vacío' };
    if (!category_slug) return { error: 'Seleccioná una categoría' };

    const { data, error } = await supabase
        .from('posts')
        .insert({ author_id: user.id, title, body, category_slug })
        .select('id')
        .single();

    if (error) return { error: error.message };

    revalidatePath('/');
    revalidatePath(`/c/${category_slug}`);
    redirect(`/p/${data.id}`);
}

// ── Comments ─────────────────────────────────────────────────────

export async function createComment(postId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const body = String(formData.get('body') ?? '').trim();
    if (!body) return { error: 'El comentario no puede estar vacío' };

    const { error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_id: user.id, body });

    if (error) return { error: error.message };

    revalidatePath(`/p/${postId}`);
    return { ok: true };
}

// ── Likes ────────────────────────────────────────────────────────

export async function toggleLike(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: existing } = await supabase
        .from('likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
    }

    revalidatePath(`/p/${postId}`);
    revalidatePath('/');
    return { liked: !existing };
}

// ── Auth ─────────────────────────────────────────────────────────

export async function signInWithPassword(formData: FormData) {
    const supabase = await createClient();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const next = String(formData.get('next') ?? '/');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Email o contraseña incorrectos' };

    // If the user doesn't have a community profile yet, force onboarding.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();
        if (!profile) redirect('/onboarding');
    }

    redirect(next);
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}
