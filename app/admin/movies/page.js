import React from 'react';
import { createClient } from '@/utils/supabase/server';
import MovieDataTable from '@/components/admin/movie/MovieDataTable';
import Header from '@/components/admin/Header';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    return {
        title: "Movies Catalog | Admin Panel",
    };
}

export default async function Page() {
    const supabase = await createClient();

    const { data: movies } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <>
            <Header title={'Movies Catalog'} publicURL={'/'} pageTitle={'Movies'} />
            <MovieDataTable initialMovies={movies || []} />
        </>
    );
}
