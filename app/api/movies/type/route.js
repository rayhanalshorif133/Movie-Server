import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// 1. GET: Fetch all movie types
export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format');

        // Fetch from movie_type
        const { data, error } = await supabase
            .from('movie_type')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        let types = data || [];

        // Fallback: If movie_type is empty, derive from movies table
        if (types.length === 0) {
            const { data: movies } = await supabase
                .from('movies')
                .select('type')
                .not('type', 'is', null);

            const uniqueNames = [...new Set((movies || []).map(m => m.type).filter(Boolean))];
            types = uniqueNames.map((name, idx) => ({
                id: String(idx + 1),
                name: name,
                created_at: new Date().toISOString()
            }));
        }

        if (format === 'names') {
            return NextResponse.json(types.map(t => (typeof t === 'object' ? t.name : t)));
        }

        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 2. POST: Create a new movie type
export async function POST(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const rawName = body?.name;

        if (!rawName || !rawName.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const cleanName = rawName.trim().toLowerCase();

        // Check for duplicate name
        const { data: existing } = await supabase
            .from('movie_type')
            .select('*')
            .eq('name', cleanName);

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: "Movie type already exists" }, { status: 409 });
        }

        const newRecord = {
            id: String(Date.now()),
            name: cleanName,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('movie_type')
            .insert([newRecord])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ message: "Created successfully", data: data || newRecord }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 3. PUT: Update an existing movie type
export async function PUT(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { id, name } = body;

        if (!id || !name || !name.trim()) {
            return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
        }

        const cleanName = name.trim().toLowerCase();

        // Check if another movie type has the same name
        const { data: existing } = await supabase
            .from('movie_type')
            .select('*')
            .eq('name', cleanName);

        if (existing && existing.some(item => String(item.id) !== String(id))) {
            return NextResponse.json({ error: "Another movie type already has this name" }, { status: 409 });
        }

        const { data, error } = await supabase
            .from('movie_type')
            .update({ name: cleanName })
            .eq('id', String(id))
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ message: "Updated successfully", data: data || { id, name: cleanName } });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 4. DELETE: Remove a movie type
export async function DELETE(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from('movie_type')
            .delete()
            .eq('id', String(id));

        if (error) throw error;
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
