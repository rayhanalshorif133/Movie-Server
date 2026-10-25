import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // ১. এখানে error টি ডিস্ট্রাকচার করুন
    const { data: games, error: fetchError } = await supabase
        .from('games')
        .select('*');
    

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Success", data: games });

    if (games && games.length > 0) {
        const toInsert = games.flatMap(game => {
            if (!game.asset_images || !Array.isArray(game.asset_images)) return [];

            return game.asset_images.map(id => ({
                drive_id: id,
                url: `https://drive.google.com/uc?id=${id}`,
            }));
        });

        const { error: insertError } = await supabase
            .from('galleries')
            .insert(toInsert);

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Success", data: games });
}