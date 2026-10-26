import React from 'react';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/utils/supabase/server';
import StatCard from '@/components/admin/StatCard';
import ImageList from '@/components/admin/image/ImageList';

export const dynamic = 'force-dynamic';

// Metadata for the page
export async function generateMetadata() {
  return {
    title: "Images Gallery | Admin Panel",
  };
}

export default async function AdminImagesPage() {
  const supabase = await createClient();

  const { data: rawImages, error } = await supabase
    .from('galleries')
    .select('*')
    .order('id', { ascending: false });

  const images = Array.isArray(rawImages) ? rawImages : [];

  const statsConfig = [
    {
      label: "Total Images",
      count: images.length,
      accentClass: "border-l-pink-600",
      textClass: "text-slate-800"
    },
    {
      label: "Google Drive Assets",
      count: images.filter(img => img.drive_id).length,
      accentClass: "border-l-cyan-600",
      textClass: "text-slate-800"
    },
    {
      label: "Total Est. Storage",
      count: `${(images.length * 1.8).toFixed(1)} MB`,
      accentClass: "border-l-purple-600",
      textClass: "text-slate-800"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <Header title="Images Gallery" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsConfig.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              smallText="Asset Vault"
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
