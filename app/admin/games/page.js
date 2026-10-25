import GameList from '@/components/admin/game/GameList';
import Header from '@/components/admin/Header'
import Sidebar from '@/components/admin/Sidebar'
import { createClient } from '@/utils/supabase/server'
import React from 'react'
import { CgGames } from "react-icons/cg";



export async function generateMetadata() {
    return {
        title: "Game List | Admin Panel",
    };
}

export default async function page({ searchParams }) {
    const supabase = await createClient()

    const resolvedSearchParams = await searchParams;

    const page = Number(resolvedSearchParams?.page ?? 1)
    const search = resolvedSearchParams?.search ?? ''
    const limit = 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let countQuery = supabase
        .from('games')
        .select('*', { count: 'exact', head: true })

    let dataQuery = supabase
        .from('games')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (search) {
        countQuery = countQuery.ilike('title', `%${search}%`)
        dataQuery = dataQuery.ilike('title', `%${search}%`)
    }

    const [
        { count: gameCount },
        { data: games }
    ] = await Promise.all([
        countQuery,
        dataQuery.range(from, to)
    ])
    return (
        <div className="bg-gray-50 flex">

            <Sidebar />

            <div className="flex-1 ml-64 p-8">

                <Header title={'Gaming Zone'} publicURL={'/games'} pageTitle={'Games'} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
                            <CgGames size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Total Games & Assets
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {gameCount ?? 0}
                            </h3>
                        </div>
                    </div>
                </div>

                <GameList
                    gameData={games || []}
                    totalCount={gameCount || 0}
                    currentPage={page}
                    search={search}
                    limit={limit}
                />
            </div>

        </div>
    )
}
