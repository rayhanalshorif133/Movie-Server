import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = await createClient();

  const { data: gmailsData, error: fetchError } = await supabase
    .from('gmails')
    .select('*'); 

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }


  return NextResponse.json({
    message: 'Successfully synced to gmail_inventory',
    syncedData: gmailsData
  });


}