import Sidebar from '@/components/admin/Sidebar';
import Header from "@/components/admin/Header";
import GameManagement from "@/components/admin/game/GameManagement";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const isUpdate = !!resolvedSearchParams?.id;
    return {
        title: `${isUpdate ? 'Edit Game Asset' : 'Add Game Asset'} | Admin Panel`,
    };
}

export default async function Page({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const isUpdate = !!resolvedSearchParams.id;

    return (
        <div className="bg-gray-50 min-h-screen flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <Header 
                    title={isUpdate ? 'Edit Game Asset' : 'Add New Game Asset'} 
                    publicURL={'/games'} 
                    pageTitle={'Games'} 
                />
                <GameManagement isUpdate={isUpdate} game_id={resolvedSearchParams.id} />
            </div>
        </div>
    );
}
