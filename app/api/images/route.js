import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// 1. GET Method: Unique types gulo fetch korbe
export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('galleries')
        .select('*'); 

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('galleries')
        .insert([body])
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });


}

export async function DELETE(request) {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get('drive_id');

    if (!driveId) {
        return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('galleries')
        .delete()
        .eq('drive_id', driveId) // Delete where id matches
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted successfully", data }, { status: 200 });
}