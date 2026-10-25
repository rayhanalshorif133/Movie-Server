import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// 1. GET: Fetch all game types
export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('game_type')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 2. POST: Create a new game type
export async function POST(request) {
    try {
        const supabase = await createClient();
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('game_type')
            .insert([{ name }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ message: "Created successfully", data }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 3. PUT: Update an existing game type
export async function PUT(request) {
    try {
        const supabase = await createClient();
        const { id, name } = await request.json();

        if (!id || !name) {
            return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('game_type')
            .update({ name })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ message: "Updated successfully", data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 4. DELETE: Remove a game type
export async function DELETE(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from('game_type')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}