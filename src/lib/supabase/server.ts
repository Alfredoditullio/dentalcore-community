import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;

/**
 * Server-side Supabase client for Server Components, Server Actions and Route Handlers.
 * Uses the `community` schema by default so all queries against community tables work
 * without an explicit `.schema('community')` call.
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            db: { schema: 'community' },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            const opts: CookieOptions = {
                                ...options,
                                domain: COOKIE_DOMAIN ?? options.domain,
                            };
                            cookieStore.set(name, value, opts);
                        });
                    } catch {
                        // Called from a Server Component — Next.js forbids writes there.
                        // The middleware will refresh the session on the next request.
                    }
                },
            },
        }
    );
}

/** Auth-only client (queries the default public schema — used for `auth.users` via RPCs if needed). */
export async function createAuthClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, {
                                ...options,
                                domain: COOKIE_DOMAIN ?? options.domain,
                            });
                        });
                    } catch { /* noop in RSC */ }
                },
            },
        }
    );
}
