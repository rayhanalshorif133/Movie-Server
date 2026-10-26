import GameList from '@/components/admin/game/GameList';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/utils/supabase/server';
import React from 'react';
import { Gamepad2, HardDrive, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    return {
        title: "Games & Assets | Admin Panel",
    };
}

export default async function Page({ searchParams }) {
    const supabase = await createClient();

    const resolvedSearchParams = await searchParams;

    const page = Number(resolvedSearchParams?.page ?? 1);
    const search = resolvedSearchParams?.search ?? '';
    const limit = 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let countQuery = supabase
        .from('games')
        .select('*', { count: 'exact', head: true });

    let dataQuery = supabase
        .from('games')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (search) {
        countQuery = countQuery.ilike('title', `%${search}%`);
        dataQuery = dataQuery.ilike('title', `%${search}%`);
    }

    const [
        { count: gameCount },
        { data: games }
    ] = await Promise.all([
        countQuery,
        dataQuery.range(from, to)
    ]);

    return (
        <div className="bg-gray-50 flex min-h-screen">
            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <Header title={'Games & Assets Catalog'} publicURL={'/games'} pageTitle={'Games'} />

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">
                    <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-violet-600">
                        <div className="p-3 bg-violet-50 rounded-xl text-violet-600 shrink-0">
                            <Gamepad2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                Total Games & Assets
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                                {gameCount ?? 0}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-indigo-600">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                Current Page
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                                Page {page} of {Math.ceil((gameCount || 1) / limit)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-emerald-600">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                Google Sheets Sync
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                                100% Online
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
    );
}
