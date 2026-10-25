"use client"
import MultiImageUploader from '@/components/common/MultiImageUploader';
import { deleteFileFromGoogleDrive, getGoogleDriveImageUrl } from '@/utils/google/manage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { RxCross2, RxCheck } from 'react-icons/rx';
import Swal from 'sweetalert2';

export default function ImageList({ images }) {
  const [imageIds, setImageIds] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [selectedForDelete, setSelectedForDelete] = useState([]);

  // ইনিশিয়াল ইমেজ লোড করা
  useEffect(() => {
    if (images && images.length > 0) {
      const ids = images.map((item) => item.drive_id);
      setImageIds(ids);
    }
  }, [images]);

  // নতুন আপলোড করা ছবিগুলো গ্যালারিতে যোগ করার জন্য ফাংশন
  const handleUploadSuccess = (newDriveIds) => {
    if (newDriveIds && newDriveIds.length > 0) {
      setImageIds((prev) => [...newDriveIds, ...prev]); // নতুন ছবি শুরুতে দেখাবে
    }
  };

  const toggleSelect = (id) => {
    setSelectedForDelete((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openSlider = (index) => setSelectedIdx(index);
  const closeSlider = () => setSelectedIdx(null);

  const nextSlide = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev + 1) % imageIds.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev - 1 + imageIds.length) % imageIds.length);
  };

  const deleteSelectedImages = async () => {
    if (selectedForDelete.length === 0) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedForDelete.length} image(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete all!',
    });

    if (result.isConfirmed) {
      try {
        setDeleteMessage(`Deleting ${selectedForDelete.length} image(s)...`);
        
        const deletePromises = selectedForDelete.map(async (id) => {
          await axios.delete(`/api/images/?drive_id=${id}`);
          return deleteFileFromGoogleDrive(id);
        });

        await Promise.all(deletePromises);

        setImageIds((prevIds) => prevIds.filter((id) => !selectedForDelete.includes(id)));
        setSelectedForDelete([]);
        setDeleteMessage('');

        Swal.fire('Deleted!', 'Selected images have been removed.', 'success');
        window.location.reload(); 
      } catch (error) {
        setDeleteMessage('');
        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      {/* Header & Uploader Section */}
      <div className="flex w-full flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className='w-1/2'>
          <h2 className="text-3xl font-extrabold text-gray-800">Google Drive Gallery</h2>
          <p className="text-gray-500 mt-1">Manage and view your uploaded media</p>
        </div>

        <div className="w-1/2 flex flex-wrap items-center gap-4">
          {/* MultiImageUploader integrated here */}
          <MultiImageUploader setDriveIds={handleUploadSuccess} />

          {selectedForDelete.length > 0 && (
            <button
              onClick={deleteSelectedImages}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
            >
              <RxCross2 />
              Delete ({selectedForDelete.length})
            </button>
          )}
        </div>
      </div>

      {/* Loading Message */}
      {deleteMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60]">
          <div className="flex items-center gap-3 bg-white border border-blue-200 text-blue-700 px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium text-sm italic">{deleteMessage}</span>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {imageIds.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {imageIds.map((id, index) => {
            const isSelected = selectedForDelete.includes(id);
            return (
              <div
                key={id}
                className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-4 ${
                  isSelected ? 'border-blue-500 scale-95' : 'border-transparent'
                }`}
              >
                <img
                  onClick={() => openSlider(index)}
                  src={getGoogleDriveImageUrl(id)}
                  alt={`Gallery Item ${index}`}
                  className="w-full h-52 object-cover group-hover:scale-110 transition duration-700 cursor-pointer"
                  loading="lazy"
                />

                <div 
                  onClick={() => toggleSelect(id)}
                  className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all border-2 ${
                    isSelected 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
                    : 'bg-white/40 backdrop-blur-md border-white/60 text-transparent hover:text-blue-500 hover:bg-white'
                  }`}
                >
                  <RxCheck size={20} weight="bold" />
                </div>
                
                {isSelected && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
          <p className="text-gray-400">No images found. Start uploading some!</p>
        </div>
      )}

      {/* Modal Slider */}
      {selectedIdx !== null && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <button 
            onClick={closeSlider} 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors"
          >
            <RxCross2 size={24} />
          </button>

          <button onClick={prevSlide} className="hidden md:block absolute left-8 text-white bg-white/10 hover:bg-white/20 p-5 rounded-full transition">
            <span className="text-2xl">❮</span>
          </button>

          <div className="relative max-w-5xl w-full flex flex-col items-center">
            <img
              src={getGoogleDriveImageUrl(imageIds[selectedIdx])}
              alt="Preview"
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
            <div className="mt-6 px-4 py-1.5 bg-white/10 rounded-full text-white/80 text-sm tracking-widest">
              {selectedIdx + 1} / {imageIds.length}
            </div>
          </div>

          <button onClick={nextSlide} className="hidden md:block absolute right-8 text-white bg-white/10 hover:bg-white/20 p-5 rounded-full transition">
            <span className="text-2xl">❯</span>
          </button>
        </div>
      )}
    </div>
  );
}