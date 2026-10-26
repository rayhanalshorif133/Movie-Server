import { createClient } from '@/utils/supabase/server';
import { deleteFileFromGoogleDrive } from '@/utils/google/manage';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1. GET Method: Fetch all gallery images
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

// 2. POST Method: Insert new gallery image
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

// 3. DELETE Method: Delete image(s) from database AND Google Drive
export async function DELETE(request) {
    const supabase = await createClient();
    let driveIds = [];

    // Check query params
    const { searchParams } = new URL(request.url);
    const queryDriveId = searchParams.get('drive_id') || searchParams.get('id');
    if (queryDriveId) {
        driveIds = [queryDriveId];
    } else {
        // Check JSON body for single id or array of ids
        try {
            const body = await request.json();
            if (Array.isArray(body.drive_ids)) {
                driveIds = body.drive_ids;
            } else if (Array.isArray(body.ids)) {
                driveIds = body.ids;
            } else if (body.drive_id) {
                driveIds = [body.drive_id];
            } else if (body.id) {
                driveIds = [body.id];
            }
        } catch (e) {
            // body might be empty or query-only
        }
    }

    // Clean & filter valid non-empty IDs
    driveIds = driveIds.map(id => String(id).trim()).filter(Boolean);

    if (driveIds.length === 0) {
        return NextResponse.json({ error: "Missing drive_id or drive_ids parameter" }, { status: 400 });
    }

    try {
        // 1. Delete rows from database (galleries)
        for (const id of driveIds) {
            await supabase
                .from('galleries')
                .delete()
                .eq('drive_id', id);
        }

        // 2. Delete physical file(s) from Google Drive
        const driveDeleted = await deleteFileFromGoogleDrive(driveIds);

        return NextResponse.json({
            status: "success",
            message: `Deleted ${driveIds.length} image(s) successfully`,
            deletedCount: driveIds.length,
            driveIds: driveIds,
            driveDeleted: driveDeleted
        }, { status: 200 });

    } catch (err) {
        console.error("DELETE /api/images error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
