import React from 'react';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/utils/supabase/server';
import StatCard from '@/components/admin/StatCard';
import GmailList from '@/components/admin/gmail/GmailList';
import GmailInventoryList from '@/components/admin/gmail/GmailInventoryList';


// Metadata for the page
export async function generateMetadata() {
  return {
    title: "Gmails | Admin Panel",
  };
}

export default async function AdminGmailsPage() {
  const supabase = await createClient();

  // Fetch all counts in parallel for optimal performance
  const [
    { count: totalGmail },
    { count: usedGmailCount },
    { count: unUsedGmailCount }
  ] = await Promise.all([
    supabase.from('gmail_inventory').select('*', { count: 'exact', head: true }),
    supabase.from('gmails').select('*', { count: 'exact', head: true }),
    supabase.from('gmail_inventory').select('*', { count: 'exact', head: true }).eq('is_used', false)
  ]);

  const statsConfig = [
    {
      label: "Total Gmails",
      count: totalGmail,
      accentClass: "border-l-green-700",
      textClass: "text-gray-800"
    },
    {
      label: "Used Gmails",
      count: usedGmailCount,
      accentClass: "border-l-teal-400",
      textClass: "text-gray-800"
    },
    {
      label: "Unused Gmails",
      count: unUsedGmailCount,
      accentClass: "border-l-yellow-400",
      textClass: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <Header title="Gmails" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsConfig.map((stat) => (
            <StatCard 
              key={stat.label}
              label={stat.label}
              smallText={`${stat.count * 15} GB`}
              text={stat.count}
              accentClass={stat.accentClass}
              textClass={stat.textClass}
            />
          ))}
        </div>
        <GmailInventoryList/>



      </main>
    </div>
  );
}