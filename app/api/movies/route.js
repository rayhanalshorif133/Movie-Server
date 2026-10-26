import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const searchByTitle = searchParams.get('title') || '';
    const searchByType = searchParams.get('type') || '';
    const searchByID = searchParams.get('id') || '';

    const supabase = await createClient();
    let query = supabase.from('movies').select('*');

    if (searchByID) {
        query = query.eq('id', searchByID);
    }

    if (searchByTitle) {
        query = query.ilike('title', `%${searchByTitle}%`);
    }

    if (searchByType && searchByType != 'all' && searchByType != 'series') {
        query = query.eq('type', searchByType);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { data, error } = await supabase
            .from('movies')
            .insert([body]) 
            .select();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Failed to create movie" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const targetId = String(body._id || body.id || '').trim();

        if (!targetId) {
            return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
        }

        const { _id, id, ...updates } = body; 

        const { data, error } = await supabase
            .from('movies')
            .update(updates)
            .eq('id', targetId)
            .select();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message || "Failed to update movie" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });

        const supabase = await createClient();
        const { error } = await supabase
            .from('movies')
            .delete()
            .eq('id', id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ message: "Movie deleted successfully" });
    } catch (err) {
        return NextResponse.json({ error: err.message || "Failed to delete movie" }, { status: 500 });
    }
}
