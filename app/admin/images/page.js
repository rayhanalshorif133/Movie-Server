import React from 'react';
import Header from '@/components/admin/Header';
import { createClient } from '@/utils/supabase/server';
import ImageList from '@/components/admin/image/ImageList';
import { HiOutlinePhoto, HiOutlineCloud, HiOutlineServer } from 'react-icons/hi2';

export const dynamic = 'force-dynamic';

// Metadata for the page
export async function generateMetadata() {
  return {
    title: "Images Gallery | Admin Panel",
  };
}

export default async function AdminImagesPage() {
  const supabase = await createClient();

  const { data: rawImages } = await supabase
    .from('galleries')
    .select('*')
    .order('id', { ascending: false });

  const images = Array.isArray(rawImages) ? rawImages : [];
  const driveAssets = images.filter(img => img.drive_id && img.drive_id.trim()).length;
  const estStorage = (images.length * 1.8).toFixed(1);

  return (
    <>
      <Header title={'Images Gallery'} publicURL={'/'} pageTitle={'Images'} />

        {/* Top Summary Stat Cards in Light Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-pink-600">
            <div className="p-3 bg-pink-50 rounded-xl text-pink-600 shrink-0">
              <HiOutlinePhoto size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Images</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{images.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-600">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
              <HiOutlineCloud size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Google Drive Assets</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{driveAssets}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-100 flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 shrink-0">
              <HiOutlineServer size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Total Storage</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{estStorage} MB</h3>
            </div>
          </div>
        </div>

        {/* Gallery Component */}
        <ImageList images={images} />
    </>
  );
}
