import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const s = searchParams.get('s');

        if (!s) return NextResponse.json({ error: "Share token is required" }, { status: 400 });

        const { data, error } = await supabase
            .from('movies')
            .select('*')
            .eq('share_data', s)
            .maybeSingle();

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
        const { movieId } = await request.json();

        if (!movieId) {
            return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
        }

        const randomString = crypto.randomBytes(10).toString('hex');

        const { data: updatedData, error: updateError } = await supabase
            .from('movies')
            .update({ share_data: randomString })
            .eq('id', movieId)
            .is('share_data', null)
            .select();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        if (!updatedData || updatedData.length === 0) {
            
            const { data: existingData, error: fetchError } = await supabase
                .from('movies')
                .select()
                .eq('id', movieId)
                .maybeSingle();

            if (fetchError) {
                return NextResponse.json({ error: fetchError.message }, { status: 500 });
            }

            if (!existingData) {
                return NextResponse.json({ error: "Movie not found" }, { status: 404 });
            }

            return NextResponse.json({ 
                message: "Data already exists, returned existing record", 
                data: existingData 
            }, { status: 200 });
        }

        return NextResponse.json({ 
            message: "Field updated successfully with random string", 
            data: updatedData[0] 
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
    }
}