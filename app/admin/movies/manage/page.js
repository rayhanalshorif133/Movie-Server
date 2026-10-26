import Header from '@/components/admin/Header';
import UpdateMovie from '@/components/admin/movie/UpdateMovie';
import UploadMovie from '@/components/admin/movie/UploadMovie';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const isUpdate = !!resolvedSearchParams?.id;
    return {
        title: `${isUpdate ? 'Edit Movie' : 'Publish Movie'} | Admin Panel`,
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
                title={isUpdate ? `Edit Movie: ${movie?.title || 'Loading...'}` : 'Publish New Movie'} 
                publicURL={'/'} 
                pageTitle={'Movies'}
            />
            {
                isUpdate ? <UpdateMovie movie={movie} /> : <UploadMovie />
            }
        </>
    );
}
