'use client';

import { createBrowserClient } from '@supabase/ssr';

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            db: { schema: 'community' },
            cookieOptions: COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN, sameSite: 'lax', secure: true } : undefined,
        }
    );
}
