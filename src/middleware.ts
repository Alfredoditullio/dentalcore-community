import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;

// Routes that require auth. Everything else is public (readable by anon users).
const PROTECTED_PREFIXES = ['/new', '/onboarding', '/settings', '/notifications', '/mensajes', '/eventos/nuevo'];
const RULES_EXEMPT = ['/reglas', '/login', '/onboarding', '/auth'];

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, {
                            ...options,
                            domain: COOKIE_DOMAIN ?? options.domain,
                        })
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const needsAuth = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));

    // Redirect to login if protected route and no user
    if (needsAuth && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('next', path);
        return NextResponse.redirect(loginUrl);
    }

    // Check rules acceptance for logged-in users trying to interact
    const isExempt = RULES_EXEMPT.some((p) => path === p || path.startsWith(p + '/'));
    if (user && needsAuth && !isExempt) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('rules_accepted_at')
            .eq('user_id', user.id)
            .maybeSingle();

        if (profile && !profile.rules_accepted_at) {
            const rulesUrl = request.nextUrl.clone();
            rulesUrl.pathname = '/reglas';
            rulesUrl.searchParams.set('accept', 'true');
            return NextResponse.redirect(rulesUrl);
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)'],
};
