import Header from '@/components/admin/Header';
import MovieManagement from '@/components/admin/movie/MovieManagement';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const isUpdate = !!resolvedSearchParams?.id;
    return {
        title: `${isUpdate ? 'Edit Movie' : 'Manage & Publish Movie'} | Admin Panel`,
    };
}

export default async function page({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const isUpdate = !!resolvedSearchParams.id;
    let movie = null;

    if (isUpdate) {
        const supabase = await createClient();
        const { data } = await supabase
            .from('movies')
            .select('*')
            .eq('id', resolvedSearchParams.id)
            .single();
        movie = data || null;
    }

    return (
        <>
            <Header 
                title={isUpdate ? `Edit Movie: ${movie?.title || 'Loading...'}` : 'Publish & Manage Movies'} 
                publicURL={'/'} 
                pageTitle={'Movies'}
            />
            <MovieManagement 
                isUpdate={isUpdate} 
                movie={movie} 
                initialTab={resolvedSearchParams.tab || (isUpdate ? 'upload' : 'upload')} 
            />
        </>
    );
}
