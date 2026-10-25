import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const searchByTitle = searchParams.get('title');
    const searchByURL = searchParams.get('url');

    const supabase = await createClient();
    
    let query = supabase.from('games').select('id', { count: 'exact' });

    if (searchByTitle && searchByURL) {
        query = query.or(`title.ilike.%${searchByTitle}%,url.eq.${searchByURL}`);
    } else if (searchByTitle) {
        query = query.ilike('title', `%${searchByTitle}%`);
    } else if (searchByURL) {
        query = query.eq('url', searchByURL);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

   if (data && data.length > 0) {
        return NextResponse.json({ 
            status: "conflict",
            message: "⚠️ Duplicate entry found! This game or URL is already uploaded.", 
            exists: true,
            foundCount: data.length
        }, { status: 200 }); 
    }

    return NextResponse.json({ 
        status: "success",
        message: "✅ This is unique. You can proceed with the upload!", 
        exists: false 
    }, { status: 200 });
}