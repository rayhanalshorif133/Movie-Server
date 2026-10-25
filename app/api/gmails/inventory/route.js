import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get('page')) || 0;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search');
  const orderBy = searchParams.get('order_by') || 'created_at';

  const from = page * limit;
  const to = from + limit - 1;

  const supabase = await createClient();
  let query = supabase
    .from('gmail_inventory')
    .select('*', { count: 'exact' });

  // search filter
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // pagination + sorting
  const { data, count, error } = await query
    .order(orderBy, { ascending: true })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  });
}