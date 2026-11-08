import React from 'react';
import { createClient } from '@/utils/supabase/server';
import GameDataTable from '@/components/admin/game/GameDataTable';
import Header from '@/components/admin/Header';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    return {
        title: "Games & Assets | Admin Panel",
    };
}

export default async function Page() {
    const supabase = await createClient();

    const { data: games } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <>
            <Header title={'Games & Assets Catalog'} publicURL={'/games'} pageTitle={'Games'} />
            <GameDataTable initialGames={games || []} />
        </>
    );
}
