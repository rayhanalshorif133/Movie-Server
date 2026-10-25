import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const textMessage = searchParams.get('text');

    // Text parameter na thakle error handle kora
    if (!textMessage) {
        return NextResponse.json({ error: "Text parameter is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 'sms_alart' table-e data insert
    const { data, error } = await supabase
        .from('sms_alart')
        .insert([{ text: textMessage }]) 
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Data inserted successfully", 
        data 
    });
}