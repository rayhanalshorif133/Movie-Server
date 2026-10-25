

import Sidebar from '@/components/admin/Sidebar';
import GameType from "@/components/admin/game/GameType";
import Header from "@/components/admin/Header";
import GameManagement from "@/components/admin/game/GameManagement";

export default async function Page({ searchParams }) {

    const resolvedSearchParams = await searchParams;
    const isUpdate = !!resolvedSearchParams.id;
  



    return (
        <div className="bg-gray-50 min-h-screen flex">
            <Sidebar />

            <div className="flex-1 ml-64 p-10">
                <Header title={'Manage Games'} publicURL={'/games'} pageTitle={'Games'} />
                <GameManagement isUpdate={isUpdate} game_id={resolvedSearchParams.id}/>
            </div>
        </div>
    );
}