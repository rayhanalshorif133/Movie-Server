import Header from '@/components/admin/Header';
import UpdateMovie from '@/components/admin/movie/UpdateMovie'
import UploadMovie from '@/components/admin/movie/UploadMovie'
import Sidebar from '@/components/admin/Sidebar'
import { createClient } from '@/utils/supabase/server';

export async function generateMetadata() {
    return {
        title: "Manage Movie | Admin Panel",
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
        <div className="bg-gray-50 flex">

            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <Header title={'Media Center'} publicURL={'/'} pageTitle={'Movies'}/>
                {
                    isUpdate ? <UpdateMovie movie={movie} /> : <UploadMovie />
                }
            </div>


        </div>
    )
}
