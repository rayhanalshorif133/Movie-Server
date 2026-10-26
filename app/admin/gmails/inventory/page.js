import React from 'react';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/utils/supabase/server';
import StatCard from '@/components/admin/StatCard';
import GmailInventoryList from '@/components/admin/gmail/GmailInventoryList';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: "Storage Inventory | Admin Panel",
  };
}

export default async function AdminGmailsInventoryPage() {
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
      label: "Total Gmail Inventory",
      count: totalGmail,
      smallText: `${(totalGmail || 0) * 15} GB Pool`,
      accentClass: "border-l-indigo-600",
      textClass: "text-indigo-700",
      icon: <Mail className="w-5 h-5 text-indigo-600" />
    },
    {
      label: "Allocated Accounts",
      count: usedGmailCount,
      smallText: `${(usedGmailCount || 0) * 15} GB Allocated`,
      accentClass: "border-l-blue-600",
      textClass: "text-blue-700",
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />
    },
    {
      label: "Free Standby Accounts",
      count: unUsedGmailCount,
      smallText: `${(unUsedGmailCount || 0) * 15} GB Free`,
      accentClass: "border-l-emerald-600",
      textClass: "text-emerald-700",
      icon: <AlertCircle className="w-5 h-5 text-emerald-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <Header title="Storage Inventory" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {statsConfig.map((stat) => (
            <StatCard 
              key={stat.label}
              label={stat.label}
              smallText={stat.smallText}
              text={stat.count}
              accentClass={stat.accentClass}
              textClass={stat.textClass}
              icon={stat.icon}
            />
          ))}
        </div>
        
        <GmailInventoryList />
      </main>
    </div>
  );
}
