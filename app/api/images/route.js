import { createClient, mutateSheet } from '@/utils/supabase/server';
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

// 3. DELETE Method: Delete image(s) from Google Sheets AND Google Drive
export async function DELETE(request) {
    const supabase = await createClient();
    let itemsToDelete = [];

    // 1. Check query params (e.g. ?id=1520&drive_id=1xyz...)
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');
    const queryDriveId = searchParams.get('drive_id');

    if (queryId || queryDriveId) {
        itemsToDelete.push({
            id: queryId || null,
            drive_id: queryDriveId || null
        });
    } else {
        // 2. Check JSON body
        try {
            const body = await request.json();
            if (Array.isArray(body.items)) {
                itemsToDelete = body.items.map(i => ({
                    id: i.id || null,
                    drive_id: i.drive_id || i.fileId || null
                }));
            } else if (Array.isArray(body.drive_ids)) {
                itemsToDelete = body.drive_ids.map(d => ({
                    id: typeof d === 'object' ? (d.id || null) : null,
                    drive_id: typeof d === 'string' ? d : (d.drive_id || d.fileId || null)
                }));
            } else if (Array.isArray(body.ids)) {
                itemsToDelete = body.ids.map(id => ({
                    id: id,
                    drive_id: null
                }));
            } else if (body.id || body.drive_id) {
                itemsToDelete.push({
                    id: body.id || null,
                    drive_id: body.drive_id || null
                });
            }
        } catch (e) {
            // body could be empty or invalid json
        }
    }

    if (itemsToDelete.length === 0) {
        return NextResponse.json({ error: "Missing id or drive_id parameter" }, { status: 400 });
    }

    try {
        const driveIdsToDelete = [];

        for (const item of itemsToDelete) {
            const rowId = item.id ? String(item.id).trim() : null;
            const driveId = item.drive_id ? String(item.drive_id).trim() : null;

            // Delete from Google Sheet via direct mutation & supabase mock
            if (rowId) {
                await mutateSheet('galleries', 'delete', { id: rowId });
                await supabase.from('galleries').delete().eq('id', rowId);
            }
            if (driveId) {
                await mutateSheet('galleries', 'delete', { drive_id: driveId });
                await supabase.from('galleries').delete().eq('drive_id', driveId);
                
                // Only treat as Drive file if it looks like a real Google Drive ID (not a small numeric row id)
                if (driveId.length > 15 && !/^\d+$/.test(driveId)) {
                    driveIdsToDelete.push(driveId);
                }
            }
        }

        // Delete from Google Drive
        let driveDeleted = false;
        if (driveIdsToDelete.length > 0) {
            driveDeleted = await deleteFileFromGoogleDrive(driveIdsToDelete);
        }

        return NextResponse.json({
            status: "success",
            message: `Deleted ${itemsToDelete.length} image(s) from database and Google Drive successfully`,
            deletedCount: itemsToDelete.length,
            items: itemsToDelete,
            driveDeleted: driveDeleted
        }, { status: 200 });

    } catch (err) {
        console.error("DELETE /api/images error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
