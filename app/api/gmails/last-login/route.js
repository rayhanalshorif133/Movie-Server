import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  // Jodi ID na thake, error return korbe
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = await createClient();

  if (type == 'gmails') {
    const { data, error } = await supabase
      .from('gmails')
      .update({ last_login: new Date().toISOString().split('T')[0] })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } else {
    const { data, error } = await supabase
      .from('gmail_inventory')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  }

}