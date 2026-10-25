import Header from '@/components/admin/Header'
import Sidebar from '@/components/admin/Sidebar'
import React from 'react'
import { createClient } from '@/utils/supabase/server';
// Icons import korchi
import { Film, Gamepad2, Mail, MailCheck, MailWarning } from 'lucide-react';

export async function generateMetadata() {
  return {
    title: "Dashboard | Admin Panel",
  };
}

export default async function Page() {
    const supabase = await createClient();

    const [
        { count: movieCount },
        { count: gameCount },
        { count: gmailCount },
        { count: usedGmailCount },
        { count: availableGmailCount }
    ] = await Promise.all([
        supabase.from('movies').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('gmail_inventory').select('*', { count: 'exact', head: true }),
        supabase.from('gmails').select('*', { count: 'exact', head: true }),
        supabase.from('gmail_inventory').select('*', { count: 'exact', head: true }).eq('is_used', false)
    ]);

    // Icon soho stat data array
    const stats = [
        {
            label: 'Total Movies',
            value: movieCount,
            color: 'border-l-teal-500',
            textColor: 'text-teal-600',
            icon: <Film className="w-5 h-5 text-teal-500" />
        },
        {
            label: 'Games Assets',
            value: gameCount,
            color: 'border-l-blue-500',
            textColor: 'text-blue-600',
            icon: <Gamepad2 className="w-5 h-5 text-blue-500" />
        },
        {
            label: 'Total Gmails',
            value: gmailCount,
            color: 'border-l-indigo-500',
            textColor: 'text-indigo-600',
            icon: <Mail className="w-5 h-5 text-indigo-500" />
        },
        {
            label: 'Used Gmails',
            value: usedGmailCount,
            color: 'border-l-amber-500',
            textColor: 'text-amber-600',
            icon: <MailWarning className="w-5 h-5 text-amber-500" />
        },
        {
            label: 'Available Gmails',
            value: availableGmailCount,
            color: 'border-l-green-500',
            textColor: 'text-green-600',
            icon: <MailCheck className="w-5 h-5 text-green-500" />
        },
    ];

    return (
        <div className="bg-gray-50 flex min-h-screen">
            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <Header title={'Dashboard'} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 ${stat.color} hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                    {stat.label}
                                </span>
                                {stat.icon}
                            </div>
                            <div className={`text-3xl font-bold mt-3 ${stat.textColor}`}>
                                {stat.value ?? 0}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}