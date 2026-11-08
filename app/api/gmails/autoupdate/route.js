import { convertMBtoGB } from '@/utils/common';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    const { data: movies, error: movieError } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (movieError) {
      console.error('Error fetching movies for autoupdate:', movieError.message);
      return NextResponse.json({ error: movieError.message }, { status: 500 });
    }

    const safeMovies = Array.isArray(movies) ? movies : [];
    let updatedGmailsCount = 0;

    if (safeMovies.length > 0) {
      const groupedData = {};

      safeMovies.forEach((item) => {
        const source = (item.movie_source || '').trim();
        if (!source || source.toLowerCase() === 'unknown') return;

        if (!groupedData[source]) {
          groupedData[source] = [];
        }
        groupedData[source].push({
          title: item.title,
          size: parseFloat(item.size) || 0
        });
      });

      const groupedArray = Object.entries(groupedData).map(([source, titles]) => ({
        movie_source: source,
        titles: titles.map(t => t.title).filter(Boolean),
        t_size: titles.reduce((acc, item) => acc + (item.size || 0), 0),
      }));

      for (const item of groupedArray) {
        const moviesText = item.titles.join(', ');
        const usedGB = convertMBtoGB(item.t_size, true);

        // Upsert into gmails table
        const { error: insertError } = await supabase
          .from('gmails')
          .upsert(
            [
              {
                name: item.movie_source,
                movies: moviesText,
                used_space: usedGB,
              },
            ],
            { onConflict: 'name' }
          );

        if (insertError) {
          console.error(`Error upserting ${item.movie_source}:`, insertError.message);
        } else {
          updatedGmailsCount++;
        }

        // Delete from inventory since this account is actively holding movies
        await supabase
          .from('gmail_inventory')
          .delete()
          .eq('email', item.movie_source);
      }
    }

    // Move any empty Gmail accounts (with 0 movies) back to gmail_inventory
    const { data: gmailsData, error: gmailsError } = await supabase
      .from('gmails')
      .select('*');

    if (!gmailsError && Array.isArray(gmailsData)) {
      for (const gmail of gmailsData) {
        const { data: movieCheck } = await supabase
          .from('movies')
          .select('movie_source')
          .eq('movie_source', gmail.name)
          .limit(1);

        if (!movieCheck || movieCheck.length === 0) {
          // Check if already in inventory
          const { data: existingInv } = await supabase
            .from('gmail_inventory')
            .select('id')
            .eq('email', gmail.name)
            .maybeSingle();

          if (!existingInv) {
            await supabase
              .from('gmail_inventory')
              .insert([{ email: gmail.name, last_login: gmail.last_login || null, is_used: false }]);
          }

          // Delete from gmails
          await supabase
            .from('gmails')
            .delete()
            .eq('id', gmail.id);
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Gmail storage data and movie allocations successfully synchronized.',
      updatedCount: updatedGmailsCount,
    });
  } catch (error) {
    console.error('Auto update error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Auto-update failed'
    }, { status: 500 });
  }
}
