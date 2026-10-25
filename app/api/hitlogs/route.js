import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const supabase = await createClient();

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    const { searchParams } = new URL(request.url);
    const pagename = searchParams.get('pagename');

    // check existing row
    const { data: existing, error: findError } = await supabase
        .from('hitlogs')
        .select('*')
        .eq('ip_address', ip)
        .eq('page_name', pagename)
        .single();

    if (findError && findError.code !== 'PGRST116') {
        return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    let result;

    if (existing) {
        const { data, error } = await supabase
            .from('hitlogs')
            .update({ counter: existing.counter + 1 })
            .eq('ip_address', ip)
            .eq('page_name', pagename)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        result = data;
    } else {
        const { data, error } = await supabase
            .from('hitlogs')
            .insert({
                ip_address: ip,
                page_name: pagename,
                counter: 1
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        result = data;
    }

    return NextResponse.json(result);
}