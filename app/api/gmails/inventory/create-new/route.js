import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { emailTitle } = await request.json(); // get the email title from request body
    if (!emailTitle) {
      return NextResponse.json({ error: 'Email title is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Insert into gmail_inventory
    const { data, error } = await supabase
      .from('gmail_inventory')
      .insert([{ email: emailTitle, last_login: new Date().toISOString() }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email inserted successfully', data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}