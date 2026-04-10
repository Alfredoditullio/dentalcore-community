import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth bridge: receives access_token + refresh_token from the SaaS
 * via URL params, sets the Supabase session cookie, and redirects to /
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const next = searchParams.get('next') ?? '/';
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

    if (!accessToken || !refreshToken) {
        return NextResponse.redirect(new URL(`${basePath}/login`, request.url));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    if (error) {
        return NextResponse.redirect(new URL(`${basePath}/login`, request.url));
    }

    // Check if user has a community profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, rules_accepted_at')
            .eq('user_id', user.id)
            .maybeSingle();

        if (!profile) {
            return NextResponse.redirect(new URL(`${basePath}/reglas`, request.url));
        }
        if (!profile.rules_accepted_at) {
            return NextResponse.redirect(new URL(`${basePath}/reglas`, request.url));
        }
    }

    return NextResponse.redirect(new URL(`${basePath}${next}`, request.url));
}
