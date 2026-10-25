import { createClient } from '@/utils/supabase/server';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const searchByTitle = searchParams.get('title') || '';
    const searchByType = searchParams.get('type') || '';
    const searchByID = searchParams.get('id') || '';



    const supabase = await createClient();
    let query = supabase.from('movies').select('*');

    if(searchByID) {
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
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase
        .from('movies')
        .insert([body]) 
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}

export async function PUT(request) {
    const supabase = await createClient();
    const body = await request.json();
    const { _id, ...updates } = body; 

    if (!_id) return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });

    const { data, error } = await supabase
        .from('movies')
        .update(updates)
        .eq('id', _id)
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request) {
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
}

