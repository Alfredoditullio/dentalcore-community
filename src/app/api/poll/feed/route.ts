import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createClient();
    const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false);

    return NextResponse.json({ count: count ?? 0 });
}
