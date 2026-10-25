import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {

    const supabase = await createClient();
    let query = supabase
        .from('movies')
        .select('type', { count: 'exact', head: false })
        .not('type', 'is', null);

    const { data, error } = await query;

    const uniqueTypes = [...new Set(data.map(item => item.type))];

    return NextResponse.json(uniqueTypes);
}