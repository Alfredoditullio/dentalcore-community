'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';

// ── Rules ───────────────────────────────────────────────────────

export async function acceptRules(): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Check if profile exists
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (profile) {
        // Existing profile — just stamp acceptance
        await supabase
            .from('profiles')
            .update({ rules_accepted_at: new Date().toISOString() })
            .eq('user_id', user.id);
        revalidatePath('/', 'layout');
        redirect('/');
    } else {
        // New user — go to onboarding after accepting
        // Store acceptance in a temporary way: we'll stamp it when profile is created
        revalidatePath('/', 'layout');
        redirect('/onboarding');
    }
}

// ── Profile ──────────────────────────────────────────────────────

export async function completeProfile(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const display_name = String(formData.get('display_name') ?? '').trim();
    const handleRaw = String(formData.get('handle') ?? '').trim().toLowerCase();
    const handle = handleRaw ? slugify(handleRaw).replace(/-/g, '_') : '';
    const specialty = String(formData.get('specialty') ?? '').trim() || null;
    const country = String(formData.get('country') ?? '').trim() || null;
    const bio = String(formData.get('bio') ?? '').trim() || null;

    if (display_name.length < 2) redirect('/onboarding?error=Ingresá+un+nombre+válido');
    if (!/^[a-z0-9_]{3,24}$/.test(handle)) redirect('/onboarding?error=Handle+inválido');

    const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, display_name, handle, specialty, country, bio, rules_accepted_at: new Date().toISOString() });

    if (error) {
        const msg = error.code === '23505' ? 'Ese handle ya está en uso' : error.message;
        redirect(`/onboarding?error=${encodeURIComponent(msg)}`);
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

// ── Posts ────────────────────────────────────────────────────────

export async function createPost(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const category_slug = String(formData.get('category_slug') ?? '').trim();
    const post_type_raw = String(formData.get('post_type') ?? '').trim();
    const post_type = ['help', 'resolved', 'debate', 'general'].includes(post_type_raw) ? post_type_raw : null;
    const attachment_urls = formData.getAll('attachment_urls').map(String).filter(Boolean);

    // Mercado metadata
    const listing_type = String(formData.get('listing_type') ?? '').trim();
    const price = String(formData.get('price') ?? '').trim() || null;
    const currency = String(formData.get('currency') ?? 'USD').trim();
    const item_condition = String(formData.get('item_condition') ?? '').trim() || null;
    const item_category = String(formData.get('item_category') ?? '').trim() || null;
    const item_location = String(formData.get('item_location') ?? '').trim() || null;

    let metadata: Record<string, any> = {};
    if (category_slug === 'mercado' && listing_type) {
        metadata = {
            listing_type,
            price,
            currency,
            condition: item_condition,
            item_category,
            location: item_location,
            is_sold: false,
        };
    }

    if (title.length < 4 || title.length > 200) redirect('/new?error=Título+entre+4+y+200+caracteres');
    if (body.length < 1 || body.length > 20000) redirect('/new?error=El+cuerpo+no+puede+estar+vacío');
    if (!category_slug) redirect('/new?error=Seleccioná+una+categoría');

    const { data, error } = await supabase
        .from('posts')
        .insert({ author_id: user.id, title, body, category_slug, post_type, attachment_urls, metadata })
        .select('id')
        .single();

    if (error) redirect(`/new?error=${encodeURIComponent(error.message)}`);

    revalidatePath('/');
    revalidatePath(`/c/${category_slug}`);
    redirect(`/p/${data!.id}`);
}

// ── Comments ─────────────────────────────────────────────────────

export async function createComment(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const postId = String(formData.get('post_id') ?? '');
    const body = String(formData.get('body') ?? '').trim();
    if (!postId || !body) return;

    await supabase
        .from('comments')
        .insert({ post_id: postId, author_id: user.id, body });

    revalidatePath(`/p/${postId}`);
}

// ── Likes ────────────────────────────────────────────────────────

export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
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

export async function signInWithPassword(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const next = String(formData.get('next') ?? '/');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) redirect(`/login?error=${encodeURIComponent('Email o contraseña incorrectos')}&next=${encodeURIComponent(next)}`);

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

export async function signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}

// ── Events ──────────────────────────────────────────────────────

export async function createEvent(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim() || null;
    const event_type = String(formData.get('event_type') ?? 'webinar');
    const priceRaw = String(formData.get('price') ?? '').trim();
    const is_free = !priceRaw;
    const price = priceRaw || null;
    const starts_at = String(formData.get('starts_at') ?? '');
    const ends_at = String(formData.get('ends_at') ?? '').trim() || null;
    const event_url = String(formData.get('event_url') ?? '').trim() || null;
    const location = String(formData.get('location') ?? '').trim() || null;

    if (title.length < 3) redirect('/eventos/nuevo?error=Título+muy+corto');
    if (!starts_at) redirect('/eventos/nuevo?error=Fecha+requerida');

    const { error } = await supabase
        .from('events')
        .insert({ author_id: user.id, title, description, event_type, is_free, price, starts_at, ends_at, event_url, location });

    if (error) redirect(`/eventos/nuevo?error=${encodeURIComponent(error.message)}`);

    revalidatePath('/eventos');
    redirect('/eventos');
}

// ── Polls ────────────────────────────────────────────────────────

export async function createPostWithPoll(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const category_slug = String(formData.get('category_slug') ?? '').trim();
    const post_type_raw = String(formData.get('post_type') ?? '').trim();
    const post_type = ['help', 'resolved', 'debate', 'general'].includes(post_type_raw) ? post_type_raw : null;
    const attachment_urls = formData.getAll('attachment_urls').map(String).filter(Boolean);

    // Poll fields
    const poll_question = String(formData.get('poll_question') ?? '').trim();
    const poll_options_raw = formData.getAll('poll_option').map(String).map(s => s.trim()).filter(Boolean);
    const poll_multiple = formData.get('poll_multiple') === 'true';
    const poll_closes_days = parseInt(String(formData.get('poll_closes_days') ?? '0'), 10);

    if (title.length < 4 || title.length > 200) redirect('/new?error=Título+entre+4+y+200+caracteres');
    if (body.length < 1 || body.length > 20000) redirect('/new?error=El+cuerpo+no+puede+estar+vacío');
    if (!category_slug) redirect('/new?error=Seleccioná+una+categoría');

    // Create the post
    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({ author_id: user.id, title, body, category_slug, post_type, attachment_urls })
        .select('id')
        .single();

    if (postError) redirect(`/new?error=${encodeURIComponent(postError.message)}`);

    // Create poll if question and at least 2 options provided
    if (poll_question && poll_options_raw.length >= 2) {
        const closes_at = poll_closes_days > 0
            ? new Date(Date.now() + poll_closes_days * 86400000).toISOString()
            : null;

        await supabase.from('polls').insert({
            post_id: postData!.id,
            question: poll_question,
            options: poll_options_raw,
            multiple_choice: poll_multiple,
            closes_at,
        });
    }

    revalidatePath('/');
    revalidatePath(`/c/${category_slug}`);
    redirect(`/p/${postData!.id}`);
}

export async function votePoll(pollId: string, optionIndex: number): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Check if poll is still open
    const { data: poll } = await supabase
        .from('polls')
        .select('closes_at, multiple_choice')
        .eq('id', pollId)
        .single();

    if (!poll) return;
    if (poll.closes_at && new Date(poll.closes_at) < new Date()) return;

    if (!poll.multiple_choice) {
        // Single choice: remove existing vote first
        await supabase
            .from('poll_votes')
            .delete()
            .eq('poll_id', pollId)
            .eq('user_id', user.id);
    }

    // Check if already voted this option
    const { data: existing } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .eq('option_index', optionIndex)
        .maybeSingle();

    if (existing) {
        // Toggle off
        await supabase.from('poll_votes').delete().eq('id', existing.id);
    } else {
        await supabase.from('poll_votes').insert({ poll_id: pollId, user_id: user.id, option_index: optionIndex });
    }

    // Get the post_id to revalidate
    const { data: pollData } = await supabase.from('polls').select('post_id').eq('id', pollId).single();
    if (pollData) {
        revalidatePath(`/p/${pollData.post_id}`);
    }
}

// ── Messages ────────────────────────────────────────────────────

export async function sendMessage(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const receiver_id = String(formData.get('receiver_id') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();

    if (!receiver_id || !body) return;
    if (receiver_id === user.id) return;
    if (body.length > 5000) return;

    await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id,
        body,
    });

    revalidatePath('/mensajes');
    revalidatePath(`/mensajes/${receiver_id}`);
}

export async function markMessagesAsRead(otherUserId: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)
        .is('read_at', null);

    revalidatePath('/mensajes');
}

// ── Follows ─────────────────────────────────────────────────────

export async function toggleFollow(targetUserId: string): Promise<{ following: boolean }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');
    if (user.id === targetUserId) return { following: false };

    const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

    if (existing) {
        await supabase.from('follows').delete().eq('id', existing.id);
    } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
    }

    revalidatePath('/directorio');
    revalidatePath('/mensajes');

    // Revalidate both profiles
    const { data: targetProfile } = await supabase.from('profiles').select('handle').eq('user_id', targetUserId).single();
    if (targetProfile) revalidatePath(`/u/${targetProfile.handle}`);

    const { data: myProfile } = await supabase.from('profiles').select('handle').eq('user_id', user.id).single();
    if (myProfile) revalidatePath(`/u/${myProfile.handle}`);

    return { following: !existing };
}
