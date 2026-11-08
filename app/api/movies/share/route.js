import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const s = searchParams.get('s');
        const id = searchParams.get('id');

        if (!s && !id) {
            return NextResponse.json({ error: "Share token or Movie ID is required" }, { status: 400 });
        }

        let query = supabase.from('movies').select('*');
        if (s) {
            query = query.eq('share_data', s);
        } else if (id) {
            query = query.eq('id', id);
        }

        const { data, error } = await query.maybeSingle();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return NextResponse.json({ error: "Movie not found" }, { status: 404 });

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const movieId = body.movieId || body.id;

        if (!movieId) {
            return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
        }

        const { data: movie } = await supabase
            .from('movies')
            .select('*')
            .eq('id', movieId)
            .maybeSingle();

        if (!movie) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }

        let shareToken = movie.share_data;
        if (!shareToken) {
            shareToken = crypto.randomBytes(8).toString('hex');
            await supabase
                .from('movies')
                .update({ share_data: shareToken })
                .eq('id', movieId);
        }

        return NextResponse.json({ 
            status: "success",
            share_data: shareToken,
            data: { ...movie, share_data: shareToken }
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
    }
}
