import React from 'react';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/utils/supabase/server';
import StatCard from '@/components/admin/StatCard';
import ImageList from '@/components/admin/image/ImageList';


// Metadata for the page
export async function generateMetadata() {
  return {
    title: "Images | Admin Panel",
  };
}

export default async function AdminGmailsPage() {

  const supabase = await createClient();

  const { data: images, error } = await supabase
    .from('galleries')
    .select('*')
    .order('id', { ascending: false });

  const statsConfig = [
    {
      label: "Total Images",
      count: images.length,
      accentClass: "border-l-green-700",
      textClass: "text-gray-800"
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

        <ImageList images={images} />



      </main>
    </div>
  );
}