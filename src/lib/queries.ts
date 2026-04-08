import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, CommentWithAuthor, PostWithAuthor, Profile } from '@/lib/types';

/**
 * Helpers that encapsulate the (somewhat ugly) FK-join syntax PostgREST requires
 * across schemas. All assume the client is scoped to the `community` schema.
 */

export async function fetchFeed(
    supabase: SupabaseClient,
    opts: { categorySlug?: string; limit?: number } = {}
): Promise<PostWithAuthor[]> {
    let q = supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            category:categories!posts_category_slug_fkey(*)
        `)
        .eq('is_deleted', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(opts.limit ?? 30);

    if (opts.categorySlug) q = q.eq('category_slug', opts.categorySlug);

    const { data, error } = await q;
    if (error) {
        console.error('[fetchFeed]', error);
        return [];
    }
    return (data ?? []) as unknown as PostWithAuthor[];
}

export async function fetchPost(
    supabase: SupabaseClient,
    id: string
): Promise<PostWithAuthor | null> {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            category:categories!posts_category_slug_fkey(*)
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .maybeSingle();
    if (error) {
        console.error('[fetchPost]', error);
        return null;
    }
    return data as unknown as PostWithAuthor | null;
}

export async function fetchComments(
    supabase: SupabaseClient,
    postId: string
): Promise<CommentWithAuthor[]> {
    const { data, error } = await supabase
        .from('comments')
        .select(`*, author:profiles!comments_author_id_fkey(*)`)
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
    if (error) {
        console.error('[fetchComments]', error);
        return [];
    }
    return (data ?? []) as unknown as CommentWithAuthor[];
}

export async function fetchProfileByHandle(
    supabase: SupabaseClient,
    handle: string
): Promise<Profile | null> {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .maybeSingle();
    return data as Profile | null;
}

export async function fetchCategories(supabase: SupabaseClient): Promise<Category[]> {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    return (data ?? []) as Category[];
}
