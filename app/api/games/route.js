import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const searchByTitle = searchParams.get('title') || '';
    const searchByType = searchParams.get('type') || '';
    const game_id = searchParams.get('id') || '';

    const supabase = await createClient();


    let query = supabase.from('games').select('*');
    if (game_id) {
        
        query = supabase.from('games').select('*').eq('id', game_id).single();
        const { data: DataByID, error: errorByID } = await query;
        if (errorByID) {
            return NextResponse.json({ error: errorByID.message }, { status: 500 });
        }

        const formattedData = {
            ...DataByID,
            asset_images: DataByID.asset_images ? JSON.parse(DataByID.asset_images) : [],
            asset_gif_images: DataByID.asset_gif_images ? JSON.parse(DataByID.asset_gif_images) : []
        };

        return NextResponse.json(formattedData);
    }


    if (searchByTitle) {
        query = query.ilike('title', `%${searchByTitle}%`);
    }

    if (searchByType && searchByType != 'all' && searchByType != 'series') {
        query = query.eq('game_type', searchByType);
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

        const {
            title,
            url,
            size,
            asset_type,
            game_type,
            hidden_bar_gif,
            gmail,
            thumbnail_image,
            asset_images,
            asset_gif_images,
        } = body;

        // Validation (Optional but recommended)
        if (!title || !url) {
            return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
        }


        // Supabase-e data insert kora
        const { data, error } = await supabase
            .from('games')
            .insert([
                {
                    title,
                    url,
                    hidden_bar_gif: Boolean(hidden_bar_gif),
                    size: size ? parseFloat(size) : 0,
                    asset_type: asset_type || 'asset',
                    game_type,
                    gmail,
                    thumbnail_image,
                    asset_images: Array.isArray(asset_images) ? asset_images : [],
                    asset_gif_images: Array.isArray(asset_gif_images) ? asset_gif_images : [],
                }
            ])
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Asset created successfully", data }, { status: 201 });

    } catch (err) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}

export async function PUT(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            id, // আপডেট করার জন্য আইডি অবশ্যই লাগবে
            title,
            url,
            size,
            asset_type,
            game_type,
            hidden_bar_gif,
            gmail,
            thumbnail_image,
            asset_images,
            asset_gif_images,
        } = body;

        if (!id) {
            return NextResponse.json({ error: "Game ID is required for update" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('games')
            .update({
                title,
                url,
                hidden_bar_gif: hidden_bar_gif || false,
                size: size ? parseFloat(size) : 0,
                asset_type: asset_type || 'asset',
                game_type,
                gmail,
                thumbnail_image,
                asset_images: Array.isArray(asset_images) ? asset_images : [],
                asset_gif_images: Array.isArray(asset_gif_images) ? asset_gif_images : [],
            })
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Asset updated successfully", data }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}