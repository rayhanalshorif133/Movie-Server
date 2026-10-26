import React from 'react';
import Header from '@/components/admin/Header';
import { createClient } from '@/utils/supabase/server';
import StatCard from '@/components/admin/StatCard';
import GmailInventoryList from '@/components/admin/gmail/GmailInventoryList';
import { FcGoogle, FcDatabase, FcCheckmark } from 'react-icons/fc';

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
      iconBg: "bg-indigo-50/80 border-indigo-100",
      icon: <FcGoogle className="text-2xl" />
    },
    {
      label: "Allocated Accounts",
      count: usedGmailCount,
      smallText: `${(usedGmailCount || 0) * 15} GB Allocated`,
      accentClass: "border-l-blue-600",
      textClass: "text-blue-700",
      iconBg: "bg-blue-50/80 border-blue-100",
      icon: <FcDatabase className="text-2xl" />
    },
    {
      label: "Free Standby Accounts",
      count: unUsedGmailCount,
      smallText: `${(unUsedGmailCount || 0) * 15} GB Free`,
      accentClass: "border-l-emerald-600",
      textClass: "text-emerald-700",
      iconBg: "bg-emerald-50/80 border-emerald-100",
      icon: <FcCheckmark className="text-2xl" />
    }
  ];

  return (
    <>
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
              iconBg={stat.iconBg}
              icon={stat.icon}
            />
          ))}
        </div>
        
        <GmailInventoryList />
    </>
  );
}
