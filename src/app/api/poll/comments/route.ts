import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const postId = request.nextUrl.searchParams.get('postId');
    if (!postId) return NextResponse.json({ count: 0 });

    const supabase = await createClient();
    const { count } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('is_deleted', false);

    return NextResponse.json({ count: count ?? 0 });
}
